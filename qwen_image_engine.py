"""Standalone Modal Deployment for Qwen-Image-2.1.

Model: Qwen/Qwen-Image-2.1
HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1

Architecture & Capabilities:
- 7B Visual Generation DiT backbone (32 Single-Stream DiT layers)
- 8B Qwen3-VL text encoder
- Unified pipeline: Text-to-Image (T2I), Multi-Image Editing (up to 10 references), native RGBA
- State-of-the-art Chinese & English text rendering, complex layout composition, realistic textures

GPU & Performance Engineering for NVIDIA A10G (24GB VRAM):
- Precision: torch.bfloat16
- Memory optimization: `enable_model_cpu_offload()` + `enable_vae_tiling()`
- CUDA Environment: PYTORCH_CUDA_ALLOC_CONF="expandable_segments:True"
- Cache: Persistent Modal Volume mounted at /root/.cache/qwen_models with HF Transfer
- Scaledown window: 300s (5 minutes warm stay-alive)
"""

import base64
import io
import os
import time
from typing import List, Optional
import modal

# ---------------------------------------------------------------------------
# App & Persistent Volume Configuration
# ---------------------------------------------------------------------------
APP_NAME = "qwen-image-2-1"
app = modal.App(APP_NAME)

CACHE_DIR = "/root/.cache/qwen_models"
models_volume = modal.Volume.from_name("qwen-models-cache", create_if_missing=True)

# ---------------------------------------------------------------------------
# Container Image Definition
# ---------------------------------------------------------------------------
qwen_image = (
    modal.Image.from_registry("pytorch/pytorch:2.6.0-cuda12.6-cudnn9-runtime")
    .env({
        "PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True",
        "HF_HUB_ENABLE_HF_TRANSFER": "1",
        "HF_HOME": CACHE_DIR,
    })
    .apt_install(
        "git",
        "wget",
        "curl",
        "libgl1",
        "libglib2.0-0",
    )
    .pip_install(
        "accelerate>=1.2.0",
        "transformers>=4.48.0",
        "sentencepiece>=0.2.0",
        "safetensors>=0.4.5",
        "numpy>=1.24,<3",
        "pillow>=10.0,<13",
        "packaging>=24,<26",
        "hf-transfer>=0.1.8",
        "huggingface_hub>=0.28.0",
        "fastapi[standard]>=0.115.0",
        "pydantic>=2.0",
        "bitsandbytes>=0.45.0",
    )
    # Install diffusers from git main for day-0 QwenImage21Pipeline support
    .run_commands(
        "pip install --no-cache-dir git+https://github.com/huggingface/diffusers.git",
    )
)

# ---------------------------------------------------------------------------
# Official Qwen-Image-2.1 Resolution Mapping (Native Ultra & Balanced Standard)
# ---------------------------------------------------------------------------
ASPECT_RATIO_STANDARD = {
    "1:1": (1024, 1024),
    "16:9": (1376, 768),
    "9:16": (768, 1376),
    "3:2": (1264, 848),
    "2:3": (848, 1264),
    "4:3": (1200, 896),
    "3:4": (896, 1200),
}

# Native 2K resolutions specified in official Qwen-Image-2.1 documentation:
ASPECT_RATIO_ULTRA = {
    "1:1": (2048, 2048),
    "16:9": (2752, 1536),
    "9:16": (1536, 2752),
    "3:2": (2528, 1696),
    "2:3": (1696, 2528),
    "4:3": (2400, 1792),
    "3:4": (1792, 2400),
}

RGBA_PROMPT_PREFIX = "This is an RGBA image with transparency. The image has alpha channel and the background is transparent. "


# ---------------------------------------------------------------------------
# Qwen-Image-2.1 Model Server Class
# ---------------------------------------------------------------------------
@app.cls(
    gpu="A10G",  # 24GB VRAM Ampere GPU
    scaledown_window=60 * 5,  # 5 min warm stay-alive
    timeout=600,
    secrets=[
        modal.Secret.from_name("hf-token"),
    ],
    volumes={CACHE_DIR: models_volume},
    image=qwen_image,
)
class QwenImageEngine:
    @modal.enter()
    def load_model(self):
        import torch
        from diffusers import DiffusionPipeline

        print("--> [QwenImageEngine] Initializing Qwen-Image-2.1 in bfloat16 on A10G...")
        model_id = "Qwen/Qwen-Image-2.1"
        os.environ["HF_HOME"] = CACHE_DIR

        # Attempt QwenImage21Pipeline or standard DiffusionPipeline fallback
        try:
            from diffusers import QwenImage21Pipeline
            print("--> Loading via QwenImage21Pipeline...")
            self.pipe = QwenImage21Pipeline.from_pretrained(
                model_id,
                torch_dtype=torch.bfloat16,
                cache_dir=CACHE_DIR,
            )
        except Exception as e:
            print(f"--> QwenImage21Pipeline direct import fallback: {e}. Using DiffusionPipeline...")
            self.pipe = DiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.bfloat16,
                cache_dir=CACHE_DIR,
                trust_remote_code=True,
            )

        # Peak VRAM Engineering for 24GB A10G:
        # 1. CPU offload keeps inactive components in system memory, moving layers to GPU on-the-fly
        # 2. VAE tiling slices latents into tiles to prevent VRAM spikes during 1K/2K decode
        self.pipe.enable_model_cpu_offload()

        if hasattr(self.pipe, "vae") and hasattr(self.pipe.vae, "enable_tiling"):
            self.pipe.vae.enable_tiling()
            print("--> Enabled VAE tiling for high-resolution decode.")

        if hasattr(self.pipe, "vae") and hasattr(self.pipe.vae, "enable_slicing"):
            self.pipe.vae.enable_slicing()
            print("--> Enabled VAE slicing.")

        print("--> [READY] Qwen-Image-2.1 loaded successfully with A10G peak memory optimizations!")

    @modal.method()
    def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        aspect_ratio: str = "1:1",
        quality: str = "standard",  # "standard" (1024) or "ultra" (2048)
        transparent: bool = False,
        num_inference_steps: int = 30,
        guidance_scale: float = 4.0,
        seed: Optional[int] = None,
    ) -> bytes:
        """Text-to-Image generation using Qwen-Image-2.1 with optional native RGBA transparency."""
        import random
        import torch

        if seed is None or seed < 0:
            seed = random.randint(0, 2**31 - 1)

        res_table = ASPECT_RATIO_ULTRA if quality == "ultra" else ASPECT_RATIO_STANDARD
        default_size = (2048, 2048) if quality == "ultra" else (1024, 1024)
        width, height = res_table.get(aspect_ratio, default_size)

        effective_prompt = prompt
        if transparent and not prompt.lower().startswith("this is an rgba"):
            effective_prompt = f"{RGBA_PROMPT_PREFIX}{prompt}"

        print(f"--> [T2I] Transparent: {transparent} | Prompt: '{effective_prompt[:80]}...' | Resolution: {width}x{height} | Steps: {num_inference_steps} | Seed: {seed}")

        generator = torch.Generator(device="cpu").manual_seed(seed)

        kwargs = {
            "prompt": effective_prompt,
            "width": width,
            "height": height,
            "num_inference_steps": int(num_inference_steps),
            "generator": generator,
        }
        if negative_prompt:
            kwargs["negative_prompt"] = negative_prompt

        with torch.inference_mode():
            output = self.pipe(**kwargs)
            image = output.images[0]

        buf = io.BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)

        torch.cuda.empty_cache()
        return buf.getvalue()

    @modal.method()
    def edit_image(
        self,
        prompt: str,
        image_bytes_list: List[bytes],
        negative_prompt: Optional[str] = None,
        aspect_ratio: str = "1:1",
        quality: str = "standard",
        transparent: bool = False,
        num_inference_steps: int = 30,
        guidance_scale: float = 4.0,
        seed: Optional[int] = None,
    ) -> bytes:
        """Multi-image contextual editing with Qwen-Image-2.1 (supports up to 10 reference images + RGBA)."""
        import random
        import torch
        from PIL import Image

        if seed is None or seed < 0:
            seed = random.randint(0, 2**31 - 1)

        pil_images = []
        for raw_bytes in image_bytes_list[:10]:
            img = Image.open(io.BytesIO(raw_bytes))
            # Preserve RGBA if image has transparency, else RGB
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
            pil_images.append(img)

        res_table = ASPECT_RATIO_ULTRA if quality == "ultra" else ASPECT_RATIO_STANDARD
        default_size = (2048, 2048) if quality == "ultra" else (1024, 1024)
        width, height = res_table.get(aspect_ratio, default_size)

        effective_prompt = prompt
        if transparent and not prompt.lower().startswith("this is an rgba"):
            effective_prompt = f"{RGBA_PROMPT_PREFIX}{prompt}"

        print(f"--> [Edit] Transparent: {transparent} | Prompt: '{effective_prompt[:80]}...' | Input Images: {len(pil_images)} | Resolution: {width}x{height}")

        generator = torch.Generator(device="cpu").manual_seed(seed)

        kwargs = {
            "prompt": effective_prompt,
            "image": pil_images if len(pil_images) > 1 else pil_images[0],
            "width": width,
            "height": height,
            "num_inference_steps": int(num_inference_steps),
            "generator": generator,
        }
        if negative_prompt:
            kwargs["negative_prompt"] = negative_prompt

        with torch.inference_mode():
            output = self.pipe(**kwargs)
            image = output.images[0]

        buf = io.BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)

        torch.cuda.empty_cache()
        return buf.getvalue()

    @modal.asgi_app()
    def serve(self):
        """Standard HTTP REST ASGI FastAPI App for Qwen-Image-2.1."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from pydantic import BaseModel
        from typing import Optional, List

        web_app = FastAPI(title="Qwen-Image-2.1 Engine")
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        class GeneratePayload(BaseModel):
            action: str = "generate"  # "generate" or "edit"
            prompt: str = ""
            negative_prompt: Optional[str] = None
            images: List[str] = []  # base64 encoded input images for editing
            aspect_ratio: str = "1:1"
            quality: str = "standard"  # "standard" (1024) or "ultra" (2048)
            transparent: bool = False  # native RGBA transparent generation / editing
            num_steps: int = 30
            guidance_scale: float = 4.0
            seed: Optional[int] = None

        @web_app.get("/health")
        def health():
            return {"status": "ok", "model": "Qwen/Qwen-Image-2.1", "device": "A10G"}

        @web_app.post("/")
        @web_app.post("/generate")
        def run_generation(request: GeneratePayload):
            start = time.time()
            if request.action == "edit" and len(request.images) > 0:
                image_bytes_list = [base64.b64decode(b) for b in request.images]
                out_bytes = self.edit_image.local(
                    prompt=request.prompt,
                    image_bytes_list=image_bytes_list,
                    negative_prompt=request.negative_prompt,
                    aspect_ratio=request.aspect_ratio,
                    quality=request.quality,
                    transparent=request.transparent,
                    num_inference_steps=request.num_steps,
                    guidance_scale=request.guidance_scale,
                    seed=request.seed,
                )
            else:
                out_bytes = self.generate_image.local(
                    prompt=request.prompt,
                    negative_prompt=request.negative_prompt,
                    aspect_ratio=request.aspect_ratio,
                    quality=request.quality,
                    transparent=request.transparent,
                    num_inference_steps=request.num_steps,
                    guidance_scale=request.guidance_scale,
                    seed=request.seed,
                )

            elapsed = time.time() - start
            return {
                "status": "success",
                "format": "png",
                "image_base64": base64.b64encode(out_bytes).decode("utf-8"),
                "elapsed_seconds": round(elapsed, 2),
            }

        return web_app


# ---------------------------------------------------------------------------
# CLI Test Runner
# ---------------------------------------------------------------------------
@app.local_entrypoint()
def test(
    prompt: str = "A cinematic neon sign that reads 'CADENCE AI', hyperrealistic 8k, rainy street reflections",
    aspect_ratio: str = "16:9",
    output: str = "qwen_image_sample.png",
):
    """Run test generation:
    modal run qwen_image_engine.py --prompt "A breathtaking anime landscape at sunset" --output "sample.png"
    """
    engine = QwenImageEngine()
    print(f"--> Requesting Qwen-Image-2.1 generation for: '{prompt}'...")
    png_bytes = engine.generate_image.remote(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        num_inference_steps=30,
    )
    with open(output, "wb") as f:
        f.write(png_bytes)
    print(f"✓ Saved test render to {output} ({len(png_bytes)} bytes)")
