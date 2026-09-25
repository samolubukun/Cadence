<div align="center">

<img src="./public/cadence-banner.png" alt="Cadence Banner" width="100%" />

<br /><br />

# Cadence
### The open platform for every layer of voice, music, and media creation.

Generative voice, music, speech, and media studio. High-throughput text-to-speech, zero-shot voice cloning, word-accurate transcription, full vocal song composition, cinematic sound effects, speech-to-speech conversion, and generative video visualizers. Built with **Next.js 16 (React 19)**, **Convex**, **Cloudflare R2**, and **Serverless NVIDIA A10G GPUs via Modal**.

<br />

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />&nbsp;
  <img src="https://img.shields.io/badge/React-19-087EA4?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />&nbsp;
  <img src="https://img.shields.io/badge/Convex-Realtime_DB-FF7A00?style=for-the-badge&logo=convex&logoColor=white" alt="Convex" />&nbsp;
  <img src="https://img.shields.io/badge/Modal-NVIDIA_A10G-000000?style=for-the-badge&logo=modal&logoColor=white" alt="Modal" />&nbsp;
  <img src="https://img.shields.io/badge/Clerk-Organizations-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />&nbsp;
  <img src="https://img.shields.io/badge/Cloudflare-R2_Storage-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare R2" />&nbsp;
  <img src="https://img.shields.io/badge/OpenAI-Whisper_v3-412991?style=for-the-badge&logo=openai&logoColor=white" alt="Whisper" />&nbsp;
  <img src="https://img.shields.io/badge/Chatterbox-Turbo_TTS-10B981?style=for-the-badge&logo=pytorch&logoColor=white" alt="Chatterbox" />&nbsp;
  <img src="https://img.shields.io/badge/ACE--Step-Song_Gen-6366F1?style=for-the-badge&logo=huggingface&logoColor=white" alt="ACE-Step" />&nbsp;
  <img src="https://img.shields.io/badge/Meta-MusicGen-8B5CF6?style=for-the-badge&logo=meta&logoColor=white" alt="MusicGen" />&nbsp;
  <img src="https://img.shields.io/badge/Meta-AudioGen-F59E0B?style=for-the-badge&logo=meta&logoColor=white" alt="AudioGen" />&nbsp;
  <img src="https://img.shields.io/badge/MyShell-OpenVoice_v2-EC4899?style=for-the-badge&logo=github&logoColor=white" alt="OpenVoice" />&nbsp;
  <img src="https://img.shields.io/badge/Stability-SDXL--Turbo-06B6D4?style=for-the-badge&logo=stabilityai&logoColor=white" alt="SDXL-Turbo" />&nbsp;
  <img src="https://img.shields.io/badge/SenseNova-U1.5--8B_MoT-8B5CF6?style=for-the-badge&logo=pytorch&logoColor=white" alt="SenseNova-U1.5" />&nbsp;
  <img src="https://img.shields.io/badge/Wan-Video_2.1-A855F7?style=for-the-badge&logo=pytorch&logoColor=white" alt="Wan2.1" />
</p>

</div>

---

## Overview

Cadence is a self-hostable, full-spectrum generative audio, music, and media platform:

- **Text-to-Speech (TTS) Studio**: Expressive neural speech synthesis powered by Chatterbox Turbo with dynamic creativity, pacing, style presets (Balanced, Expressive, Steady), and real-time cost estimation.
- **Zero-Shot Voice Cloning**: Clone any voice in under 3 seconds using a 5-to-15 second reference audio sample, direct microphone recording, or uploaded audio stems.
- **Speech-to-Text (STT) & Subtitles**: Multilingual speech recognition powered by OpenAI Whisper (`large-v3`) with interactive word-level timestamp scrubbers and subtitle exports (.srt, .vtt).
- **Music Studio (Beats & Full Songs)**:
  - **Beats & Instrumentals**: Generate pure instrumental tracks, loops, and synth soundscapes up to 120 seconds powered by **Meta MusicGen**.
  - **Full Songs with Vocals**: Compose complete songs with custom lyrics, verses, choruses, and singing vocals up to 240 seconds powered by **ACE-Step 1.5 Turbo**.
- **Sound Effects Studio**: Generate photorealistic Foley effects, cinematic impacts, and ambient soundscapes powered by **Meta AudioGen**.
- **Voice Changer & Speech-to-Speech**: Zero-shot timbre and pitch conversion powered by **MyShell OpenVoice v2**, preserving original timing, pitch dynamics, and emotion.
- **Viral Video Clipper Studio**: Automated long-form video to 9:16 vertical shorts converter with Whisper Large-v3 timestamps, Qwen2.5 virality evaluation, YOLO11 active speaker reframing, and burned kinetic subtitles across 10 presets and 16 creator fonts.
- **Visuals & Video Studio**: Generate high-resolution 1024x1024 album cover art with **SDXL-Turbo** and cinematic motion video visualizers with **Wan2.1 1.3B**.
- **Real-Time Voice Agent Studio (`/agent`)**: Ultra-low latency conversational AI agent powered by **Silero VAD**, **NVIDIA Parakeet / Whisper ASR**, **Qwen2.5-1.5B-Instruct**, and dual-mode TTS (sub-200ms **Kokoro-82M** speed mode + zero-shot **Chatterbox** cloned voice proxying) with barge-in interruption handling and full transcript inspection.
- **Curated Voice Library**: Pre-seeded broadcast-quality voice personas with instant preview audition and custom cloned voice management.
- **Usage Accounting & Multi-Tenancy**: Deterministic credit deduction ledger backed by Convex and Clerk Organizations.

---

## High-Performance Microservice Architecture

Cadence features a clean microservice architecture deployed on serverless NVIDIA A10G GPUs via Modal, split into four decoupled specialized engines:

```mermaid
graph TD
    %% Styling Classes
    classDef client fill:#f8fafc,stroke:#475569,stroke-width:2px,color:#0f172a;
    classDef edge fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412;
    classDef db fill:#ecfdf5,stroke:#10b981,stroke-width:2px,color:#065f46;
    classDef audioEngine fill:#f5f3ff,stroke:#8e75ff,stroke-width:2px,color:#5b21b6;
    classDef soundEngine fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e;
    classDef songEngine fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#3730a3;
    classDef mediaEngine fill:#ecfeff,stroke:#06b6d4,stroke-width:2px,color:#0e7490;

    subgraph Client ["Client Interface"]
        UI["Cadence Studio (Next.js 16 + React 19)"]
    end

    subgraph Edge ["API Layer & Edge Proxy"]
        TRPC["tRPC Routers & Edge API Routes"]
        R2_Store[("Cloudflare R2 Object Storage")]
        Convex_DB[("Convex Real-Time Database")]
    end

    subgraph Microservices ["Modal Serverless GPU Microservices"]
        AudioEng["CadenceAudioEngine<br/>• Chatterbox Turbo (TTS / Cloning)<br/>• Whisper large-v3 (STT Timestamps)<br/>• OpenVoice v2 (Speech-to-Speech)"]
        SoundEng["CadenceSoundEngine<br/>• AudioGen (SFX / Foley)<br/>• MusicGen (Instrumental Beats)"]
        SongEng["CadenceSongEngine<br/>• ACE-Step 1.5 Turbo (Full Vocal Songs)"]
        MediaEng["CadenceMediaEngine<br/>• SDXL-Turbo (Images & Covers)<br/>• Wan2.1 1.3B (Cinematic Video)"]
    end

    UI -->|"User Actions & Real-Time Queries"| TRPC
    TRPC -->|"Audio Stems & Media Uploads"| R2_Store
    TRPC -->|"State, Logs & Credit Accounting"| Convex_DB

    TRPC -->|"TTS, STT, Voice Changer"| AudioEng
    TRPC -->|"Beats & SFX Foley"| SoundEng
    TRPC -->|"Full Vocal Songs with Lyrics"| SongEng
    TRPC -->|"Cover Art & Video Visualizers"| MediaEng

    AudioEng -->|"Direct Filesystem Mount (/r2)"| R2_Store
    SoundEng -->|"Weights Cache Mount"| R2_Store
    SongEng -->|"Direct Filesystem Mount (/r2)"| R2_Store
    MediaEng -->|"Direct Filesystem Mount (/r2)"| R2_Store

    class UI client;
    class TRPC,R2_Store edge;
    class Convex_DB db;
    class AudioEng audioEngine;
    class SoundEng soundEngine;
    class SongEng songEngine;
    class MediaEng mediaEngine;
```

### Architectural Highlights
1. **Decoupled Microservice Engines**: Voice synthesis/transcription, sound effects/beats, song composition, and media generation run in isolated Modal GPU containers with independent dependency stacks and dedicated memory boundaries.
2. **PyTorch VRAM Management & Memory Isolation**: All containers run with `PYTORCH_CUDA_ALLOC_CONF="expandable_segments:True"` with explicit `torch.cuda.empty_cache()` and `gc.collect()` in route cleanup blocks, eliminating CUDA memory fragmentation and Out-Of-Memory risks.
3. **Serverless GPU Scale-to-Zero**: Powered by Modal container definitions with `scaledown_window=300` (5 minutes warm stay-alive). Containers scale to 0 when idle ($0.00 cost).
4. **Zero-Latency R2 Mounting (`modal.CloudBucketMount`)**: Reference voice files and audio assets are mounted at `/r2` directly in the Linux filesystem.
5. **Reactive State Synchrony**: Built on Convex subscriptions. Generations, billing ledgers, and voice libraries synchronize live without client polling.

---

## Core Product Studios

### 1. Text-to-Speech Studio (`/text-to-speech`)
- **Neural Speech Generation**: High-fidelity speech synthesis powered by Chatterbox Turbo.
- **Redesigned Input Card**: Spacious text editor with character counter, real-time cost estimation (`$0.0000 est.`), and quick "Clear" and "New" actions.
- **Style Presets**: 1-click presets (**Balanced**, **Expressive**, **Steady**) that automatically configure temperature, top-p, and penalties.
- **Audio Dynamics Controls**: Fine-tune Creativity, Voice Variety, Expression Range, and Natural Flow with live numerical value badges and a 1-click **Reset defaults** button.
- **Generation History with Search**: Instant keyword search, active clip highlighting ("Playing" badge), and voice metadata.
- **Compacted Audio Preview**: Streamlined waveform player with scrubber, 10s seek forward/backward, time counter, and one-click download.

### 2. Dedicated Voice Cloning Studio (`/voice-clone`)
- **Zero-Shot Voice Cloning**: Create permanent, personalized voice profiles from a 5–15 second audio sample without model retraining.
- **Flexible Ingestion**: Upload audio (`WAV`, `MP3`, `M4A`, `FLAC`) or record live speech directly using the built-in microphone recorder.
- **Cloud Persistence**: Voice profiles are cataloged in Convex and stored in Cloudflare R2 under your organization.

### 3. Speech-to-Text & Subtitles Studio (`/transcribe`)
- **Multilingual Whisper Engine**: Transcribe spoken audio using OpenAI Whisper `large-v3`.
- **Word-Level Timestamps**: Synchronized interactive timestamps that jump the audio scrubber directly to specific words upon clicking.
- **Dual View Modes**: Seamless toggle between formatted timestamp blocks and clean text copy.
- **Subtitle Export**: Export transcription directly to `.srt` or `.vtt` format.

### 4. Music & Sound Studio (`/music`)
- **Beats & Instrumentals Mode**: Powered by **Meta MusicGen**. Craft hip-hop loops, electronic dance tracks, jazz chords, ambient soundscapes, or cinematic orchestral beds up to 120 seconds.
- **Full Song with Vocals Mode**: Powered by **ACE-Step 1.5 Turbo**. Generate complete songs featuring singing, harmonies, verses, and choruses from custom prompts and lyrics up to 240 seconds.
- **Sound Effects & Foley Mode**: Powered by **Meta AudioGen**. Synthesize photorealistic sound effects, ambient environments, and cinematic Foley from descriptive prompts (1–30s).
- **Custom Duration & Sliders**: Dedicated length sliders and instant in-studio waveform playback per mode.

### 5. Voice Changer Studio (`/voice-changer`)
- **Zero-Shot Speech-to-Speech**: Powered by **MyShell OpenVoice v2**. Morph voice timbre while preserving exact emotional intonation, pitch dynamics, cadence, and pause timing.
- **Input & Target Flexibility**: Upload or record source audio and convert it to match any target voice profile.

### 6. Viral Video Clipper Studio (`/clipper`)
- **Automated Long-to-Short Conversion**: Extract high-engagement viral clips from YouTube videos or uploaded files.
- **Timestamp Grounding & Zero Hallucination**: Uses **Whisper Large-v3** for microsecond word timestamps and **Qwen2.5-1.5B** for discrete chunk virality scoring (4-pillar: Hook, Engagement, Value, Shareability).
- **AI Visual Reframing**: **YOLO11** active speaker tracking with clamped dynamic panning, split-screen podcast layouts, and blurred background fills.
- **Kinetic Subtitle Engine**: 10 distinct styling presets (Hormozi, MrBeast, TikTok Clean, Neon Cyber, Podcast Pill, etc.) with word-pop bounce and 16 creator fonts.
- **Top Hook Retention Banner & Anti-Dupe Shield**: Burns attention-grabbing headline banners and applies subtle video EQ to avoid duplicate re-upload penalties.
- **Hardware-Accelerated Export**: Real-time rendering via NVIDIA A10G NVENC with direct Cloudflare R2 streaming.

### 7. Visuals & Video Studio (`/media`)
- **Dual-Tier Image Generation**:
  - **Standard Mode (SDXL-Turbo)**: Ultra-fast 1–2 second generative artwork in 1:1, 16:9, or 9:16 aspect ratios (20 credits).
  - **Advanced Studio Mode (SenseNova-U1.5-8B MoT)**: 8-billion parameter mixture-of-trajectories diffusion transformer for studio releases, crisp graphic typography, and professional marketing flyers (50 credits).
- **AI Image Editing (SenseNova-U1.5-8B MoT)**:
  - **Zero-Shot Image-to-Image / Inpainting**: Upload any existing photo or artwork and describe desired edits in natural language (`it2i_generate`).
  - **Context-Aware Style & Lighting Reworks**: Add holographic elements, change backgrounds, relight scenes with studio volumetrics, or stylize into anime/sculpture aesthetics while preserving core structure.
  - **Fine Control**: Standard (1024) or Ultra (2048) resolution modes with granular Image Guidance Scale adjustments (50 credits).
- **Cinematic Video Visualizers**: Powered by **Wan2.1 1.3B**. Render fluid video visualizers and motion backgrounds matching track moods.

### 8. Voice Library (`/voices`)
- **Curated Catalog**: 30 distinct voice personas across narrative, conversational, character, and commercial styles.
- **Live Audition**: Immediate preview playback for testing voices.
- **Unified Header & Search**: Streamlined search toolbar and categorized voice counts.

### 9. Real-Time Conversational Voice Agent (`/agent`)
- **Ultra-Low Latency Duplex Voice Pipeline**: Natural voice conversations over WebSockets utilizing the OpenAI Realtime Protocol.
- **Silero VAD & Instant Barge-In**: Real-time voice activity detection with instantaneous audio interruption and queue eviction when the user speaks.
- **Dual-Mode TTS Pipeline**:
  - **Speed Mode**: Sub-200ms TTFT neural speech generation with **Kokoro-82M**.
  - **Cloned Voice Mode**: High-fidelity zero-shot speech synthesis proxying to **Chatterbox Turbo** using your custom voice clones.
- **Organic Liquid Visualizer**: High-frequency canvas-rendered volumetric audio orb with reactive dynamic sound wave harmonic bars.
- **Persona Customization**: Switch instantly between Casual and fully Custom Personas with user-editable system instructions.
- **Session History & Inspect**: Clickable session cards that open complete multi-turn conversation transcripts with TTFT latency and generation metrics.

---

## Modal Microservice Engines

Cadence organizes serverless compute into dedicated microservice engines:

| Engine Class | Models Included | GPU / Hardware | Endpoints Hosted |
| :--- | :--- | :--- | :--- |
| **`CadenceAudioEngine`** | Chatterbox Turbo, Whisper large-v3, OpenVoice v2 | NVIDIA A10G (24GB) | `/generate`, `/transcribe`, `/voice-change` |
| **`CadenceSoundEngine`** | Meta AudioGen (Audiocraft), Meta MusicGen Melody (Audiocraft) | NVIDIA A10G (24GB) | `/health`, `/generate-sound`, `/generate-beats`, `/generate-song` (fallback) |
| **`CadenceSongEngine`** | ACE-Step 1.5 Turbo (`torchcodec`) | NVIDIA A10G (24GB) | `/health`, `/generate-song` |
| **`CadenceMediaEngine`** | SDXL-Turbo, Wan2.1 1.3B | NVIDIA A10G (24GB) | `/generate-image`, `/generate-video` |
| **`CadenceStudioEngine`** | Meta Demucs v4, RVC v2, Resemble Enhance | NVIDIA A10G (24GB) | `/separate-stems`, `/convert-singing`, `/enhance-audio` |
| **`CadenceViralClipper`** | Whisper Large-v3, Qwen2.5-1.5B, YOLO11, NVENC | NVIDIA A10G (24GB) | `/health`, `/api/clip` |
| **`SenseNovaEngine`** | SenseNova-U1.5-8B-MoT | NVIDIA A10G / L40S (24GB+) | `/`, `/generate` |
| **`QwenImageEngine`** | Qwen/Qwen-Image-2.1 (7B DiT + 8B Qwen3-VL) | NVIDIA A10G (24GB) | `/health`, `/generate` |
| **`CadenceAgentEngine`** | Silero VAD, NVIDIA Parakeet / Whisper, Qwen2.5-1.5B, Kokoro-82M | NVIDIA A10G (24GB) | `/ws/realtime`, `/health` |

### API Endpoints Reference

| Endpoint | Engine | Method | Input Parameters | Output | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `/ws/realtime` | Agent | `WebSocket` | Binary 24kHz PCM / OpenAI Realtime JSON frames | WebSocket Stream | Full-duplex conversational voice agent with VAD & barge-in |
| `/generate` (action: "generate") | Qwen-Image | `POST` | `prompt`, `aspect_ratio`, `num_steps`, `quality`, `guidance_scale` | JSON (base64) | Qwen-Image-2.1 state-of-the-art text-to-image synthesis |
| `/generate` (action: "edit") | Qwen-Image | `POST` | `prompt`, `images` (base64), `quality`, `guidance_scale` | JSON (base64) | Qwen-Image-2.1 multi-image contextual editing (up to 10 references) |
| `/generate` | Audio | `POST` | `prompt`, `voice_key`, `temperature`, `top_p`, `top_k`, `repetition_penalty` | `audio/wav` | Chatterbox Turbo TTS speech synthesis |
| `/transcribe` | Audio | `POST` | `multipart/form-data` audio file or `audio_key` | JSON | Multilingual Whisper large-v3 transcription with word-level timestamps |
| `/voice-change` | Audio | `POST` | `file` or `source_audio_key`, `target_voice_key`, `pitch_shift` | `audio/wav` | OpenVoice v2 zero-shot timbre conversion |
| `/api/clip` | Clipper | `POST` | `source_type`, `r2_source_key`, `num_clips`, `aspect_ratio`, `enable_reframe`, `reframe_mode`, `subtitle_style`, `font_family` | JSON | Viral moment extraction, YOLO reframing, kinetic subtitles, NVENC render to R2 |
| `/generate-sound` | Sound | `POST` | `prompt`, `duration` (1–30s) | `audio/wav` | Meta AudioGen Foley and sound effect synthesis |
| `/generate-beats` | Sound | `POST` | `prompt`, `duration` (10–120s) | `audio/wav` | Meta MusicGen instrumental beat and loop generation |
| `/generate-song` | Song / Sound | `POST` | `prompt`, `lyrics`, `duration` (10–240s) | `audio/wav` | ACE-Step 1.5 Turbo full vocal track composition (or MusicGen fallback) |
| `/separate-stems` | Studio | `POST` | `audio_base64`, `audio_key` | JSON (4 stems) | Meta Demucs v4 neural 4-track stem separation (Vocals, Drums, Bass, Other) |
| `/convert-singing` | Studio | `POST` | `audio_base64`, `target_voice_key`, `pitch_shift` | `audio/wav` | RVC v2 musical singing voice conversion with pitch transpose |
| `/enhance-audio` | Studio | `POST` | `audio_base64`, `audio_key` | `audio/wav` | Resemble Enhance 44.1kHz deep denoising and studio vocoding |
| `/generate-image` | Media | `POST` | `prompt`, `aspect_ratio`, `num_steps` | `image/png` | SDXL-Turbo real-time 1024x1024 cover art generation |
| `/generate` (action: "generate") | SenseNova | `POST` | `prompt`, `aspect_ratio`, `num_steps`, `quality` | JSON (base64) | SenseNova-U1.5-8B MoT studio-quality photorealistic rendering |
| `/generate` (action: "edit") | SenseNova | `POST` | `prompt`, `images` (base64), `quality`, `img_cfg_scale` | JSON (base64) | SenseNova-U1.5-8B MoT neural image editing and style transformation |
| `/generate-video` | Media | `POST` | `prompt`, `duration_seconds` (2–5s), `resolution` | `video/mp4` | Wan2.1 1.3B text-to-video diffusion visualizer |

---

## Deployment & Setup Guide

### 1. Prerequisites
- **Node.js**: `v20.9.0` or higher
- **Python**: `3.10` or higher (with `pip` and virtual environment)
- **Modal Account**: For serverless GPU deployment ([modal.com](https://modal.com))
- **Cloudflare R2**: Object storage bucket named `cadence`
- **Convex Account**: Real-time database ([convex.dev](https://convex.dev))
- **Clerk Account**: Authentication with Organizations enabled ([clerk.com](https://clerk.com))

---

### 2. Deploy Modal GPU Microservices

#### Step A: Install and Authenticate Modal
```bash
pip install modal
modal setup
```

#### Step B: Configure Modal Secrets
In your [Modal Dashboard](https://modal.com/secrets), configure the required secrets:

1. **`cloudflare-r2`**:
   - `AWS_ACCESS_KEY_ID`: Cloudflare R2 Access Key ID
   - `AWS_SECRET_ACCESS_KEY`: Cloudflare R2 Secret Access Key
2. **`cadence-api-key`**:
   - `CADENCE_API_KEY`: A secure random secret key (e.g. `cadence_secret_...`)
3. **`hf-token`** *(Recommended)*:
   - `HF_TOKEN`: HuggingFace User Access Token

#### Step C: Deploy the Engines
Deploy the core Cadence multi-engine stack:

```bash
modal deploy cadence_engine.py
```

Deploy the dedicated Audio Studio Engine (Demucs v4, RVC v2, Resemble Enhance):

```bash
modal deploy cadence_studio_engine.py
```

Deploy the Viral Video Clipper Engine (Whisper Large-v3, Qwen2.5-1.5B, YOLO11, NVENC):

```bash
modal deploy cadence_clipper_engine.py
```

Deploy the Real-Time Conversational Voice Agent Engine (Silero VAD, NVIDIA Parakeet / Whisper, Qwen2.5, Kokoro, Chatterbox proxy):

```bash
modal deploy cadence_agent_engine.py
```

Deploy the optional SenseNova-U1.5-8B MoT Studio Visual Engine:

```bash
modal deploy sensenova_engine.py
```

Deploy the standalone Qwen-Image-2.1 Studio Visual Engine (7B DiT + 8B Qwen3-VL):

```bash
modal deploy qwen_image_engine.py
```

*Modal will output your live service URLs for each engine:*
- `https://<workspace>--cadence-cadenceaudioengine-serve.modal.run`
- `https://<workspace>--cadence-cadencesoundengine-serve.modal.run`
- `https://<workspace>--cadence-cadencesongengine-serve.modal.run`
- `https://<workspace>--cadence-cadencemediaengine-serve.modal.run`
- `https://<workspace>--cadence-studio-cadencestudioengine-serve.modal.run`
- `https://<workspace>--cadence-clipper-cadenceviralclipper-serve.modal.run`
- `https://<workspace>--sensenova-u1-5-sensenovaengine-serve.modal.run`

---

### 3. Configure Frontend Environment

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

```env
# Next.js Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex Real-Time Database
NEXT_PUBLIC_CONVEX_URL=https://<your-convex-deployment>.convex.cloud

# Cloudflare R2 Object Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=cadence
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-<your-id>.r2.dev

# Modal Microservice Endpoints
CADENCE_API_URL=https://<workspace>--cadence-cadenceaudioengine-serve.modal.run
CADENCE_SOUND_API_URL=https://<workspace>--cadence-cadencesoundengine-serve.modal.run
CADENCE_SONG_API_URL=https://<workspace>--cadence-cadencesongengine-serve.modal.run
CADENCE_MEDIA_API_URL=https://<workspace>--cadence-cadencemediaengine-serve.modal.run
CADENCE_SENSENOVA_API_URL=https://<workspace>--sensenova-u1-5-sensenovaengine-serve.modal.run
CADENCE_STUDIO_API_URL=https://<workspace>--cadence-studio-cadencestudioengine-serve.modal.run
CADENCE_API_KEY=your_cadence_api_key
```

Sync environment variables with your Convex cloud deployment:

```bash
npx convex env set CADENCE_API_URL https://<workspace>--cadence-cadenceaudioengine-serve.modal.run
npx convex env set CADENCE_API_KEY your_cadence_api_key
```

---

### 4. Seed Canonical Voices

Cadence comes pre-packaged with 30 diverse reference voices (gender-balanced, across multiple accents and vocal styles). Seed them to your Convex database and Cloudflare R2 bucket:

```bash
npm run seed:voices
```

---

### 5. Launch the Local Development Server

```bash
# Start the Convex development backend
npx convex dev

# In a separate terminal, launch the Next.js dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 6. Verify All Live Endpoints

Run the automated endpoint test suite to verify all live Modal services:

```bash
python scripts/run_all_endpoints_test.py
```

---

## Project Structure

```
cadence/
├── cadence_engine.py           # Modal serverless GPU microservices (Audio, Song, Media)
├── convex/                     # Convex reactive database
│   ├── schema.ts               # Tables: users, organizations, generations, voices, studio
│   ├── studio.ts               # Music, SFX, Voice Changer, and Media mutations
│   ├── voices.ts               # Voice queries, canonical catalog, and custom voice mutations
│   ├── speechToText.ts         # Whisper transcription mutation & timestamp ingestion
│   ├── textToSpeech.ts         # Audio generation orchestration & credit checks
│   └── billing.ts              # Credit transaction accounting ledger
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Authenticated workspace layout
│   │   │   ├── text-to-speech/ # Upgraded TTS studio view & generation playback
│   │   │   ├── transcribe/     # Whisper STT studio with timestamp scrubber
│   │   │   ├── music/          # Music Studio (MusicGen beats & ACE-Step songs)
│   │   │   ├── sound-fx/       # Sound FX Studio (AudioGen Foley)
│   │   │   ├── voice-changer/  # Voice Changer Studio (OpenVoice v2)
│   │   │   ├── media/          # Visuals & Video Studio (SDXL & Wan2.1)
│   │   │   ├── voices/         # System & custom voice library
│   │   │   ├── voice-clone/    # Dedicated voice cloning studio
│   │   │   └── billing/        # Usage history & credit balance
│   │   └── api/                # Edge API routes & audio streaming proxy
│   ├── features/               # Modular domain feature components
│   │   ├── text-to-speech/     # TTS editor, presets, sliders, history search, audio preview
│   │   ├── speech-to-text/     # Whisper waveform scrubber & timestamp block renderer
│   │   ├── voices/             # Voice card grid, category filters, audition players
│   │   ├── voice-clone/        # Audio stem recorder, upload dropzone, clone wizard
│   │   └── dashboard/          # Sidebar navigation and workspace overview
│   ├── lib/                    # Storage, R2 S3 client, Convex clients, env schema
│   └── trpc/                   # End-to-end typed RPC routers (voices, generations, studio)
└── scripts/                    # Voice seeding and comprehensive Modal endpoint test suite
```

---

## License & Acknowledgements

### Voice Dataset & System Voices
- **[CSTR VCTK Corpus (Voice Cloning Toolkit)](https://www.kaggle.com/datasets/pratt3000/vctk-corpus/data)**: Curated corpus of English speech recorded by 110 English speakers with various accents, used to curate Cadence's 30 canonical system voices and reference timbres under the **Open Data Commons Attribution License (ODC-By v1.0)** / University of Edinburgh CSTR. Available on [Kaggle](https://www.kaggle.com/datasets/pratt3000/vctk-corpus/data) and the [University of Edinburgh CSTR](https://datashare.ed.ac.uk/handle/10283/3443).

### AI Foundation Models & Frameworks
- **[Chatterbox TTS](https://github.com/resemble-ai/chatterbox)** by Resemble AI: Open-source zero-shot voice synthesis.
- **[OpenAI Whisper](https://github.com/openai/whisper)**: State-of-the-art multilingual speech recognition.
- **[ACE-Step 1.5](https://huggingface.co/spaces/ACE-Studio/ACE-Step)**: Full vocal song generation model.
- **[Meta MusicGen & AudioGen](https://github.com/facebookresearch/audiocraft)** by Meta AI: Instrumental music composition and Foley sound effects synthesis.
- **[MyShell OpenVoice](https://github.com/myshell-ai/OpenVoice)**: Zero-shot speech-to-speech voice conversion.
- **[Stability AI SDXL-Turbo](https://huggingface.co/stabilityai/sdxl-turbo)**: Real-time photorealistic text-to-image synthesis.
- **[Wan2.1](https://github.com/Wan-Video/Wan2.1)**: State-of-the-art open generative video model.
- **[Modal](https://modal.com)**: Serverless NVIDIA A10G GPU orchestration and auto-scaling.
- **[Convex](https://convex.dev)**: Reactive real-time state database.
- **[Clerk](https://clerk.com)**: Identity and multi-tenant organization management.

---

## Creator

Designed & Built with precision by **[Samuel Olubukun](https://samuelolubukun.com/)**  
[![Portfolio](https://img.shields.io/badge/Portfolio-samuelolubukun.com-black?style=for-the-badge&logo=google-chrome&logoColor=white)](https://samuelolubukun.com/)
[![GitHub](https://img.shields.io/badge/GitHub-samolubukun-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/samolubukun)

---

<p align="center">
  <sub>Built for reliable, high-performance, private generative voice, music, speech & media intelligence.</sub>
</p>
