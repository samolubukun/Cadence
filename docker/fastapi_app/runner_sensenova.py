import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from docker.fastapi_app.auth import auth_dep
from sensenova_engine import SenseNovaEngine

engine = SenseNovaEngine()
engine.load_models()

app = engine.serve()
