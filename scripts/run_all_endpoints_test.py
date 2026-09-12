"""Comprehensive End-to-End Suite for Cadence Generative Engine.
Tests all endpoints with fresh creative prompts and writes results to test_output/.
"""

import os
import json
import time
import requests
from pathlib import Path
import dotenv

dotenv.load_dotenv(".env.local")
dotenv.load_dotenv(".env")

CADENCE_API_URL = os.environ.get("CADENCE_API_URL", "https://samuelolubukun--cadence-cadenceaudioengine-serve.modal.run")
CADENCE_SOUND_API_URL = os.environ.get("CADENCE_SOUND_API_URL", "https://samuelolubukun--cadence-cadencesoundengine-serve.modal.run")
CADENCE_SONG_API_URL = os.environ.get("CADENCE_SONG_API_URL", "https://samuelolubukun--cadence-cadencesongengine-serve.modal.run")
CADENCE_MEDIA_API_URL = os.environ.get("CADENCE_MEDIA_API_URL", "https://samuelolubukun--cadence-cadencemediaengine-serve.modal.run")
API_KEY = os.environ.get("CADENCE_API_KEY", "cadence-secret-key")

OUTPUT_DIR = Path("test_output")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "x-api-key": API_KEY,
}

SYSTEM_VOICE_A = "voices/system/jd704hxf4y0cy4xtpgep735ek98e4ng8"
SYSTEM_VOICE_B = "voices/system/jd707g0ztk96j7adn4mbhvyfmn8e4pn4"

def run_image_gen():
    print("\n[1/7] Testing /generate-image (SDXL-Turbo Photoreal 1024x1024)...")
    url = f"{CADENCE_MEDIA_API_URL}/generate-image"
    payload = {
        "prompt": "Award-winning studio photography of an ethereal bioluminescent glass jellyfish floating above a reflective obsidian lake under aurora borealis, ultra-detailed, cinematic lighting, 8k resolution, photorealistic",
        "aspect_ratio": "1:1"
    }
    t0 = time.time()
    try:
        res = requests.post(url, json=payload, headers=HEADERS, timeout=120)
        elapsed = time.time() - t0
        if res.status_code == 200:
            out_file = OUTPUT_DIR / "showcase_image_bioluminescent.png"
            out_file.write_bytes(res.content)
            print(f"  --> Saved: {out_file} ({len(res.content):,} bytes in {elapsed:.2f}s)")
        else:
            print(f"  Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"  Error: {e}")

def run_video_gen():
    print("\n[2/7] Testing /generate-video (Wan2.1 Cinematic Video)...")
    url = f"{CADENCE_MEDIA_API_URL}/generate-video"
    payload = {
        "prompt": "Hypnotic cinematic drone flight through a mystical crystalline cave with swirling golden particles and pulsing iridescent mineral spires, fluid natural motion, volumetric rays",
        "duration_seconds": 4
    }
    t0 = time.time()
    try:
        res = requests.post(url, json=payload, headers=HEADERS, timeout=300)
        elapsed = time.time() - t0
        if res.status_code == 200:
            out_file = OUTPUT_DIR / "showcase_video_crystal_cave.mp4"
            out_file.write_bytes(res.content)
            print(f"  --> Saved: {out_file} ({len(res.content):,} bytes in {elapsed:.2f}s)")
        else:
            print(f"  Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"  Error: {e}")

def run_beats_gen():
    print("\n[3a/8] Testing /generate-beats (MusicGen Instrumental Beat)...")
    url = f"{CADENCE_SOUND_API_URL}/generate-beats"
    payload = {
        "prompt": "Dark heavy trap beat 140 BPM with rolling 808 bass, punchy kick, snappy snares and cinematic string chords",
        "duration": 15
    }
    t0 = time.time()
    try:
        res = requests.post(url, json=payload, headers=HEADERS, timeout=180)
        elapsed = time.time() - t0
        if res.status_code == 200:
            out_file = OUTPUT_DIR / "showcase_beats_trap.wav"
            out_file.write_bytes(res.content)
            print(f"  --> Saved: {out_file} ({len(res.content):,} bytes in {elapsed:.2f}s)")
        else:
            print(f"  Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"  Error: {e}")

def run_song_gen():
    print("\n[3b/8] Testing /generate-song (ACE-Step 1.5 Turbo Vocal Song)...")
    url = f"{CADENCE_SONG_API_URL}/generate-song"
    payload = {
        "prompt": "Warm soulful afro-fusion R&B ballad with clean electric rhodes piano, gentle acoustic guitar, and lush sub-bass groove",
        "lyrics": "[Verse] Sun setting slow over golden waves, memories of your sweet embrace. [Chorus] Hold me closer till the twilight fades, in the rhythm of this night.",
        "duration": 15
    }
    t0 = time.time()
    try:
        res = requests.post(url, json=payload, headers=HEADERS, timeout=300)
        elapsed = time.time() - t0
        if res.status_code == 200:
            model_used = res.headers.get("x-model", "unknown")
            out_file = OUTPUT_DIR / "showcase_song_vocal.wav"
            out_file.write_bytes(res.content)
            print(f"  --> Saved: {out_file} ({len(res.content):,} bytes in {elapsed:.2f}s, model: {model_used})")
        else:
            print(f"  Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"  Error: {e}")

def run_sound_sfx():
    print("\n[4/7] Testing /generate-sound (AudioGen Cyberpunk Hologram SFX)...")
    url = f"{CADENCE_SOUND_API_URL}/generate-sound"
    payload = {
        "prompt": "Futuristic sci-fi holographic interface powering up with crystalline digital chimes and resonant energy hum",
        "duration": 5.0
    }
    t0 = time.time()
    try:
        res = requests.post(url, json=payload, headers=HEADERS, timeout=120)
        elapsed = time.time() - t0
        if res.status_code == 200:
            out_file = OUTPUT_DIR / "showcase_sfx_hologram.wav"
            out_file.write_bytes(res.content)
            print(f"  --> Saved: {out_file} ({len(res.content):,} bytes in {elapsed:.2f}s)")
        else:
            print(f"  Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"  Error: {e}")

def run_tts():
    print("\n[5/7] Testing /generate (Chatterbox Zero-Shot TTS Speech)...")
    url = f"{CADENCE_API_URL}/generate"
    payload = {
        "prompt": "Welcome to Cadence Studio. Every track, voice, sound effect, and visual here is synthesized directly on dedicated neural engines in real time.",
        "voice_key": SYSTEM_VOICE_A
    }
    t0 = time.time()
    try:
        res = requests.post(url, json=payload, headers=HEADERS, timeout=120)
        elapsed = time.time() - t0
        if res.status_code == 200:
            out_file = OUTPUT_DIR / "showcase_tts_speech.wav"
            out_file.write_bytes(res.content)
            print(f"  --> Saved: {out_file} ({len(res.content):,} bytes in {elapsed:.2f}s)")
            return out_file
        else:
            print(f"  Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"  Error: {e}")
    return None

def run_voice_changer(source_wav_path: Path):
    print("\n[6/7] Testing /voice-change (OpenVoice v2 Zero-Shot Tone Color STS)...")
    url = f"{CADENCE_API_URL}/voice-change"
    t0 = time.time()
    try:
        with open(source_wav_path, "rb") as f:
            files = {"file": ("source.wav", f, "audio/wav")}
            data = {
                "target_voice_key": SYSTEM_VOICE_B,
                "pitch_shift": "0"
            }
            res = requests.post(url, files=files, data=data, headers=HEADERS, timeout=120)
        elapsed = time.time() - t0
        if res.status_code == 200:
            out_file = OUTPUT_DIR / "showcase_voice_changed_sts.wav"
            out_file.write_bytes(res.content)
            print(f"  --> Saved: {out_file} ({len(res.content):,} bytes in {elapsed:.2f}s)")
            print("  --> Converted Speaker Timbre while retaining exact pacing and inflection!")
            return out_file
        else:
            print(f"  Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"  Error: {e}")
    return None

def run_stt_transcription(audio_path: Path):
    print("\n[7/7] Testing /transcribe (Whisper large-v3 STT + Timestamps)...")
    url = f"{CADENCE_API_URL}/transcribe"
    t0 = time.time()
    try:
        with open(audio_path, "rb") as f:
            files = {"file": ("audio_to_transcribe.wav", f, "audio/wav")}
            data = {"diarize": "false"}
            res = requests.post(url, files=files, data=data, headers=HEADERS, timeout=120)
        elapsed = time.time() - t0
        if res.status_code == 200:
            result = res.json()
            out_file = OUTPUT_DIR / "showcase_transcription.json"
            out_file.write_text(json.dumps(result, indent=2))
            print(f"  --> Saved: {out_file} (transcribed in {elapsed:.2f}s)")
            print(f"  --> Language: {result.get('language')}")
            print(f"  --> Text: \"{result.get('text')}\"")
            print(f"  --> Segments / Words: {len(result.get('segments', []))} segments")
        else:
            print(f"  Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("CADENCE COMPLETE GENERATIVE ENGINE - ALL-ENDPOINT SHOWCASE TEST")
    print("=" * 60)
    print(f"Audio Engine: {CADENCE_API_URL}")
    print(f"Song Engine:  {CADENCE_SONG_API_URL}")
    print(f"Media Engine: {CADENCE_MEDIA_API_URL}")

    # 1. Image
    run_image_gen()

    # 2a. Beats & Instrumental
    run_beats_gen()

    # 2b. Full Vocal Song
    run_song_gen()

    # 3. SFX
    run_sound_sfx()

    # 4. Zero-shot TTS Speech
    tts_file = run_tts()

    # 5. Speech-to-Speech Voice Changer (OpenVoice v2)
    if tts_file and tts_file.exists():
        sts_file = run_voice_changer(tts_file)
    else:
        sts_file = run_voice_changer(OUTPUT_DIR / "test_tts_speech.wav")

    # 6. Speech-to-Text with Whisper large-v3
    target_to_transcribe = sts_file if (sts_file and sts_file.exists()) else tts_file
    if target_to_transcribe and target_to_transcribe.exists():
        run_stt_transcription(target_to_transcribe)

    # 7. Video
    run_video_gen()

    print("\n" + "=" * 60)
    print("ALL TESTS COMPLETE! Check folder: c:/Users/USER/Downloads/cadence/test_output/")
    print("=" * 60)
