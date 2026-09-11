"""Cadence Audio Engine.

Dual-Engine Architecture:
- Text-to-Speech (TTS) & Zero-Shot Voice Cloning: Resemble AI Chatterbox Turbo (PyTorch + Flow-Matching Vocoder)
- Speech-to-Text (STT) & Word Timestamps: OpenAI Whisper large-v3 (Native PyTorch CUDA)
- Storage: Cloudflare R2 direct container mount via modal.CloudBucketMount
- Hardware: NVIDIA A10G GPU with automatic scale-to-zero serverless lifecycle
"""

from typing import List, Optional
import modal

# R2 cloud bucket mount (read-only, replaces Modal Volume)
R2_BUCKET_NAME = "cadence"
R2_ACCOUNT_ID = "6e63b51e6884e8e15d81a980f3fd9856"
R2_MOUNT_PATH = "/r2"
r2_bucket = modal.CloudBucketMount(
    R2_BUCKET_NAME,
    bucket_endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    secret=modal.Secret.from_name("cloudflare-r2"),
    read_only=True,
)

# Modal Image with Chatterbox TTS and pure PyTorch OpenAI-Whisper
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("ffmpeg", "git")
    .pip_install("setuptools<70.0.0", "wheel")
    .pip_install(
        "chatterbox-tts==0.1.6",
        "peft==0.18.0",
        "fastapi[standard]==0.124.4",
        "python-multipart==0.0.20",
        "openai-whisper",
    )
)

app = modal.App("cadence", image=image)

with image.imports():
    import io
    import os
    from pathlib import Path

    import torch
    import torchaudio as ta
    import whisper
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    from fastapi import (
        Depends,
        FastAPI,
        HTTPException,
        Security,
        UploadFile,
        File,
        Form,
    )
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from fastapi.security import APIKeyHeader
    from pydantic import BaseModel, Field

    api_key_scheme = APIKeyHeader(
        name="x-api-key",
        scheme_name="ApiKeyAuth",
        auto_error=False,
    )

    def verify_api_key(x_api_key: str | None = Security(api_key_scheme)):
        expected = os.environ.get("CADENCE_API_KEY", "")
        if not expected or x_api_key != expected:
            raise HTTPException(status_code=403, detail="Invalid API key")
        return x_api_key

    class TTSRequest(BaseModel):
        """Request model for text-to-speech generation."""

        prompt: str = Field(..., min_length=1, max_length=5000)
        voice_key: str = Field(..., min_length=1, max_length=300)
        temperature: float = Field(default=0.8, ge=0.0, le=2.0)
        top_p: float = Field(default=0.95, ge=0.0, le=1.0)
        top_k: int = Field(default=1000, ge=1, le=10000)
        repetition_penalty: float = Field(default=1.2, ge=1.0, le=2.0)
        norm_loudness: bool = Field(default=True)

    class WordTimestamp(BaseModel):
        word: str
        start: Optional[float] = None
        end: Optional[float] = None
        score: Optional[float] = None
        speaker: Optional[str] = None

    class TranscriptionSegment(BaseModel):
        start: float
        end: float
        text: str
        speaker: Optional[str] = None
        words: Optional[List[WordTimestamp]] = None

    class TranscriptionResponse(BaseModel):
        language: Optional[str] = None
        duration: Optional[float] = None
        text: str
        segments: List[TranscriptionSegment]


@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("cadence-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
    volumes={R2_MOUNT_PATH: r2_bucket},
)
@modal.concurrent(max_inputs=10)
class CadenceEngine:
    @modal.enter()
    def load_model(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # 1. Load Chatterbox TTS
        self.tts_model = ChatterboxTurboTTS.from_pretrained(device=self.device)

        # 2. Load OpenAI Whisper (Pure PyTorch, zero C++ / cuDNN 8 dependency issues)
        self.stt_model = whisper.load_model("large-v3", device=self.device)

    @modal.asgi_app()
    def serve(self):
        web_app = FastAPI(
            title="Cadence Audio Engine (Chatterbox Turbo + OpenAI Whisper)",
            description="High-performance neural speech synthesis via Resemble AI Chatterbox Turbo and multilingual speech-to-text with word-level timestamps via OpenAI Whisper large-v3.",
            docs_url="/docs",
            dependencies=[Depends(verify_api_key)],
        )
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @web_app.post("/generate", responses={200: {"content": {"audio/wav": {}}}})
        def generate_speech(request: TTSRequest):
            voice_path = Path(R2_MOUNT_PATH) / request.voice_key
            if not voice_path.exists():
                raise HTTPException(
                    status_code=400,
                    detail=f"Voice not found at '{request.voice_key}'",
                )

            try:
                audio_bytes = self.generate.local(
                    request.prompt,
                    str(voice_path),
                    request.temperature,
                    request.top_p,
                    request.top_k,
                    request.repetition_penalty,
                    request.norm_loudness,
                )
                return StreamingResponse(
                    io.BytesIO(audio_bytes),
                    media_type="audio/wav",
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate audio: {e}",
                )

        @web_app.post("/transcribe", response_model=TranscriptionResponse)
        async def transcribe_audio(
            file: Optional[UploadFile] = File(None),
            audio_key: Optional[str] = Form(None),
            diarize: bool = Form(True),
            min_speakers: Optional[int] = Form(None),
            max_speakers: Optional[int] = Form(None),
        ):
            """Transcribe audio with word-level timestamps."""
            temp_path = None
            if audio_key:
                audio_path = Path(R2_MOUNT_PATH) / audio_key
                if not audio_path.exists():
                    raise HTTPException(
                        status_code=400,
                        detail=f"Audio not found at '{audio_key}' in R2",
                    )
                target_path = str(audio_path)
            elif file:
                import tempfile

                suffix = Path(file.filename or "audio.wav").suffix or ".wav"
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    content = await file.read()
                    tmp.write(content)
                    temp_path = tmp.name
                target_path = temp_path
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Either 'file' or 'audio_key' must be provided.",
                )

            try:
                result = self.transcribe.local(
                    target_path,
                    diarize=diarize,
                    min_speakers=min_speakers,
                    max_speakers=max_speakers,
                )
                return result
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to transcribe audio: {e}",
                )
            finally:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)

        return web_app

    @modal.method()
    def generate(
        self,
        prompt: str,
        audio_prompt_path: str,
        temperature: float = 0.8,
        top_p: float = 0.95,
        top_k: int = 1000,
        repetition_penalty: float = 1.2,
        norm_loudness: bool = True,
    ):
        wav = self.tts_model.generate(
            prompt,
            audio_prompt_path=audio_prompt_path,
            temperature=temperature,
            top_p=top_p,
            top_k=top_k,
            repetition_penalty=repetition_penalty,
            norm_loudness=norm_loudness,
        )

        buffer = io.BytesIO()
        ta.save(buffer, wav, self.tts_model.sr, format="wav")
        buffer.seek(0)
        return buffer.read()

    @modal.method()
    def transcribe(
        self,
        audio_path: str,
        diarize: bool = True,
        min_speakers: Optional[int] = None,
        max_speakers: Optional[int] = None,
    ):
        # 1. Transcribe with OpenAI-Whisper (native PyTorch, word_timestamps=True)
        transcribe_result = self.stt_model.transcribe(
            audio_path,
            word_timestamps=True,
            fp16=(self.device == "cuda"),
        )

        language = transcribe_result.get("language", "en")
        raw_segments = transcribe_result.get("segments", [])

        # 2. Format segments and word-level timestamps to match Cadence UI expectations
        formatted_segments = []
        speaker_label = "Speaker 1"

        for seg in raw_segments:
            seg_words = []
            for w in seg.get("words", []):
                seg_words.append(
                    {
                        "word": w.get("word", "").strip(),
                        "start": w.get("start", 0.0),
                        "end": w.get("end", 0.0),
                        "score": w.get("probability", 1.0),
                        "speaker": speaker_label,
                    }
                )

            formatted_segments.append(
                {
                    "start": seg.get("start", 0.0),
                    "end": seg.get("end", 0.0),
                    "text": seg.get("text", "").strip(),
                    "speaker": speaker_label,
                    "words": seg_words,
                }
            )

        full_text = transcribe_result.get("text", "").strip()
        duration = formatted_segments[-1]["end"] if formatted_segments else 0.0

        return {
            "language": language,
            "duration": duration,
            "text": full_text,
            "segments": formatted_segments,
        }


@app.local_entrypoint()
def test(
    prompt: str = "Cadence running on Modal.",
    voice_key: str = "voices/system/default.wav",
    output_path: str = "/tmp/cadence/output.wav",
    temperature: float = 0.8,
    top_p: float = 0.95,
    top_k: int = 1000,
    repetition_penalty: float = 1.2,
    norm_loudness: bool = True,
):
    import pathlib

    engine = CadenceEngine()
    audio_prompt_path = f"{R2_MOUNT_PATH}/{voice_key}"
    audio_bytes = engine.generate.remote(
        prompt=prompt,
        audio_prompt_path=audio_prompt_path,
        temperature=temperature,
        top_p=top_p,
        top_k=top_k,
        repetition_penalty=repetition_penalty,
        norm_loudness=norm_loudness,
    )

    pathlib.Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(audio_bytes)
    print(f"Audio saved to {output_path}")
