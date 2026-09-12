"""Standalone Modal Deployment for SenseNova-U1.5-8B-MoT.

Model: sensenova/SenseNova-U1.5-8B-MoT
Repository: https://github.com/OpenSenseNova/SenseNova-U1/tree/feat/u1.5
HF Demo Reference: https://huggingface.co/spaces/hugging-apps/sensenova-sensenova-u1-5-8b-mot

Hardware Options (NVIDIA):
- "L40S" ($0.000542 / sec) - Cost-efficient 48GB Ada Lovelace GPU
- "A100-80GB" ($0.000694 / sec) - High bandwidth 80GB VRAM
- "H100" ($0.001097 / sec) - Ultra-fast SXM5 80GB VRAM
- "H200" ($0.001261 / sec) - 141GB HBM3e VRAM
- "B200" ($0.001736 / sec) - Blackwell Flagship
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
APP_NAME = "sensenova-u1-5"
app = modal.App(APP_NAME)

CACHE_DIR = "/root/.cache/sensenova_models"
models_volume = modal.Volume.from_name("sensenova-models-cache", create_if_missing=True)

# ---------------------------------------------------------------------------
# Container Image Definition (Official PyTorch CUDA Base)
# ---------------------------------------------------------------------------
sensenova_image = (
    modal.Image.from_registry("pytorch/pytorch:2.6.0-cuda12.6-cudnn9-runtime")
    .env({
        "PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True",
        "HF_HUB_ENABLE_HF_TRANSFER": "1",
    })
    .apt_install(
        "git",
        "wget",
        "curl",
        "libgl1",
        "libglib2.0-0",
    )
    .pip_install(
        "transformers>=4.48.0",
        "accelerate>=1.1.0",
        "safetensors>=0.4.3",
        "sentencepiece==0.2.1",
        "numpy>=1.24,<3",
        "pillow>=10.0,<13",
        "packaging>=24,<26",
        "hf-transfer>=0.1.8",
        "huggingface_hub>=0.28.0",
        "fastapi[standard]>=0.115.0",
        "pydantic>=2.0",
        "bitsandbytes>=0.45.0",
    )
    # Clone, remove incompatible base torchaudio, and install SenseNova-U1.5
    .run_commands(
        "pip uninstall -y torchaudio",
        "git clone -b feat/u1.5 https://github.com/OpenSenseNova/SenseNova-U1.git /opt/SenseNova-U1",
        "pip install -e /opt/SenseNova-U1",
    )
)

# ---------------------------------------------------------------------------
# Resolution and Aspect Ratio Mapping (from official upstream U1.5)
# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# Resolution Mapping:
# - STANDARD (1024 base): Guaranteed safe for 24GB GPUs (A10 / A10G)
# - ULTRA (2048 base): For 40GB/80GB GPUs (A100, L40S, H100)
# ---------------------------------------------------------------------------
T2I_RESOLUTIONS_STANDARD = {
    "1:1": (1024, 1024),
    "16:9": (1344, 768),
    "9:16": (768, 1344),
    "3:2": (1216, 832),
    "2:3": (832, 1216),
    "4:3": (1152, 864),
    "3:4": (864, 1152),
    "1:2": (704, 1408),
    "2:1": (1408, 704),
    "1:3": (576, 1728),
    "3:1": (1728, 576),
}

T2I_RESOLUTIONS_ULTRA = {
    "1:1": (2048, 2048),
    "16:9": (2720, 1536),
    "9:16": (1536, 2720),
    "3:2": (2496, 1664),
    "2:3": (1664, 2496),
    "4:3": (2368, 1760),
    "3:4": (1760, 2368),
    "1:2": (1440, 2880),
    "2:1": (2880, 1440),
    "1:3": (1152, 3456),
    "3:1": (3456, 1152),
}

EDIT_GRID_FACTOR = 32
EDIT_TARGET_PIXELS = 1024 * 1024
EDIT_INPUT_TOTAL_MAX_PIXELS = 1024 * 1024
EDIT_INPUT_MIN_PIXELS = 512 * 512

NORM_MEAN = (0.5, 0.5, 0.5)
NORM_STD = (0.5, 0.5, 0.5)


def _denorm(x):
    import torch
    mean = torch.tensor(NORM_MEAN, device=x.device, dtype=x.dtype).view(1, 3, 1, 1)
    std = torch.tensor(NORM_STD, device=x.device, dtype=x.dtype).view(1, 3, 1, 1)
    return (x * std + mean).clamp(0, 1)


def _to_pil(batch):
    import numpy as np
    from PIL import Image
    arr = _denorm(batch.float()).permute(0, 2, 3, 1).cpu().numpy()
    arr = (arr * 255.0).round().astype(np.uint8)
    return [Image.fromarray(a) for a in arr]


# ---------------------------------------------------------------------------
# SenseNova Model Server Class
# ---------------------------------------------------------------------------
@app.cls(
    gpu="A10G",  # Active tier GPU on this Modal workspace
    scaledown_window=60 * 5,
    timeout=600,
    secrets=[
        modal.Secret.from_name("hf-token"),
    ],
    volumes={CACHE_DIR: models_volume},
    image=sensenova_image,
)
class SenseNovaEngine:
    @modal.enter()
    def load_model(self):
        import torch
        from transformers import AutoConfig, AutoModel, AutoTokenizer
        import sensenova_u1

        print("--> Initializing SenseNova-U1.5-8B-MoT on GPU...")
        model_id = "sensenova/SenseNova-U1.5-8B-MoT"
        os.environ["HF_HOME"] = CACHE_DIR

        sensenova_u1.set_attn_backend("auto")
        print(f"--> Attention backend configured: {sensenova_u1.effective_attn_backend()!r}")

        config = AutoConfig.from_pretrained(model_id)
        sensenova_u1.check_checkpoint_compatibility(config)
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)

        from transformers import BitsAndBytesConfig
        quantization_config = BitsAndBytesConfig(
            load_in_8bit=True,
            llm_int8_skip_modules=["timestep_embedder", "fm_modules", "vision_model", "visual_encoder"],
            llm_int8_enable_fp32_cpu_offload=True,
        )

        self.model = AutoModel.from_pretrained(
            model_id,
            config=config,
            quantization_config=quantization_config,
            device_map="auto",
        ).eval()

        print("--> SenseNova-U1.5-8B-MoT successfully loaded into GPU VRAM (8-bit quantized).")

    @modal.method()
    def generate_image(
        self,
        prompt: str,
        aspect_ratio: str = "1:1",
        quality: str = "standard",  # "standard" (1024 safe for 24GB A10) or "ultra" (2048 for H100/A100)
        num_steps: int = 28,
        cfg_scale: float = 4.0,
        timestep_shift: float = 3.0,
        seed: Optional[int] = None,
    ) -> bytes:
        """Text-to-Image Generation with SenseNova-U1.5-8B-MoT."""
        import random
        import torch

        if seed is None or seed < 0:
            seed = random.randint(0, 2**31 - 1)

        res_table = T2I_RESOLUTIONS_ULTRA if quality == "ultra" else T2I_RESOLUTIONS_STANDARD
        default_size = (2048, 2048) if quality == "ultra" else (1024, 1024)
        width, height = res_table.get(aspect_ratio, default_size)
        print(f"--> [T2I] Generating image: '{prompt}' | Quality: {quality} ({width}x{height}) | Steps: {num_steps} | Seed: {seed}")

        with torch.inference_mode():
            tensor = self.model.t2i_generate(
                self.tokenizer,
                prompt,
                image_size=(width, height),
                cfg_scale=float(cfg_scale),
                cfg_norm="none",
                timestep_shift=float(timestep_shift),
                cfg_interval=(0.0, 1.0),
                num_steps=int(num_steps),
                batch_size=1,
                seed=int(seed),
                think_mode=False,
            )

        pil_img = _to_pil(tensor)[0]
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        del tensor
        torch.cuda.empty_cache()
        return buf.getvalue()

    @modal.method()
    def edit_image(
        self,
        prompt: str,
        image_bytes_list: List[bytes],
        quality: str = "standard",
        num_steps: int = 28,
        cfg_scale: float = 4.0,
        img_cfg_scale: float = 1.0,
        timestep_shift: float = 3.0,
        seed: Optional[int] = None,
    ) -> bytes:
        """Image-to-Image / Multi-Image Editing with SenseNova-U1.5-8B-MoT."""
        import random
        import torch
        from PIL import Image
        from sensenova_u1.models.neo_unify.utils import smart_resize

        if seed is None or seed < 0:
            seed = random.randint(0, 2**31 - 1)

        target_pixels = (2048 * 2048) if quality == "ultra" else (1024 * 1024)

        # Preprocess input images
        pil_inputs = []
        budget = max(EDIT_INPUT_MIN_PIXELS, target_pixels // max(1, len(image_bytes_list)))

        for raw_bytes in image_bytes_list[:4]:
            img = Image.open(io.BytesIO(raw_bytes))
            if img.mode == "RGBA":
                bg = Image.new("RGB", img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[3])
                img = bg
            img = img.convert("RGB")
            h, w = smart_resize(
                height=img.height,
                width=img.width,
                factor=EDIT_GRID_FACTOR,
                min_pixels=budget,
                max_pixels=budget,
            )
            if (w, h) != img.size:
                img = img.resize((w, h), Image.LANCZOS)
            pil_inputs.append(img)

        # Calculate output size from first reference image
        ref = pil_inputs[0]
        out_h, out_w = smart_resize(
            height=ref.height,
            width=ref.width,
            factor=EDIT_GRID_FACTOR,
            min_pixels=target_pixels,
            max_pixels=target_pixels,
        )

        print(f"--> [IT2I] Editing with {len(pil_inputs)} inputs: '{prompt}' | Output: {out_w}x{out_h} | Steps: {num_steps} | Seed: {seed}")

        with torch.inference_mode():
            tensor = self.model.it2i_generate(
                self.tokenizer,
                prompt,
                pil_inputs,
                image_size=(out_w, out_h),
                cfg_scale=float(cfg_scale),
                img_cfg_scale=float(img_cfg_scale),
                cfg_norm="none",
                timestep_shift=float(timestep_shift),
                cfg_interval=(0.0, 1.0),
                num_steps=int(num_steps),
                batch_size=1,
                think_mode=False,
                seed=int(seed),
            )

        pil_img = _to_pil(tensor)[0]
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        del tensor
        torch.cuda.empty_cache()
        return buf.getvalue()

    @modal.asgi_app()
    def serve(self):
        """Standard HTTP REST ASGI FastAPI App for SenseNova."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from pydantic import BaseModel
        from typing import Optional, List

        web_app = FastAPI(title="SenseNova U1.5 Engine")
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        class GeneratePayload(BaseModel):
            action: str = "generate"
            prompt: str = ""
            images: List[str] = []
            aspect_ratio: str = "1:1"
            quality: str = "standard"
            num_steps: int = 28
            cfg_scale: float = 4.0
            img_cfg_scale: float = 1.0
            timestep_shift: float = 3.0
            seed: Optional[int] = None

        @web_app.post("/")
        @web_app.post("/generate")
        def run_generation(request: GeneratePayload):
            start = time.time()
            if request.action == "edit":
                image_bytes_list = [base64.b64decode(b) for b in request.images]
                out_bytes = self.edit_image.local(
                    prompt=request.prompt,
                    image_bytes_list=image_bytes_list,
                    quality=request.quality,
                    num_steps=request.num_steps,
                    cfg_scale=request.cfg_scale,
                    img_cfg_scale=request.img_cfg_scale,
                    timestep_shift=request.timestep_shift,
                    seed=request.seed,
                )
            else:
                out_bytes = self.generate_image.local(
                    prompt=request.prompt,
                    aspect_ratio=request.aspect_ratio,
                    quality=request.quality,
                    num_steps=request.num_steps,
                    cfg_scale=request.cfg_scale,
                    timestep_shift=request.timestep_shift,
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
# Local Test Runner
# ---------------------------------------------------------------------------
@app.local_entrypoint()
def test(prompt: str = "A futuristic cyberpunk city in neon rain with intricate details", aspect_ratio: str = "16:9"):
    """Run a test generation from your local CLI:
    modal run sensenova_engine.py --prompt "A serene mountain lake at sunrise"
    """
    engine = SenseNovaEngine()
    print(f"Sending prompt to SenseNova: '{prompt}'...")
    png_bytes = engine.generate_image.remote(prompt=prompt, aspect_ratio=aspect_ratio, num_steps=28)
    output_filename = "sensenova_sample.png"
    with open(output_filename, "wb") as f:
        f.write(png_bytes)
    print(f"✓ Image saved locally to {output_filename} ({len(png_bytes)} bytes)")
