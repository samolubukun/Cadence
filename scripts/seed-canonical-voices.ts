import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import type { VoiceCategory } from "../src/features/voices/data/voice-categories.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SYSTEM_VOICES_DIR = path.join(__dirname, "system-voices");

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set in environment");
}
const convex = new ConvexHttpClient(convexUrl);

interface VoiceSeedEntry {
  cadenceId: string;
  name: string;
  gender: "F" | "M";
  fileName: string;
  description: string;
  category: VoiceCategory;
  language: string;
}

// Interleaved Female and Male voices using single first names
export const CATALOG_VOICES: VoiceSeedEntry[] = [
  {
    cadenceId: "cadence_01",
    name: "Sienna",
    gender: "F",
    fileName: "cadence_01.wav",
    description: "Warm, expressive American female voice ideal for audiobooks and storytelling.",
    category: "AUDIOBOOK",
    language: "en-US",
  },
  {
    cadenceId: "cadence_19",
    name: "Julian",
    gender: "M",
    fileName: "cadence_19.wav",
    description: "Confident American male narrator with a natural conversational flow.",
    category: "CONVERSATIONAL",
    language: "en-US",
  },
  {
    cadenceId: "cadence_02",
    name: "Claire",
    gender: "F",
    fileName: "cadence_02.wav",
    description: "Relaxed and conversational American female tone, perfect for podcasts.",
    category: "CONVERSATIONAL",
    language: "en-US",
  },
  {
    cadenceId: "cadence_20",
    name: "Marcus",
    gender: "M",
    fileName: "cadence_20.wav",
    description: "Laid-back Australian male voice from Sydney, great for casual podcasts.",
    category: "PODCAST",
    language: "en-AU",
  },
  {
    cadenceId: "cadence_03",
    name: "Elara",
    gender: "F",
    fileName: "cadence_03.wav",
    description: "Gentle and melodic American delivery, well-suited for meditation and calm narration.",
    category: "MEDITATION",
    language: "en-US",
  },
  {
    cadenceId: "cadence_21",
    name: "Silas",
    gender: "M",
    fileName: "cadence_21.wav",
    description: "Deep Australian male timbre suited for commercial reads and promotions.",
    category: "ADVERTISING",
    language: "en-AU",
  },
  {
    cadenceId: "cadence_04",
    name: "Mara",
    gender: "F",
    fileName: "cadence_04.wav",
    description: "Clean, natural Canadian female voice with clear articulation for general narration.",
    category: "GENERAL",
    language: "en-CA",
  },
  {
    cadenceId: "cadence_22",
    name: "Oliver",
    gender: "M",
    fileName: "cadence_22.wav",
    description: "Sophisticated British English male voice with an authoritative delivery.",
    category: "AUDIOBOOK",
    language: "en-GB",
  },
  {
    cadenceId: "cadence_05",
    name: "Nora",
    gender: "F",
    fileName: "cadence_05.wav",
    description: "Professional Canadian voice with confident pacing for corporate presentations.",
    category: "CORPORATE",
    language: "en-CA",
  },
  {
    cadenceId: "cadence_23",
    name: "Kai",
    gender: "M",
    fileName: "cadence_23.wav",
    description: "Punchy, modern London British male accent with persuasive pacing.",
    category: "VOICEOVER",
    language: "en-GB",
  },
  {
    cadenceId: "cadence_06",
    name: "Avery",
    gender: "F",
    fileName: "cadence_06.wav",
    description: "Youthful and energetic Canadian speaker suited for commercials and social media.",
    category: "ADVERTISING",
    language: "en-CA",
  },
  {
    cadenceId: "cadence_24",
    name: "Ethan",
    gender: "M",
    fileName: "cadence_24.wav",
    description: "Clear and professional Indian English male narrator with balanced cadence.",
    category: "CORPORATE",
    language: "en-IN",
  },
  {
    cadenceId: "cadence_07",
    name: "Iris",
    gender: "F",
    fileName: "cadence_07.wav",
    description: "Friendly and reassuring Canadian accent, ideal for customer support workflows.",
    category: "CUSTOMER_SERVICE",
    language: "en-CA",
  },
  {
    cadenceId: "cadence_25",
    name: "Adrian",
    gender: "M",
    fileName: "cadence_25.wav",
    description: "Inspirational Indian English male speaker with an uplifting, motivating delivery.",
    category: "MOTIVATIONAL",
    language: "en-IN",
  },
  {
    cadenceId: "cadence_08",
    name: "Lena",
    gender: "F",
    fileName: "cadence_08.wav",
    description: "Crisp and articulate British English narrator with an engaging timbre.",
    category: "NARRATIVE",
    language: "en-GB",
  },
  {
    cadenceId: "cadence_26",
    name: "Theo",
    gender: "M",
    fileName: "cadence_26.wav",
    description: "Friendly Dublin Irish male voice with inviting and authentic dialogue style.",
    category: "CONVERSATIONAL",
    language: "en-IE",
  },
  {
    cadenceId: "cadence_09",
    name: "Maya",
    gender: "F",
    fileName: "cadence_09.wav",
    description: "Polite and helpful Indian English speaker, exceptional for customer assistance.",
    category: "CUSTOMER_SERVICE",
    language: "en-IN",
  },
  {
    cadenceId: "cadence_27",
    name: "Noah",
    gender: "M",
    fileName: "cadence_27.wav",
    description: "Rich Northern Irish male voice with resonant presence for drama and storytelling.",
    category: "NARRATIVE",
    language: "en-GB",
  },
  {
    cadenceId: "cadence_10",
    name: "Celia",
    gender: "F",
    fileName: "cadence_10.wav",
    description: "Lively Irish female voice from Cork with distinctive warmth and charm.",
    category: "CONVERSATIONAL",
    language: "en-IE",
  },
  {
    cadenceId: "cadence_28",
    name: "Rowan",
    gender: "M",
    fileName: "cadence_28.wav",
    description: "Distinguished Scottish male accent from Edinburgh with commanding tone.",
    category: "AUDIOBOOK",
    language: "en-GB",
  },
  {
    cadenceId: "cadence_11",
    name: "Rhea",
    gender: "F",
    fileName: "cadence_11.wav",
    description: "Expressive Dublin Irish voice with storytelling flair for character audio.",
    category: "CHARACTERS",
    language: "en-IE",
  },
  {
    cadenceId: "cadence_29",
    name: "Damian",
    gender: "M",
    fileName: "cadence_29.wav",
    description: "Resonant Scottish male voice from Fife with dramatic character impact.",
    category: "CHARACTERS",
    language: "en-GB",
  },
  {
    cadenceId: "cadence_12",
    name: "Vera",
    gender: "F",
    fileName: "cadence_12.wav",
    description: "Smooth New Zealand accent with a serene, mindful cadence.",
    category: "MEDITATION",
    language: "en-NZ",
  },
  {
    cadenceId: "cadence_30",
    name: "Elliot",
    gender: "M",
    fileName: "cadence_30.wav",
    description: "Smooth Scottish male speaker with a calm, grounded tempo.",
    category: "GENERAL",
    language: "en-GB",
  },
  {
    cadenceId: "cadence_13",
    name: "Sage",
    gender: "F",
    fileName: "cadence_13.wav",
    description: "Distinct Northern Irish female voice from Belfast with engaging presence.",
    category: "PODCAST",
    language: "en-GB",
  },
  {
    cadenceId: "cadence_14",
    name: "Amara",
    gender: "F",
    fileName: "cadence_14.wav",
    description: "Bright Northern Irish cadence with crisp diction for advertisements.",
    category: "ADVERTISING",
    language: "en-GB",
  },
  {
    cadenceId: "cadence_15",
    name: "Talia",
    gender: "F",
    fileName: "cadence_15.wav",
    description: "Warm South African female voice from Cape Town with clear tone.",
    category: "GENERAL",
    language: "en-ZA",
  },
  {
    cadenceId: "cadence_16",
    name: "Freya",
    gender: "F",
    fileName: "cadence_16.wav",
    description: "Engaging Pretoria South African speaker with dynamic cadence for modern voiceovers.",
    category: "VOICEOVER",
    language: "en-ZA",
  },
  {
    cadenceId: "cadence_17",
    name: "Naomi",
    gender: "F",
    fileName: "cadence_17.wav",
    description: "Calm and articulate South African tone suitable for documentaries and explainers.",
    category: "NARRATIVE",
    language: "en-ZA",
  },
  {
    cadenceId: "cadence_18",
    name: "Isla",
    gender: "F",
    fileName: "cadence_18.wav",
    description: "Melodic Welsh female voice from Cardiff with rich character warmth.",
    category: "CHARACTERS",
    language: "en-GB",
  },
];

async function main() {
  console.log("Cleaning and re-seeding canonical system voices with first names interleaved...");

  const existing = await convex.query(api.voices.list, {});
  console.log(`Found ${(existing.system || []).length} current system voices. Removing...`);
  for (const voice of existing.system || []) {
    await convex.mutation(api.voices.deleteVoice, { id: voice._id });
  }

  for (const entry of CATALOG_VOICES) {
    const audioPath = path.join(SYSTEM_VOICES_DIR, entry.fileName);
    let buffer: Buffer | null = null;
    try {
      buffer = await fs.readFile(audioPath);
    } catch {
      console.warn(`Warning: Audio file not found at ${audioPath}`);
      buffer = null;
    }

    const voiceId = await convex.mutation(api.voices.create, {
      name: entry.name,
      description: entry.description,
      category: entry.category,
      language: entry.language,
      variant: "SYSTEM",
    });

    const r2Key = `voices/system/${voiceId}`;

    if (buffer) {
      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: r2Key,
          Body: buffer,
          ContentType: "audio/wav",
        })
      );
    }

    await convex.mutation(api.voices.updateR2Key, {
      id: voiceId,
      r2ObjectKey: r2Key,
    });

    console.log(`✓ Seeded voice [${entry.cadenceId}]: ${entry.name} (${entry.gender}) -> ${voiceId}`);
  }

  console.log("\n🎉 All 30 voices re-seeded with single first names, interleaved!");
}

main().catch(console.error);
