import os
import torch

def get_device():
    """Detect acceleration hardware: CUDA (NVIDIA), MPS (Apple Silicon), or fallback to CPU."""
    if torch.cuda.is_available():
        return "cuda"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"

CACHE_DIR = os.environ.get("CACHE_DIR", "/root/.cache/cadence_models")
R2_MOUNT_PATH = os.environ.get("R2_MOUNT_PATH", "/r2")

os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(R2_MOUNT_PATH, exist_ok=True)
