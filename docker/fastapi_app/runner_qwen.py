import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from docker.fastapi_app.auth import auth_dep
from qwen_image_engine import QwenImageEngine

engine = QwenImageEngine()
engine.load_models()

app = engine.serve()
