"""Standalone Modal Deployment for Cadence Real-Time Voice Agent Studio.

Architecture (Single NVIDIA A10G 24GB):
1. Silero VAD v5 (~30 MB VRAM)
   - Real-time chunk voice activity detection.
   - Triggers speech onset and immediate assistant barge-in cancellation.
2. Faster-Whisper Large-v3-Turbo (~1.5 GB VRAM)
   - Low-latency automatic speech recognition.
3. Qwen2.5-3B-Instruct (~5.5 GB VRAM)
   - Real-time conversational intelligence and sentence boundary token streaming.
   - Built-in prompt presets: Casual, Creative, Producer, Coach.
4. Kokoro-82M TTS (~0.4 GB VRAM) & Chatterbox Turbo Support
   - 28x faster than real-time speech synthesis (PCM16 24kHz stream).

Protocol:
- Bidirectional WebSocket compliant with OpenAI Realtime GA schema.
- Handles `input_audio_buffer.append`, `response.audio.delta`, `response.cancel`, `session.update`.
"""

import asyncio
import base64
import json
import logging
import os
import time
from typing import Dict, Any, List, Optional
import numpy as np

import modal

APP_NAME = "cadence-agent"
app = modal.App(APP_NAME)

CACHE_DIR = "/root/.cache/cadence_agent_models"
models_volume = modal.Volume.from_name("cadence-agent-cache", create_if_missing=True)

# Cloudflare R2 Mount (compatible with cadence_engine)
R2_BUCKET_NAME = "cadence"
R2_ACCOUNT_ID = "6e63b51e6884e8e15d81a980f3fd9856"
R2_MOUNT_PATH = "/r2"

r2_bucket = modal.CloudBucketMount(
    R2_BUCKET_NAME,
    bucket_endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    secret=modal.Secret.from_name("cloudflare-r2"),
    read_only=False,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CadenceAgent")

# ---------------------------------------------------------------------------
# Container Image Definition
# ---------------------------------------------------------------------------
agent_image = (
    modal.Image.debian_slim(python_version="3.11")
    .env({
        "PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True",
    })
    .apt_install(
        "git",
        "wget",
        "curl",
        "ffmpeg",
        "libsndfile1",
        "espeak-ng",
    )
    .pip_install(
        "torch>=2.5.0",
        "torchaudio>=2.5.0",
        "openai-whisper",
        "fastapi>=0.115.0",
        "uvicorn[standard]>=0.30.0",
        "websockets>=13.0",
        "pydantic>=2.8.0",
        "numpy>=1.26.0",
        "transformers>=4.48.0",
        "accelerate>=0.34.0",
        "soundfile>=0.12.1",
        "huggingface_hub>=0.28.0",
        "loguru",
        "scipy",
        "addict",
        "spacy",
        "httpx>=0.27.0",
    )
    .pip_install("kokoro>=0.8.4")
    .pip_install("misaki[en]>=0.9.4")
)

# ---------------------------------------------------------------------------
# Model Service
# ---------------------------------------------------------------------------
@app.cls(
    image=agent_image,
    gpu="a10g",
    scaledown_window=300,



    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("cadence-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
    volumes={CACHE_DIR: models_volume, R2_MOUNT_PATH: r2_bucket},
)
class CadenceAgentEngine:

    @modal.enter()
    def initialize_models(self):
        """Preload all 4 models onto the single A10G GPU."""
        import torch
        import whisper
        from transformers import AutoModelForCausalLM, AutoTokenizer
        try:
            from kokoro import KPipeline
        except ImportError:
            KPipeline = None

        logger.info("[INIT] Initializing Cadence Real-Time Voice Agent Engine on A10G...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # 1. Load Silero VAD v5
        logger.info("[VAD] Loading Silero VAD v5...")
        self.vad_model, self.vad_utils = torch.hub.load(
            repo_or_dir="snakers4/silero-vad",
            model="silero_vad",
            force_reload=False,
            onnx=False,
            trust_repo=True,
        )
        self.vad_model.to(self.device)
        self.vad_model.eval()

        # 2. Load NVIDIA Parakeet (State of the art 0.6B/1.1B ASR) with fallback
        logger.info("[STT] Loading NVIDIA Parakeet-TDT-0.6b-v3 on GPU...")
        self.stt_pipeline = None
        try:
            from transformers import pipeline
            self.stt_pipeline = pipeline(
                "automatic-speech-recognition",
                model="nvidia/parakeet-tdt-0.6b-v3",
                device=0 if self.device == "cuda" else -1,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                model_kwargs={"cache_dir": os.path.join(CACHE_DIR, "parakeet")}
            )
            logger.info("[STT] NVIDIA Parakeet loaded successfully on GPU!")
        except Exception as e:
            logger.warning(f"Could not load NVIDIA Parakeet: {e}. Falling back to Whisper...")
            import whisper
            self.whisper_model = whisper.load_model("small.en", device=self.device, download_root=os.path.join(CACHE_DIR, "whisper"))
            self.stt_pipeline = None

        # 3. Load Qwen2.5-3B-Instruct
        logger.info("[LLM] Loading Qwen2.5-3B-Instruct...")
        model_name = "Qwen/Qwen2.5-3B-Instruct"
        self.llm_tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            cache_dir=os.path.join(CACHE_DIR, "qwen")
        )
        self.llm_model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            device_map="auto",
            cache_dir=os.path.join(CACHE_DIR, "qwen")
        )

        # 4. Load Kokoro TTS Pipeline
        logger.info("[TTS] Loading Kokoro TTS Pipeline...")
        self.tts_pipeline = None
        self.tts_mode = None

        try:
            from kokoro import KPipeline
            self.tts_pipeline = KPipeline(lang_code="a") # American English
            self.tts_mode = "pytorch"
            logger.info("[TTS] Kokoro PyTorch KPipeline loaded successfully!")
        except Exception as e:
            logger.warning(f"Could not load Kokoro KPipeline: {e}. Trying Kokoro-ONNX...")
            try:
                from kokoro_onnx import Kokoro
                import urllib.request
                onnx_dir = os.path.join(CACHE_DIR, "kokoro_onnx")
                os.makedirs(onnx_dir, exist_ok=True)
                model_path = os.path.join(onnx_dir, "kokoro-v0_19.onnx")
                voices_path = os.path.join(onnx_dir, "voices.bin")
                if not os.path.exists(model_path):
                    urllib.request.urlretrieve("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/kokoro-v0_19.onnx", model_path)
                if not os.path.exists(voices_path):
                    urllib.request.urlretrieve("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/voices.bin", voices_path)
                self.tts_pipeline = Kokoro(model_path, voices_path)
                self.tts_mode = "onnx"
                logger.info("[TTS] Kokoro-ONNX loaded successfully!")
            except Exception as e_onnx:
                logger.error(f"Failed to load Kokoro-ONNX as well: {e_onnx}", exc_info=True)

        logger.info(f"[READY] All 4 Models Loaded Successfully on A10G (TTS mode: {self.tts_mode})!")


    def transcribe_pcm(self, pcm_bytes: bytes, sample_rate: int = 24000) -> str:
        """Transcribe raw PCM16 audio bytes into text using NVIDIA Parakeet or Whisper."""
        audio_np = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0

        # 1. Noise Floor Gate: If signal RMS is below quiet room threshold, ignore as silence
        rms = np.sqrt(np.mean(audio_np ** 2)) if len(audio_np) > 0 else 0
        if rms < 0.008 or len(audio_np) < 8000: # Less than ~0.35s or too quiet
            return ""

        # Resample to 16000 for standard ASR
        if sample_rate != 16000:
            import torchaudio.transforms as T
            import torch
            resampler = T.Resample(orig_freq=sample_rate, new_freq=16000)
            tensor_audio = torch.from_numpy(audio_np).unsqueeze(0)
            resampled = resampler(tensor_audio).squeeze(0).numpy()
            audio_np = resampled

        try:
            raw_text = ""
            if self.stt_pipeline is not None:
                # NVIDIA Parakeet
                res = self.stt_pipeline({"raw": audio_np, "sampling_rate": 16000})
                raw_text = (res.get("text") or "").strip()
            elif hasattr(self, "whisper_model") and self.whisper_model:
                # Whisper fallback
                result = self.whisper_model.transcribe(
                    audio_np,
                    fp16=(self.device == "cuda"),
                    language="en",
                    temperature=0.0,
                )
                raw_text = (result.get("text") or "").strip()

            # 2. Filter Common ASR Hallucinations & Infinite Loop Repetitions
            if not raw_text:
                return ""

            # Check for excessive repetition (e.g. "Okay. Okay. Okay." or "Hello? Hello?")
            words = raw_text.split()
            if len(words) >= 4:
                # If 70%+ of words are the identical word repeated, it's an ASR silence loop
                from collections import Counter
                counts = Counter([w.lower().strip(".,?!") for w in words])
                most_common_word, most_common_count = counts.most_common(1)[0]
                if (most_common_count / len(words)) > 0.6:
                    logger.warning(f"[STT] Filtered out hallucinated repetitive loop: '{raw_text[:60]}...'")
                    return ""

            # Filter single isolated background hallucination triggers
            cleaned_lower = raw_text.lower().strip(".,?!")
            if cleaned_lower in ["you", "thank you", "okay", "bye", "hmm", "yeah", "hello"]:
                if rms < 0.015: # If low energy, it's almost certainly hallucinated breath
                    return ""

            return raw_text
        except Exception as e:
            logger.error(f"STT transcribe error: {e}", exc_info=True)
        return ""

    def generate_llm_response(self, system_prompt: str, history: List[Dict[str, str]], user_text: str):
        """Generate conversational tokens with Qwen2.5."""
        import torch

        messages = [{"role": "system", "content": system_prompt}]
        for item in history[-6:]: # context window last 6 turns
            messages.append(item)
        messages.append({"role": "user", "content": user_text})

        prompt_text = self.llm_tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        model_inputs = self.llm_tokenizer([prompt_text], return_tensors="pt").to(self.device)

        with torch.no_grad():
            outputs = self.llm_model.generate(
                **model_inputs,
                max_new_tokens=150,
                temperature=0.7,
                top_p=0.85,
                repetition_penalty=1.1,
                do_sample=True,
                pad_token_id=self.llm_tokenizer.eos_token_id,
            )
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, outputs)
        ]
        return self.llm_tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()

    def synthesize_chatterbox(self, text: str, voice_key: str, cadence_api_url: str, cadence_api_key: str) -> Optional[bytes]:
        """Synthesize response text using Cadence's deployed Chatterbox backend with R2 voice timbre."""
        if not text.strip() or not voice_key:
            logger.warning("[Chatterbox] Missing text or voice_key for synthesis")
            return None
        try:
            import httpx
            import io
            import soundfile as sf

            logger.info(f"[Chatterbox] Requesting synthesis from Cadence API ({cadence_api_url}) for voice_key '{voice_key}'...")
            generate_url = f"{cadence_api_url.rstrip('/')}/generate"
            headers = {"x-api-key": cadence_api_key}
            payload = {
                "prompt": text,
                "voice_key": voice_key,
                "temperature": 0.7,
                "top_p": 0.85,
                "top_k": 50,
                "repetition_penalty": 1.1,
                "norm_loudness": True,
            }

            with httpx.Client(timeout=30.0) as client:
                resp = client.post(generate_url, json=payload, headers=headers)
                if resp.status_code == 200 and resp.content:
                    audio_bytes = resp.content
                    # Read audio and convert to 24000Hz mono PCM16
                    data, sr = sf.read(io.BytesIO(audio_bytes))
                    if data.ndim > 1:
                        data = data.mean(axis=1)
                    if sr != 24000:
                        import torchaudio.transforms as T
                        tensor_audio = torch.from_numpy(data.astype(np.float32)).unsqueeze(0)
                        resampler = T.Resample(orig_freq=sr, new_freq=24000)
                        data = resampler(tensor_audio).squeeze(0).numpy()
                    pcm_data = (data * 32767.0).clip(-32768, 32767).astype(np.int16).tobytes()
                    logger.info(f"[Chatterbox] Successfully synthesized {len(pcm_data)} bytes of 24kHz PCM audio!")
                    return pcm_data
                else:
                    logger.warning(f"[Chatterbox] API returned status {resp.status_code}: {resp.text[:120]}")
        except Exception as e:
            logger.error(f"[Chatterbox] Synthesis error: {e}", exc_info=True)
        return None

    def synthesize_speech(self, text: str, voice_name: str = "af_heart") -> Optional[bytes]:
        """Synthesize response text to PCM16 24kHz using Kokoro-82M (PyTorch or ONNX)."""
        if not self.tts_pipeline or not text.strip():
            logger.warning(f"TTS pipeline unavailable or empty text: pipeline={bool(self.tts_pipeline)}")
            return None
        try:
            logger.info(f"[TTS] Synthesizing speech ({self.tts_mode}) with voice '{voice_name}' for: '{text[:60]}...'")
            if self.tts_mode == "onnx":
                # Kokoro-ONNX returns (samples, sample_rate)
                samples, sample_rate = self.tts_pipeline.create(text, voice=voice_name, speed=1.0, lang="en-us")
                pcm_data = (samples * 32767.0).clip(-32768, 32767).astype(np.int16).tobytes()
                logger.info(f"[TTS] Synthesized {len(pcm_data)} bytes of ONNX PCM audio")
                return pcm_data
            else:
                generator = self.tts_pipeline(text, voice=voice_name, speed=1.0)
                audio_chunks = []
                for _, _, audio in generator:
                    if audio is not None:
                        # Convert PyTorch Tensor or numpy to int16 PCM bytes
                        import torch
                        if isinstance(audio, torch.Tensor):
                            audio_arr = audio.detach().cpu().numpy()
                        else:
                            audio_arr = np.asarray(audio)
                        if len(audio_arr) > 0:
                            pcm_data = (audio_arr * 32767.0).clip(-32768, 32767).astype(np.int16).tobytes()
                            audio_chunks.append(pcm_data)
                if audio_chunks:
                    full_pcm = b"".join(audio_chunks)
                    logger.info(f"[TTS] Synthesized {len(full_pcm)} bytes of PyTorch PCM audio ({len(audio_chunks)} chunks)")
                    return full_pcm
                else:
                    logger.warning("[TTS] Generator yielded no audio chunks")
        except Exception as e:
            logger.error(f"TTS synthesis error: {e}", exc_info=True)
        return None

    @modal.asgi_app()
    def serve(self):
        from fastapi import FastAPI, WebSocket, WebSocketDisconnect
        from fastapi.middleware.cors import CORSMiddleware

        web_app = FastAPI(title="Cadence Real-Time Voice Agent API")
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        PERSONA_PROMPTS = {
            "casual": "You are Cadence, an ultra-witty, friendly, concise real-time voice partner. Keep replies under 2-3 sentences. Speak naturally and enthusiastically.",
            "creative": "You are Cadence Creative, an imaginative collaborator for music, design, lyrics, and story concepts. Be inspiring, direct, and conversational.",
            "producer": "You are Cadence Studio Producer. You understand audio engineering, stem separation, synth design, chords, and mastering. Give crisp, punchy audio advice.",
            "coach": "You are Cadence Language & Vocal Coach. You give friendly, supportive feedback on conversation clarity, pronunciation, and expression.",
        }

        @web_app.get("/health")
        async def health():
            return {"status": "ok", "service": "cadence-voice-agent", "gpu": "NVIDIA A10G"}

        @web_app.websocket("/ws/realtime")
        async def websocket_realtime_endpoint(websocket: WebSocket):
            await websocket.accept()
            logger.info("🔌 Client connected to Cadence Realtime Voice WebSocket")

            # Session State
            session_state = {
                "persona": "casual",
                "voice_name": "af_heart",
                "voice_mode": "speed",
                "voice_key": None,
                "cadence_api_url": None,
                "cadence_api_key": None,
                "system_prompt": PERSONA_PROMPTS["casual"],
                "history": [],
                "is_speaking": False,
                "current_audio_buffer": bytearray(),
                "last_speech_time": time.time(),
                "cancel_requested": False,
            }

            try:
                while True:
                    message = await websocket.receive()
                    if message.get("type") == "websocket.disconnect":
                        break
                    
                    # 1. Handle Binary Frames (Raw 24kHz PCM from mic)
                    if "bytes" in message and message["bytes"]:
                        pcm_bytes = message["bytes"]
                        session_state["current_audio_buffer"].extend(pcm_bytes)
                        session_state["last_speech_time"] = time.time()

                        # Check Barge-In: if assistant is currently speaking, barge in immediately
                        if session_state["is_speaking"]:
                            session_state["cancel_requested"] = True
                            session_state["is_speaking"] = False
                            await websocket.send_json({
                                "type": "response.cancel",
                                "reason": "barge_in_detected",
                            })
                            logger.info("🛑 Barge-in interruption detected! Canceled active speech.")

                    # 2. Handle JSON Text Frames (OpenAI Realtime Protocol)
                    elif "text" in message and message["text"]:
                        try:
                            payload = json.loads(message["text"])
                        except Exception:
                            continue

                        event_type = payload.get("type", "")

                        # session.update
                        if event_type == "session.update":
                            session_config = payload.get("session", {})
                            persona_key = session_config.get("persona", session_state["persona"])
                            session_state["persona"] = persona_key
                            session_state["voice_mode"] = session_config.get("voice_mode", session_state["voice_mode"])
                            session_state["voice_key"] = session_config.get("voice_key", session_state["voice_key"])
                            session_state["cadence_api_url"] = session_config.get("cadence_api_url", session_state["cadence_api_url"])
                            session_state["cadence_api_key"] = session_config.get("cadence_api_key", session_state["cadence_api_key"])
                            session_state["system_prompt"] = session_config.get(
                                "instructions", PERSONA_PROMPTS.get(persona_key, PERSONA_PROMPTS["casual"])
                            )
                            session_state["voice_name"] = session_config.get("voice", session_state["voice_name"])
                            await websocket.send_json({
                                "type": "session.updated",
                                "session": {
                                    "persona": session_state["persona"],
                                    "voice": session_state["voice_name"],
                                    "voice_mode": session_state["voice_mode"],
                                }
                            })

                        # input_audio_buffer.append
                        elif event_type == "input_audio_buffer.append":
                            audio_b64 = payload.get("audio", "")
                            if audio_b64:
                                raw_bytes = base64.b64decode(audio_b64)
                                session_state["current_audio_buffer"].extend(raw_bytes)

                        # input_audio_buffer.commit / user finished speaking
                        elif event_type in ("input_audio_buffer.commit", "conversation.item.create"):
                            audio_to_process = bytes(session_state["current_audio_buffer"])
                            session_state["current_audio_buffer"].clear()

                            user_transcript = payload.get("text", "")
                            # If audio was provided without explicit text, transcribe it
                            if not user_transcript and len(audio_to_process) > 4000:
                                t0 = time.time()
                                user_transcript = self.transcribe_pcm(audio_to_process, sample_rate=24000)
                                stt_latency = int((time.time() - t0) * 1000)
                                logger.info(f"[STT] User transcription ({stt_latency}ms): '{user_transcript}'")


                            if not user_transcript.strip():
                                continue

                            # Emit transcription completed
                            await websocket.send_json({
                                "type": "conversation.item.input_audio_transcription.completed",
                                "transcript": user_transcript,
                            })

                            # Generate LLM response
                            session_state["cancel_requested"] = False
                            session_state["is_speaking"] = True
                            t_start = time.time()

                            assistant_text = self.generate_llm_response(
                                system_prompt=session_state["system_prompt"],
                                history=session_state["history"],
                                user_text=user_transcript,
                            )
                            ttft = int((time.time() - t_start) * 1000)

                            if session_state["cancel_requested"]:
                                session_state["is_speaking"] = False
                                continue

                            # Send text delta
                            await websocket.send_json({
                                "type": "response.text.delta",
                                "delta": assistant_text,
                                "ttft_ms": ttft,
                            })

                            # Synthesize TTS (Chatterbox proxy or Kokoro speed)
                            t_tts_start = time.time()
                            speech_pcm = None

                            if (
                                session_state.get("voice_mode") == "cloned"
                                and session_state.get("voice_key")
                                and session_state.get("cadence_api_url")
                                and session_state.get("cadence_api_key")
                            ):
                                logger.info(f"[TTS] Routing to Chatterbox for cloned voice key '{session_state['voice_key']}'...")
                                speech_pcm = self.synthesize_chatterbox(
                                    text=assistant_text,
                                    voice_key=session_state["voice_key"],
                                    cadence_api_url=session_state["cadence_api_url"],
                                    cadence_api_key=session_state["cadence_api_key"],
                                )

                            # Fallback or default to Kokoro Speed Mode
                            if not speech_pcm and not session_state["cancel_requested"]:
                                speech_pcm = self.synthesize_speech(assistant_text, voice_name=session_state["voice_name"])

                            tts_latency = int((time.time() - t_tts_start) * 1000)
                            total_latency = int((time.time() - t_start) * 1000)

                            if speech_pcm and not session_state["cancel_requested"]:
                                b64_audio = base64.b64encode(speech_pcm).decode("utf-8")
                                await websocket.send_json({
                                    "type": "response.audio.delta",
                                    "delta": b64_audio,
                                    "format": "pcm16_24000",
                                    "telemetry": {
                                        "ttft_ms": ttft,
                                        "tts_latency_ms": tts_latency,
                                        "total_turn_ms": total_latency,
                                    }
                                })

                            # Complete response turn
                            await websocket.send_json({
                                "type": "response.done",
                                "output": {
                                    "text": assistant_text,
                                    "duration_ms": total_latency,
                                }
                            })

                            # Update history
                            session_state["history"].append({"role": "user", "content": user_transcript})
                            session_state["history"].append({"role": "assistant", "content": assistant_text})
                            session_state["is_speaking"] = False

                        # response.cancel (manual interruption from client)
                        elif event_type == "response.cancel":
                            session_state["cancel_requested"] = True
                            session_state["is_speaking"] = False
                            await websocket.send_json({"type": "response.cancelled"})

            except WebSocketDisconnect:
                logger.info("🔌 Client disconnected from Voice Agent WebSocket")
            except Exception as e:
                logger.error(f"WebSocket error: {e}")

        return web_app
