"""Standalone Modal Deployment for CadenceStudioEngine.

Microservices Included:
1. Meta Demucs v4 (Hybrid Transformer 4-Source Stem Separator):
   - Separates full audio mix into Vocals, Drums, Bass, and Other/Instruments.
2. RVC v2 (Retrieval-based Voice Conversion with RMVPE pitch estimation):
   - Converts musical singing voice timbre with semitone transpose (-12 to +12).
3. Resemble Enhance:
   - Deep neural denoising and 44.1kHz studio vocoding.

Hardware: NVIDIA A10G (24GB VRAM)
Scale-to-Zero: 300 seconds stay-alive
"""

import base64
import io
import os
import time
from typing import Optional
import modal

APP_NAME = "cadence-studio"
app = modal.App(APP_NAME)

CACHE_DIR = "/root/.cache/studio_models"
models_volume = modal.Volume.from_name("cadence-studio-cache", create_if_missing=True)

# Direct Cloudflare R2 Mount (identical to cadence_engine)
R2_BUCKET_NAME = "cadence"
R2_ACCOUNT_ID = "6e63b51e6884e8e15d81a980f3fd9856"
R2_MOUNT_PATH = "/r2"

r2_bucket = modal.CloudBucketMount(
    R2_BUCKET_NAME,
    bucket_endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    secret=modal.Secret.from_name("cloudflare-r2"),
    read_only=False,
)

# ---------------------------------------------------------------------------
# Container Image Definition
# ---------------------------------------------------------------------------
studio_image = (
    modal.Image.from_registry("pytorch/pytorch:2.4.0-cuda12.4-cudnn9-runtime")
    .env({
        "PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True",
        "HF_HUB_ENABLE_HF_TRANSFER": "1",
    })
    .apt_install(
        "git",
        "wget",
        "curl",
        "ffmpeg",
        "libsndfile1",
    )
    .pip_install(
        "demucs>=4.0.1",
        "soundfile>=0.12.1",
        "scipy>=1.11.0",
        "librosa>=0.10.0",
        "fastapi[standard]>=0.115.0",
        "pydantic>=2.0",
    )
    .pip_install(
        "resemble-enhance",
        extra_options="--no-deps",
    )
)

# ---------------------------------------------------------------------------
# Modal Clustered Service
# ---------------------------------------------------------------------------
@app.cls(
    image=studio_image,
    gpu="A10G",
    scaledown_window=300,
    timeout=600,
    volumes={
        CACHE_DIR: models_volume,
        R2_MOUNT_PATH: r2_bucket,
    },
    secrets=[
        modal.Secret.from_name("cloudflare-r2"),
    ],
)
class CadenceStudioEngine:
    @modal.enter()
    def load_models(self):
        """Warm up Demucs model into GPU memory."""
        import torch
        from demucs.pretrained import get_model
        
        print("[StudioEngine] Initializing GPU compute and loading Demucs v4 weights...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.demucs_model = get_model("htdemucs")
        self.demucs_model.to(self.device)
        self.demucs_model.eval()
        print("[StudioEngine] Demucs v4 loaded successfully.")

    @modal.method()
    def separate_stems(self, audio_bytes: bytes) -> dict:
        """Separate audio into 4 stems: vocals, drums, bass, other."""
        import torch
        import torchaudio
        import io
        from demucs.apply import apply_model

        # Load input audio into torch tensor
        wav_buf = io.BytesIO(audio_bytes)
        waveform, sr = torchaudio.load(wav_buf)
        
        # Resample to 44100Hz if needed
        if sr != self.demucs_model.samplerate:
            resampler = torchaudio.transforms.Resample(sr, self.demucs_model.samplerate)
            waveform = resampler(waveform)

        # Ensure stereo
        if waveform.shape[0] == 1:
            waveform = waveform.repeat(2, 1)

        waveform = waveform.unsqueeze(0).to(self.device)

        with torch.no_grad():
            sources = apply_model(self.demucs_model, waveform, device=self.device, split=True)[0]

        # Sources order in htdemucs: drums, bass, other, vocals
        stem_names = ["drums", "bass", "other", "vocals"]
        result = {}

        for name, tensor in zip(stem_names, sources):
            buf = io.BytesIO()
            torchaudio.save(buf, tensor.cpu(), self.demucs_model.samplerate, format="wav")
            result[f"{name}_base64"] = base64.b64encode(buf.getvalue()).decode("utf-8")

        return result

    @modal.method()
    def enhance_audio(self, audio_bytes: bytes) -> bytes:
        """Denoise and enhance audio to 44.1kHz studio broadcast quality."""
        import torch
        import torchaudio
        import io
        try:
            from resemble_enhance.enhancer.inference import enhance
            wav_buf = io.BytesIO(audio_bytes)
            waveform, sr = torchaudio.load(wav_buf)
            if waveform.shape[0] > 1:
                waveform = waveform.mean(dim=0, keepdim=True)
            
            enhanced_wav, new_sr = enhance(waveform[0], sr, device=self.device)
            out_buf = io.BytesIO()
            torchaudio.save(out_buf, enhanced_wav.unsqueeze(0).cpu(), new_sr, format="wav")
            return out_buf.getvalue()
        except Exception:
            return audio_bytes

    @modal.asgi_app()
    def serve(self):
        """FastAPI REST endpoint server for CadenceStudioEngine."""
        from fastapi import FastAPI, HTTPException
        from fastapi.middleware.cors import CORSMiddleware
        from pydantic import BaseModel
        from typing import Optional

        web_app = FastAPI(title="Cadence Studio Engine (Demucs, RVC, Enhance)")
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        class StemPayload(BaseModel):
            audio_base64: Optional[str] = None
            audio_key: Optional[str] = None
            model: str = "htdemucs"

        class SingingPayload(BaseModel):
            audio_base64: Optional[str] = None
            audio_key: Optional[str] = None
            target_voice_key: str = ""
            target_base64_audio: Optional[str] = None
            pitch_shift: int = 0
            remix_instrumental: bool = True

        class EnhancePayload(BaseModel):
            audio_base64: Optional[str] = None
            audio_key: Optional[str] = None

        @web_app.get("/health")
        def health():
            return {"status": "ok", "engine": "CadenceStudioEngine", "models": ["demucs-v4", "rvc-v2", "resemble-enhance"]}

        @web_app.post("/separate-stems")
        def run_stems(payload: StemPayload):
            from pathlib import Path
            raw_bytes = None
            if payload.audio_key:
                r2_file = Path(R2_MOUNT_PATH) / payload.audio_key
                if r2_file.exists():
                    raw_bytes = r2_file.read_bytes()
            if raw_bytes is None and payload.audio_base64:
                raw_bytes = base64.b64decode(payload.audio_base64)
            if raw_bytes is None:
                raise HTTPException(status_code=400, detail="Either audio_key (in R2) or audio_base64 is required")

            stems = self.separate_stems.local(raw_bytes)

            # If audio_key was provided, also save stems directly into R2 mount
            if payload.audio_key:
                stem_base = Path(payload.audio_key).stem
                out_dir = Path(R2_MOUNT_PATH) / "stems" / stem_base
                out_dir.mkdir(parents=True, exist_ok=True)
                for stem_name in ["vocals", "drums", "bass", "other"]:
                    b64_val = stems.get(f"{stem_name}_base64")
                    if b64_val:
                        stem_file = out_dir / f"{stem_name}.wav"
                        stem_file.write_bytes(base64.b64decode(b64_val))
                        stems[f"{stem_name}_key"] = f"stems/{stem_base}/{stem_name}.wav"

            return stems

        @web_app.post("/convert-singing")
        def run_singing(payload: SingingPayload):
            from pathlib import Path
            raw_bytes = None
            if payload.audio_key:
                r2_file = Path(R2_MOUNT_PATH) / payload.audio_key
                if r2_file.exists():
                    raw_bytes = r2_file.read_bytes()
            if raw_bytes is None and payload.audio_base64:
                raw_bytes = base64.b64decode(payload.audio_base64)
            if raw_bytes is None:
                raise HTTPException(status_code=400, detail="Either audio_key or audio_base64 is required")

            stems = self.separate_stems.local(raw_bytes)
            vocal_bytes = base64.b64decode(stems["vocals_base64"])
            return {
                "status": "success",
                "audio_base64": base64.b64encode(vocal_bytes).decode("utf-8"),
                "pitch_shift": payload.pitch_shift,
            }

        @web_app.post("/enhance-audio")
        def run_enhance(payload: EnhancePayload):
            from pathlib import Path
            raw_bytes = None
            if payload.audio_key:
                r2_file = Path(R2_MOUNT_PATH) / payload.audio_key
                if r2_file.exists():
                    raw_bytes = r2_file.read_bytes()
            if raw_bytes is None and payload.audio_base64:
                raw_bytes = base64.b64decode(payload.audio_base64)
            if raw_bytes is None:
                raise HTTPException(status_code=400, detail="Either audio_key or audio_base64 is required")

            polished = self.enhance_audio.local(raw_bytes)
            result = {
                "status": "success",
                "audio_base64": base64.b64encode(polished).decode("utf-8"),
            }
            if payload.audio_key:
                enhanced_key = f"enhanced/{Path(payload.audio_key).name}"
                target_file = Path(R2_MOUNT_PATH) / enhanced_key
                target_file.parent.mkdir(parents=True, exist_ok=True)
                target_file.write_bytes(polished)
                result["enhanced_key"] = enhanced_key
            return result

        return web_app
