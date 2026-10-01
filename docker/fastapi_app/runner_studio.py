import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from docker.fastapi_app.auth import auth_dep
from cadence_studio_engine import StudioEngine

engine = StudioEngine()
engine.load_models()

app = engine.serve()
