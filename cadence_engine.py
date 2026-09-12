"""Cadence Multi-Modal Generative Engine on Modal.

Four Dedicated Serverless GPU Endpoints:
1. CadenceAudioEngine (`CADENCE_API_URL`):
   - Text-to-Speech (TTS) & Zero-Shot Cloning: Resemble AI Chatterbox Turbo
   - Speech-to-Text (STT) & Word Timestamps: OpenAI Whisper large-v3
   - Speech-to-Speech (STS) & Voice Changer: OpenVoice v2

2. CadenceSoundEngine (`CADENCE_SOUND_API_URL`):
   - Sound Effects & Foley (SFX): Meta AudioGen (Audiocraft)
   - Instrumental Beats & Loops: Meta MusicGen Melody (Audiocraft)

3. CadenceSongEngine (`CADENCE_SONG_API_URL`):
   - Full Vocal Songs with Lyrics & Harmonies: ACE-Step 1.5 Turbo

4. CadenceMediaEngine (`CADENCE_MEDIA_API_URL`):
   - Photorealistic Image Generation: SDXL-Turbo
   - Text-to-Video Generation: Wan2.1-T2V-1.3B

Storage:
- Cloudflare R2 direct container mount via modal.CloudBucketMount
- Modal persistent volume for weights caching
Hardware:
- NVIDIA A10G GPU per service with automatic scale-to-zero serverless lifecycle
"""

import io
import os
from pathlib import Path
from typing import List, Optional
import modal

# ---------------------------------------------------------------------------
# Storage & Volumes
# ---------------------------------------------------------------------------
R2_BUCKET_NAME = "cadence"
R2_ACCOUNT_ID = "6e63b51e6884e8e15d81a980f3fd9856"
R2_MOUNT_PATH = "/r2"

r2_bucket = modal.CloudBucketMount(
    R2_BUCKET_NAME,
    bucket_endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    secret=modal.Secret.from_name("cloudflare-r2"),
    read_only=True,
)

# Persistent volume for foundation models cache
model_cache_volume = modal.Volume.from_name("cadence-models-cache", create_if_missing=True)
CACHE_DIR = "/root/.cache/cadence_models"

# ---------------------------------------------------------------------------
# Modal Images
# ---------------------------------------------------------------------------
# Audio Image (Chatterbox, Whisper, OpenVoice, AudioGen, MusicGen)
audio_image = (
    modal.Image.debian_slim(python_version="3.11")
    .env({"PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True"})
    .apt_install(
        "ffmpeg",
        "git",
        "libsndfile1",
        "pkg-config",
        "libavformat-dev",
        "libavcodec-dev",
        "libavdevice-dev",
        "libavutil-dev",
        "libswscale-dev",
        "libswresample-dev",
        "libavfilter-dev",
    )
    .pip_install(
        # Core audio/ML deps shared by all audio models
        "peft==0.18.0",
        "fastapi[standard]==0.124.4",
        "python-multipart==0.0.20",
        "openai-whisper",
        "soundfile",
        "pydantic>=2.0.0",
        "huggingface_hub",
        "demucs",
        "torchmetrics",
        "encodec",
        "av",
        "xformers",
        "num2words",
        "spacy",
        "flashy>=0.0.1",
        "hydra-core>=1.1",
        "dora-search",
        "sentencepiece",
        "protobuf",
        "librosa",
        "pydub",
        "wavmark",
        "eng-to-ipa",
        "inflect",
        "unidecode",
        "pypinyin",
        "cn2an",
        "jieba",
        "langid",
        # Chatterbox TTS & conformer dependencies
        "diffusers==0.29.0",
        "conformer",
        "perth",
        "s3tokenizer",
        "chatterbox-tts==0.1.6",
    )
    .pip_install("audiocraft", extra_options="--no-deps")
    .pip_install("git+https://github.com/myshell-ai/OpenVoice.git", extra_options="--no-deps")
)

# Sound Image (Meta AudioGen Foley SFX & Meta MusicGen Instrumental Beats)
sound_image = (
    modal.Image.debian_slim(python_version="3.11")
    .env({"PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True"})
    .apt_install(
        "ffmpeg",
        "git",
        "libsndfile1",
        "pkg-config",
        "libavformat-dev",
        "libavcodec-dev",
        "libavdevice-dev",
        "libavutil-dev",
        "libswscale-dev",
        "libswresample-dev",
        "libavfilter-dev",
    )
    .pip_install(
        "peft==0.18.0",
        "fastapi[standard]==0.124.4",
        "python-multipart==0.0.20",
        "soundfile",
        "pydantic>=2.0.0",
        "huggingface_hub",
        "demucs",
        "torchmetrics",
        "encodec",
        "av",
        "xformers",
        "num2words",
        "spacy",
        "flashy>=0.0.1",
        "hydra-core>=1.1",
        "dora-search",
        "sentencepiece",
        "protobuf",
        "librosa",
        "pydub",
    )
    .pip_install("audiocraft", extra_options="--no-deps")
)

# Song Generation Image (ACE-Step 1.5 Turbo full vocal tracks)
song_image = (
    modal.Image.debian_slim(python_version="3.11")
    .env({"PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True"})
    .apt_install("git", "ffmpeg", "libsndfile1")
    .pip_install("git+https://github.com/ace-step/ACE-Step.git")
    .pip_install(
        "torchcodec",
        "soundfile",
        "fastapi[standard]==0.124.4",
        "python-multipart==0.0.20",
        "pydantic>=2.0.0",
        "huggingface_hub",
    )
)

# Media Image (SDXL-Turbo Images + Wan2.1 1.3B Video)
media_image = (
    modal.Image.debian_slim(python_version="3.11")
    .env({"PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True"})
    .apt_install("ffmpeg", "git")
    .pip_install(
        "torch",
        "torchvision",
        "git+https://github.com/huggingface/diffusers.git",
        "transformers>=4.40.0",
        "accelerate>=0.26.0",
        "sentencepiece",
        "opencv-python-headless",
        "fastapi[standard]==0.124.4",
        "python-multipart==0.0.20",
        "huggingface_hub",
        "pillow",
        "pydantic>=2.0.0",
    )
)

app = modal.App("cadence")

# ---------------------------------------------------------------------------
# Common Shared Authentication
# ---------------------------------------------------------------------------
def get_auth_verifier():
    from fastapi import HTTPException, Security
    from fastapi.security import APIKeyHeader

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

    return verify_api_key


# ===========================================================================
# 1. CadenceAudioEngine (TTS, STT, Voice Changer, SFX, Songs)
# ===========================================================================
@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("cadence-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
    volumes={
        R2_MOUNT_PATH: r2_bucket,
        CACHE_DIR: model_cache_volume,
    },
    image=audio_image,
)
@modal.concurrent(max_inputs=8)
class CadenceAudioEngine:
    @modal.enter()
    def load_audio_models(self):
        import torch
        import whisper
        from chatterbox.tts_turbo import ChatterboxTurboTTS

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # 1. Chatterbox TTS Turbo
        self.tts_model = ChatterboxTurboTTS.from_pretrained(device=self.device)

        # 2. OpenAI Whisper large-v3
        self.stt_model = whisper.load_model("large-v3", device=self.device)

        # 3. Tone Color Converter - lazy loaded
        self.tone_converter = None

    def _get_tone_converter(self):
        if self.tone_converter is None:
            from huggingface_hub import hf_hub_download
            from openvoice.api import ToneColorConverter

            ckpt_path = hf_hub_download(
                repo_id="myshell-ai/OpenVoiceV2",
                filename="converter/checkpoint.pth",
                cache_dir=CACHE_DIR,
            )
            config_path = hf_hub_download(
                repo_id="myshell-ai/OpenVoiceV2",
                filename="converter/config.json",
                cache_dir=CACHE_DIR,
            )
            converter = ToneColorConverter(config_path, device=self.device)
            converter.load_ckpt(ckpt_path)
            self.tone_converter = converter
        return self.tone_converter



    @modal.asgi_app()
    def serve(self):
        import torch
        import torchaudio as ta
        from fastapi import (
            Depends,
            FastAPI,
            HTTPException,
            UploadFile,
            File,
            Form,
        )
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import StreamingResponse
        from pydantic import BaseModel, Field

        verify_api_key = get_auth_verifier()

        web_app = FastAPI(
            title="Cadence Audio Engine",
            description="Complete neural audio suite: TTS, STT, Voice Conversion, Sound FX, and Song Generation.",
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

        class TTSRequest(BaseModel):
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

        class VoiceChangeRequest(BaseModel):
            source_audio_key: Optional[str] = None
            target_voice_key: str = Field(..., description="Target voice profile in R2")
            pitch_shift: int = Field(default=0, ge=-12, le=12, description="Pitch semitone shift (-12 to +12)")

        # -------------------------------------------------------------------
        # 1. Text-to-Speech
        # -------------------------------------------------------------------
        @web_app.post("/generate", responses={200: {"content": {"audio/wav": {}}}})
        def generate_speech(request: TTSRequest):
            voice_path = Path(R2_MOUNT_PATH) / request.voice_key
            if not voice_path.exists():
                raise HTTPException(
                    status_code=400,
                    detail=f"Voice not found at '{request.voice_key}'",
                )

            try:
                wav = self.tts_model.generate(
                    request.prompt,
                    audio_prompt_path=str(voice_path),
                    temperature=request.temperature,
                    top_p=request.top_p,
                    top_k=request.top_k,
                    repetition_penalty=request.repetition_penalty,
                    norm_loudness=request.norm_loudness,
                )
                buffer = io.BytesIO()
                ta.save(buffer, wav, self.tts_model.sr, format="wav")
                buffer.seek(0)

                return StreamingResponse(buffer, media_type="audio/wav")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to generate audio: {e}")
            finally:
                import gc
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        # -------------------------------------------------------------------
        # 2. Speech-to-Text with Timestamps
        # -------------------------------------------------------------------
        @web_app.post("/transcribe", response_model=TranscriptionResponse)
        async def transcribe_audio(
            file: Optional[UploadFile] = File(None),
            audio_key: Optional[str] = Form(None),
            diarize: bool = Form(True),
            min_speakers: Optional[int] = Form(None),
            max_speakers: Optional[int] = Form(None),
        ):
            temp_path = None
            if audio_key:
                audio_path = Path(R2_MOUNT_PATH) / audio_key
                if not audio_path.exists():
                    raise HTTPException(status_code=400, detail=f"Audio not found at '{audio_key}' in R2")
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
                raise HTTPException(status_code=400, detail="Either 'file' or 'audio_key' must be provided.")

            try:
                transcribe_result = self.stt_model.transcribe(
                    target_path,
                    word_timestamps=True,
                    fp16=(self.device == "cuda"),
                )

                language = transcribe_result.get("language", "en")
                raw_segments = transcribe_result.get("segments", [])
                formatted_segments = []
                speaker_label = "Speaker 1"

                for seg in raw_segments:
                    seg_words = []
                    for w in seg.get("words", []):
                        seg_words.append({
                            "word": w.get("word", "").strip(),
                            "start": w.get("start", 0.0),
                            "end": w.get("end", 0.0),
                            "score": w.get("probability", 1.0),
                            "speaker": speaker_label,
                        })
                    formatted_segments.append({
                        "start": seg.get("start", 0.0),
                        "end": seg.get("end", 0.0),
                        "text": seg.get("text", "").strip(),
                        "speaker": speaker_label,
                        "words": seg_words,
                    })

                full_text = transcribe_result.get("text", "").strip()
                duration = formatted_segments[-1]["end"] if formatted_segments else 0.0

                return {
                    "language": language,
                    "duration": duration,
                    "text": full_text,
                    "segments": formatted_segments,
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {e}")
            finally:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
                import gc
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        # -------------------------------------------------------------------
        # 3. Speech-to-Speech & Voice Changer (OpenVoice v2 Zero-Shot Tone Color)
        # -------------------------------------------------------------------
        @web_app.post("/voice-change", responses={200: {"content": {"audio/wav": {}}}})
        async def voice_change(
            file: Optional[UploadFile] = File(None),
            source_audio_key: Optional[str] = Form(None),
            target_voice_key: str = Form(...),
            pitch_shift: int = Form(0),
        ):
            target_voice_path = Path(R2_MOUNT_PATH) / target_voice_key
            if not target_voice_path.exists():
                raise HTTPException(status_code=400, detail=f"Target voice '{target_voice_key}' not found.")

            temp_source = None
            if source_audio_key:
                source_path = Path(R2_MOUNT_PATH) / source_audio_key
                if not source_path.exists():
                    raise HTTPException(status_code=400, detail=f"Source audio '{source_audio_key}' not found.")
                target_src = str(source_path)
            elif file:
                import tempfile
                suffix = Path(file.filename or "audio.wav").suffix or ".wav"
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    content = await file.read()
                    tmp.write(content)
                    temp_source = tmp.name
                target_src = temp_source
            else:
                raise HTTPException(status_code=400, detail="Either 'file' or 'source_audio_key' must be provided.")

            try:
                converter = self._get_tone_converter()
                
                # Extract speaker embeddings from source audio & target reference voice
                src_se = converter.extract_se([target_src])
                tgt_se = converter.extract_se([str(target_voice_path)])

                # Pitch shift if requested (via librosa pitch shift before tone conversion)
                processed_src = target_src
                temp_pitched = None
                if pitch_shift != 0:
                    import librosa
                    import soundfile as sf
                    y, sr = librosa.load(target_src, sr=converter.hps.data.sampling_rate)
                    y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=pitch_shift)
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_p:
                        sf.write(tmp_p.name, y_shifted, sr)
                        temp_pitched = tmp_p.name
                    processed_src = temp_pitched

                # Convert tone color: preserves exact rhythm, intonation, speed, and emotion
                converted_audio = converter.convert(
                    audio_src_path=processed_src,
                    src_se=src_se,
                    tgt_se=tgt_se,
                    output_path=None,
                    tau=0.3,
                )

                if temp_pitched and os.path.exists(temp_pitched):
                    os.remove(temp_pitched)

                buffer = io.BytesIO()
                import soundfile as sf
                sf.write(buffer, converted_audio, converter.hps.data.sampling_rate, format="WAV")
                buffer.seek(0)
                return StreamingResponse(buffer, media_type="audio/wav")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Voice conversion failed: {e}")
            finally:
                if temp_source and os.path.exists(temp_source):
                    os.remove(temp_source)
                import gc
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        return web_app


# ===========================================================================
# 2. CadenceSoundEngine (Meta AudioGen SFX & Meta MusicGen Beats)
# ===========================================================================
@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("cadence-api-key"),
    ],
    volumes={
        CACHE_DIR: model_cache_volume,
    },
    image=sound_image,
)
@modal.concurrent(max_inputs=4)
class CadenceSoundEngine:
    @modal.enter()
    def setup_sound_models(self):
        import torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.audiogen_model = None
        self.musicgen_model = None

    def _get_audiogen(self):
        if self.audiogen_model is None:
            from audiocraft.models import AudioGen
            self.audiogen_model = AudioGen.get_pretrained("facebook/audiogen-medium")
        return self.audiogen_model

    def _get_musicgen(self):
        if self.musicgen_model is None:
            from audiocraft.models import MusicGen
            self.musicgen_model = MusicGen.get_pretrained("facebook/musicgen-melody")
        return self.musicgen_model

    @modal.asgi_app()
    def serve(self):
        import io
        import gc
        import torch
        import torchaudio as ta
        from fastapi import Depends, FastAPI, HTTPException
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import StreamingResponse
        from pydantic import BaseModel, Field

        verify_api_key = get_auth_verifier()

        sound_app = FastAPI(
            title="Cadence Sound & Foley Engine",
            description="Dedicated API for AudioGen SFX Foley and MusicGen Instrumental Beats.",
            docs_url="/docs",
            dependencies=[Depends(verify_api_key)],
        )
        sound_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        class SoundFXRequest(BaseModel):
            prompt: str = Field(..., min_length=1, max_length=1000, description="Sound effect prompt")
            duration: float = Field(default=5.0, ge=1.0, le=30.0)

        class BeatsGenRequest(BaseModel):
            prompt: str = Field(..., min_length=1, max_length=2000, description="Beat style, tempo, instruments - no vocals")
            duration: int = Field(default=30, ge=10, le=120, description="Duration in seconds")

        class SongGenRequest(BaseModel):
            prompt: str = Field(..., min_length=1, max_length=2000, description="Musical genre, tempo, mood, and style tags")
            lyrics: Optional[str] = Field(default="", description="Structured lyrics with [Verse], [Chorus], etc.")
            duration: int = Field(default=60, ge=10, le=240, description="Duration in seconds")

        @sound_app.get("/health")
        def health():
            return {"status": "ok", "engine": "sound", "models": ["audiogen-medium", "musicgen-melody"]}

        # -------------------------------------------------------------------
        # 1. Sound Effects & Foley (AudioGen)
        # -------------------------------------------------------------------
        @sound_app.post("/generate-sound", responses={200: {"content": {"audio/wav": {}}}})
        def generate_sound(request: SoundFXRequest):
            try:
                import soundfile as sf
                audiogen = self._get_audiogen()
                audiogen.set_generation_params(duration=request.duration)
                wav = audiogen.generate([request.prompt])

                # Convert torch tensor (shape [1, channels, samples] or [channels, samples]) to numpy (samples, channels)
                audio_np = wav[0].detach().cpu().float().numpy().squeeze(0)
                buffer = io.BytesIO()
                sf.write(buffer, audio_np, audiogen.sample_rate, format="WAV")
                buffer.seek(0)
                return StreamingResponse(buffer, media_type="audio/wav")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to generate sound effects: {e}")
            finally:
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        # -------------------------------------------------------------------
        # 2. Beats & Instrumental Generation (MusicGen)
        # -------------------------------------------------------------------
        @sound_app.post("/generate-beats", responses={200: {"content": {"audio/wav": {}}}})
        def generate_beats(request: BeatsGenRequest):
            try:
                import soundfile as sf
                musicgen = self._get_musicgen()
                musicgen.set_generation_params(duration=min(request.duration, 120))
                wav = musicgen.generate([request.prompt])

                audio_np = wav[0].detach().cpu().float().numpy().squeeze(0)
                buffer = io.BytesIO()
                sf.write(buffer, audio_np, musicgen.sample_rate, format="WAV")
                buffer.seek(0)

                return StreamingResponse(
                    buffer,
                    media_type="audio/wav",
                    headers={"x-beats-duration": str(request.duration)},
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to generate beats: {e}")
            finally:
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        # -------------------------------------------------------------------
        # 3. Song Fallback (MusicGen)
        # -------------------------------------------------------------------
        @sound_app.post("/generate-song", responses={200: {"content": {"audio/wav": {}}}})
        def generate_song_fallback(request: SongGenRequest):
            try:
                import soundfile as sf
                musicgen = self._get_musicgen()
                musicgen.set_generation_params(duration=min(request.duration, 120))
                lyrics_hint = request.lyrics[:300] if request.lyrics else ""
                full_prompt = f"{request.prompt}. {lyrics_hint}".strip()
                wav = musicgen.generate([full_prompt])

                audio_np = wav[0].detach().cpu().float().numpy().squeeze(0)
                buffer = io.BytesIO()
                sf.write(buffer, audio_np, musicgen.sample_rate, format="WAV")
                buffer.seek(0)
                return StreamingResponse(
                    buffer,
                    media_type="audio/wav",
                    headers={"x-song-duration": str(request.duration), "x-model": "musicgen-fallback"},
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to generate song: {e}")
            finally:
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        return sound_app


# ===========================================================================
# 3. CadenceSongEngine (ACE-Step 1.5 Turbo for Full Vocal Songs with Lyrics)
# ===========================================================================
@app.cls(
    gpu="a10g",
    timeout=600,
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("cadence-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
    volumes={
        CACHE_DIR: model_cache_volume,
        R2_MOUNT_PATH: r2_bucket,
    },
    image=song_image,
)
@modal.concurrent(max_inputs=4)
class CadenceSongEngine:
    @modal.enter()
    def setup_song_pipeline(self):
        import os
        import torch
        from huggingface_hub import snapshot_download
        from acestep.pipeline_ace_step import ACEStepPipeline

        self.checkpoint_dir = os.path.join(CACHE_DIR, "ace_step")
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        print("Ensuring ACE-Step-v1-3.5B checkpoint is cached...")
        snapshot_download(
            repo_id="ACE-Step/ACE-Step-v1-3.5B",
            local_dir=self.checkpoint_dir,
            local_dir_use_symlinks=False,
        )
        print("Loading ACE-Step pipeline...")
        self.pipeline = ACEStepPipeline(
            checkpoint_dir=self.checkpoint_dir,
            dtype="bfloat16",
            torch_compile=False,
        )
        self.pipeline.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.pipeline.load_checkpoint(self.checkpoint_dir)
        print("ACE-Step pipeline ready for vocal songs!")

    @modal.asgi_app()
    def serve(self):
        from fastapi import FastAPI, HTTPException, Depends, Response
        from pydantic import BaseModel, Field
        import os
        import uuid

        song_app = FastAPI(title="Cadence Song Engine (ACE-Step 1.5 Turbo)")
        verify_api_key = get_auth_verifier()

        class SongGenRequest(BaseModel):
            prompt: str = Field(..., min_length=1, max_length=2000, description="Musical genre, style, mood, instrumentation")
            lyrics: Optional[str] = Field(default="", max_length=5000, description="Full song lyrics to sing")
            duration: int = Field(default=60, ge=10, le=240, description="Duration in seconds (up to 240s)")

        @song_app.get("/health")
        def health():
            return {"status": "ok", "engine": "song", "model": "ACE-Step-v1-3.5B"}

        @song_app.post("/generate-song", responses={200: {"content": {"audio/wav": {}}}}, dependencies=[Depends(verify_api_key)])
        def generate_song(request: SongGenRequest):
            """Generate a full vocal song with lyrics using ACE-Step 1.5 Turbo."""
            if self.pipeline is None:
                raise HTTPException(status_code=500, detail="ACE-Step pipeline not initialized")
            try:
                save_path = f"/tmp/{uuid.uuid4()}.wav"
                lyrics = request.lyrics.strip() if request.lyrics else ""
                if lyrics == "":
                    lyrics = "[inst]"

                pipeline_params = {
                    "prompt": request.prompt,
                    "audio_duration": request.duration + 1,
                    "lyrics": lyrics,
                    "save_path": save_path,
                    "format": "wav",
                    "use_erg_lyric": lyrics != "" and lyrics != "[inst]",
                    "guidance_scale": 15.0,
                }

                output_paths = self.pipeline(**pipeline_params)
                if not output_paths or not os.path.exists(output_paths[0]):
                    raise HTTPException(status_code=500, detail="ACE-Step generated no audio file")

                with open(output_paths[0], "rb") as f:
                    audio_bytes = f.read()

                try:
                    os.remove(output_paths[0])
                except Exception:
                    pass

                import gc
                import torch
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

                return Response(
                    content=audio_bytes,
                    media_type="audio/wav",
                    headers={"x-song-duration": str(request.duration), "x-model": "ace-step-1.5"},
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to generate song: {e}")

        return song_app


# ===========================================================================
# 4. CadenceMediaEngine (SDXL-Turbo Photoreal 1024x1024 Images & Wan2.1 Video)
# ===========================================================================
@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("cadence-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
    volumes={
        CACHE_DIR: model_cache_volume,
        R2_MOUNT_PATH: r2_bucket,
    },
    image=media_image,
)
class CadenceMediaEngine:
    @modal.enter()
    def setup_media_pipeline(self):
        import torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.image_pipe = None
        self.wan_pipe = None

    def _get_image_pipeline(self):
        if self.image_pipe is None:
            import torch
            from diffusers import AutoPipelineForText2Image
            print("Loading SDXL-Turbo image generation model...")
            self.image_pipe = AutoPipelineForText2Image.from_pretrained(
                "stabilityai/sdxl-turbo",
                torch_dtype=torch.float16,
                variant="fp16",
                cache_dir=CACHE_DIR,
            )
            self.image_pipe.to("cuda")
        return self.image_pipe

    def _get_wan_pipeline(self):
        if self.wan_pipe is None:
            import torch
            from diffusers import AutoencoderKLWan, WanPipeline
            print("Loading Wan2.1-T2V-1.3B video model...")
            model_id = "Wan-AI/Wan2.1-T2V-1.3B-Diffusers"
            vae = AutoencoderKLWan.from_pretrained(
                model_id,
                subfolder="vae",
                torch_dtype=torch.float32,
                cache_dir=CACHE_DIR,
            )
            self.wan_pipe = WanPipeline.from_pretrained(
                model_id,
                vae=vae,
                torch_dtype=torch.bfloat16,
                cache_dir=CACHE_DIR,
            )
            self.wan_pipe.enable_model_cpu_offload()
            if hasattr(self.wan_pipe, "vae") and hasattr(self.wan_pipe.vae, "enable_slicing"):
                self.wan_pipe.vae.enable_slicing()
        return self.wan_pipe

    @modal.asgi_app()
    def serve(self):
        import io
        import tempfile
        from fastapi import Depends, FastAPI, HTTPException
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import FileResponse, StreamingResponse
        from pydantic import BaseModel, Field

        verify_api_key = get_auth_verifier()

        media_app = FastAPI(
            title="Cadence Visual & Video Media Engine",
            description="Dedicated API for Photorealistic Images (SDXL-Turbo) and Cinematic AI Video (Wan2.1 1.3B).",
            docs_url="/docs",
            dependencies=[Depends(verify_api_key)],
        )
        media_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        class ImageGenRequest(BaseModel):
            prompt: str = Field(..., min_length=1, max_length=2000, description="Image / cover art description")
            aspect_ratio: str = Field(default="1:1", description="1:1, 16:9, 9:16, or 4:3")
            num_steps: int = Field(default=2, ge=1, le=8)
            guidance_scale: float = Field(default=0.0, ge=0.0, le=10.0)

        class VideoGenRequest(BaseModel):
            prompt: str = Field(..., min_length=1, max_length=2000, description="Video prompt description")
            duration_seconds: int = Field(default=3, ge=2, le=5)
            resolution: str = Field(default="480p", description="480p or 720p")

        # -------------------------------------------------------------------
        # 1. Photorealistic Image Generation (SDXL-Turbo)
        # -------------------------------------------------------------------
        @media_app.post("/generate-image", responses={200: {"content": {"image/png": {}}}})
        def generate_image(request: ImageGenRequest):
            try:
                import torch
                pipe = self._get_image_pipeline()

                width, height = (1024, 1024)
                if request.aspect_ratio == "16:9":
                    width, height = (1024, 576)
                elif request.aspect_ratio == "9:16":
                    width, height = (576, 1024)
                elif request.aspect_ratio == "4:3":
                    width, height = (1024, 768)

                steps = max(1, min(request.num_steps, 4))
                image = pipe(
                    prompt=request.prompt,
                    width=width,
                    height=height,
                    num_inference_steps=steps,
                    guidance_scale=request.guidance_scale if request.guidance_scale > 0 else 0.0,
                ).images[0]

                buf = io.BytesIO()
                image.save(buf, format="PNG")
                buf.seek(0)
                return StreamingResponse(buf, media_type="image/png")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Image generation failed: {e}")
            finally:
                import gc
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        # -------------------------------------------------------------------
        # 2. Text-to-Video Synthesis (Wan2.1-T2V-1.3B)
        # -------------------------------------------------------------------
        @media_app.post("/generate-video", responses={200: {"content": {"video/mp4": {}}}})
        def generate_video(request: VideoGenRequest):
            try:
                import torch
                from diffusers.utils import export_to_video

                pipe = self._get_wan_pipeline()

                # Calculate frame count at 16fps (e.g., 3s -> ~49 frames)
                fps = 16
                num_frames = 16 * request.duration_seconds + 1
                # Cap for latency on single A10G
                num_frames = min(num_frames, 49)

                w, h = (832, 480)
                if request.resolution == "720p":
                    w, h = (1280, 720)

                negative_prompt = (
                    "Bright tones, overexposed, static, blurred details, subtitles, "
                    "worst quality, low quality, JPEG compression residue, ugly, deformed"
                )

                video_frames = pipe(
                    prompt=request.prompt,
                    negative_prompt=negative_prompt,
                    height=h,
                    width=w,
                    num_frames=num_frames,
                    num_inference_steps=20,
                    guidance_scale=5.0,
                ).frames[0]

                with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_vid:
                    output_path = tmp_vid.name

                export_to_video(video_frames, output_path, fps=fps)

                return FileResponse(
                    output_path,
                    media_type="video/mp4",
                    filename="cadence_video.mp4",
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Video generation failed: {e}")
            finally:
                import gc
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        return media_app
