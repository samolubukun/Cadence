import os
import torch
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from docker.fastapi_app.auth import auth_dep

# Import all 6 engines
from cadence_engine import CadenceAudioEngine, CadenceSoundEngine, CadenceSongEngine, CadenceMediaEngine
from cadence_studio_engine import StudioEngine
from cadence_clipper_engine import ClipperEngine
from cadence_agent_engine import AgentEngine
from qwen_image_engine import QwenImageEngine
from sensenova_engine import SenseNovaEngine

print("--> [Monolith] Bootstrapping Cadence All-in-One Engine...")

# Load models with GPU detection
audio_engine = CadenceAudioEngine()
audio_engine.load_audio_models()

sound_engine = CadenceSoundEngine()
sound_engine.load_sound_models()

song_engine = CadenceSongEngine()
song_engine.load_song_models()

media_engine = CadenceMediaEngine()
media_engine.load_media_models()

studio_engine = StudioEngine()
studio_engine.load_models()

clipper_engine = ClipperEngine()
clipper_engine.load_models()

agent_engine = AgentEngine()
agent_engine.load_models()

qwen_engine = QwenImageEngine()
qwen_engine.load_models()

sensenova_engine = SenseNovaEngine()
sensenova_engine.load_models()

# Retrieve mounted FastAPI apps
app_audio = audio_engine.serve()
app_sound = sound_engine.serve()
app_song = song_engine.serve()
app_media = media_engine.serve()
app_studio = studio_engine.serve()
app_clipper = clipper_engine.serve()
app_agent = agent_engine.serve()
app_qwen = qwen_engine.serve()
app_sensenova = sensenova_engine.serve()

# Create unified monolith application
app = FastAPI(
    title="Cadence All-in-One Local Engine",
    description="Unified on-prem / gaming PC AI generation gateway for all voice, audio, music, video, and visual models.",
    version="1.0.0",
    dependencies=[Depends(auth_dep)],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "topology": "combined-monolith",
        "cuda_available": torch.cuda.is_available(),
        "device": "cuda" if torch.cuda.is_available() else "mps" if hasattr(torch.backends, "mps") and torch.backends.mps.is_available() else "cpu",
    }

# Mount modular sub-routers
app.mount("/sound", app_sound)
app.mount("/song", app_song)
app.mount("/media", app_media)
app.mount("/studio", app_studio)
app.mount("/clipper", app_clipper)
app.mount("/agent", app_agent)
app.mount("/qwen", app_qwen)
app.mount("/sensenova", app_sensenova)

# Mount primary audio router at root
app.mount("/", app_audio)
