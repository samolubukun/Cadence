import createClient from "openapi-fetch";
import type { paths } from "@/types/cadence-api";
import { env } from "./env";

export const cadence = createClient<paths>({
  baseUrl: env.CADENCE_API_URL,
  headers: {
    "x-api-key": env.CADENCE_API_KEY,
  },
});

export const cadenceClient = cadence;

// Media Client (SDXL-Turbo Images & Wan2.1 Videos)
export const cadenceMedia = createClient<any>({
  baseUrl: env.CADENCE_MEDIA_API_URL || env.CADENCE_API_URL,
  headers: {
    "x-api-key": env.CADENCE_API_KEY,
  },
});

// Advanced Visuals Client (SenseNova-U1.5-8B MoT Studio Quality)
export const cadenceSenseNova = createClient<any>({
  baseUrl: env.CADENCE_SENSENOVA_API_URL || "https://samuelolubukun--sensenova-u1-5-sensenovaengine-serve.modal.run",
  headers: {
    "x-api-key": env.CADENCE_API_KEY,
  },
});

// Song Client (ACE-Step 1.5 Turbo full vocal songs)
export const cadenceSong = createClient<any>({
  baseUrl: env.CADENCE_SONG_API_URL || env.CADENCE_API_URL,
  headers: {
    "x-api-key": env.CADENCE_API_KEY,
  },
});

// Sound Client (Meta AudioGen SFX & Meta MusicGen Beats)
export const cadenceSound = createClient<any>({
  baseUrl: env.CADENCE_SOUND_API_URL || env.CADENCE_API_URL,
  headers: {
    "x-api-key": env.CADENCE_API_KEY,
  },
});

// Audio Workstation Studio Client (Demucs v4 Stems, RVC v2 Singing Covers, Resemble Enhance)
export const cadenceStudioClient = createClient<any>({
  baseUrl: env.CADENCE_STUDIO_API_URL || env.CADENCE_API_URL,
  headers: {
    "x-api-key": env.CADENCE_API_KEY,
  },
});

// Backward compatibility alias
export const chatterbox = cadence;

