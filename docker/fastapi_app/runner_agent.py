import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from docker.fastapi_app.auth import auth_dep
from cadence_agent_engine import AgentEngine

engine = AgentEngine()
engine.load_models()

app = engine.serve()
