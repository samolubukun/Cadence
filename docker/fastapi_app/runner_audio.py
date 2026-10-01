import os
import sys
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from docker.fastapi_app.auth import auth_dep
from cadence_engine import CadenceAudioEngine, CadenceSoundEngine, CadenceSongEngine, CadenceMediaEngine

# Instantiate engine classes
audio_engine = CadenceAudioEngine()
audio_engine.load_audio_models()

sound_engine = CadenceSoundEngine()
sound_engine.load_sound_models()

song_engine = CadenceSongEngine()
song_engine.load_song_models()

media_engine = CadenceMediaEngine()
media_engine.load_media_models()

# Retrieve underlying FastAPI instances
app_audio = audio_engine.serve()
app_sound = sound_engine.serve()
app_song = song_engine.serve()
app_media = media_engine.serve()

# Create unified audio service router
app = FastAPI(title="Cadence Local Audio Suite Engine", dependencies=[Depends(auth_dep)])
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.mount("/sound", app_sound)
app.mount("/song", app_song)
app.mount("/media", app_media)
app.mount("/", app_audio)
