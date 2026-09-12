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

// Song Client (ACE-Step 1.5 Turbo full vocal songs)
export const cadenceSong = createClient<any>({
  baseUrl: env.CADENCE_SONG_API_URL || env.CADENCE_API_URL,
  headers: {
    "x-api-key": env.CADENCE_API_KEY,
  },
});

// Backward compatibility alias
export const chatterbox = cadence;
