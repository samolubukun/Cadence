import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    APP_URL: z.string().min(1).default("http://localhost:3000"),
    // Storage & S3 / R2 Configuration
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional().default("cadence"),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().optional().default("auto"),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    S3_FORCE_PATH_STYLE: z.string().optional(),
    // Generation Engine Gateway Endpoints
    CADENCE_API_URL: z.string().url().default("https://placeholder-engine.modal.run"),
    CADENCE_SOUND_API_URL: z.string().url().optional(),
    CADENCE_MEDIA_API_URL: z.string().url().optional(),
    CADENCE_SENSENOVA_API_URL: z.string().url().optional(),
    CADENCE_STUDIO_API_URL: z.string().url().optional(),
    CADENCE_SONG_API_URL: z.string().url().optional(),
    CADENCE_CLIPPER_API_URL: z.string().url().optional(),
    CADENCE_AGENT_API_URL: z.string().url().optional(),
    CADENCE_AGENT_WS_URL: z.string().optional(),
    CADENCE_QWEN_IMAGE_API_URL: z.string().url().optional(),
    CADENCE_API_KEY: z.string().min(1).default("placeholder_key_for_build"),
  },
  experimental__runtimeEnv: {},
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.CI === "1" ||
    process.env.VERCEL === "1",
});
