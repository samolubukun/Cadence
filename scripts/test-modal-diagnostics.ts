import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MODAL_URL = process.env.CADENCE_API_URL;
const API_KEY = process.env.CADENCE_API_KEY;

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://judicious-eel-519.convex.cloud"
);

async function testTTS() {
  console.log("\n--- Testing Text-to-Speech (TTS) ---");
  console.log(`Endpoint: ${MODAL_URL}/generate`);

  // 1. Fetch a system voice from Convex to get its r2ObjectKey
  const voices = await convex.query(api.voices.list, {});
  const voice = (voices.system || [])[0];

  if (!voice || !voice.r2ObjectKey) {
    throw new Error("No system voices with r2ObjectKey found in Convex");
  }

  console.log(`Using voice: ${voice.name} (Key: ${voice.r2ObjectKey})`);

  const response = await fetch(`${MODAL_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY!,
    },
    body: JSON.stringify({
      prompt: "Hello, this is an automated integration test for Cadence on Modal.",
      voice_key: voice.r2ObjectKey,
      temperature: 0.8,
      top_p: 0.95,
      top_k: 1000,
      repetition_penalty: 1.2,
      norm_loudness: true,
    }),
  });

  console.log(`Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`TTS generation failed (${response.status}): ${errorBody}`);
  }

  const audioBuffer = await response.arrayBuffer();
  console.log(`✓ Success! Received ${audioBuffer.byteLength} bytes of WAV audio.`);
  return Buffer.from(audioBuffer);
}

async function testSTT(sampleWavBuffer: Buffer) {
  console.log("\n--- Testing Speech-to-Text (STT) with Diarization ---");
  console.log(`Endpoint: ${MODAL_URL}/transcribe`);

  const formData = new FormData();
  const blob = new Blob([sampleWavBuffer], { type: "audio/wav" });
  formData.append("file", blob, "test.wav");
  formData.append("diarize", "true");

  const response = await fetch(`${MODAL_URL}/transcribe`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY!,
    },
    body: formData,
  });

  console.log(`Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`STT transcription failed (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  console.log("✓ Success! STT Result received:");
  console.log(`- Transcribed text: "${result.text}"`);
  console.log(`- Segments count: ${result.segments?.length ?? 0}`);
  if (result.segments?.[0]) {
    console.log(`- First segment speaker: ${result.segments[0].speaker}`);
    console.log(`- Word count in first segment: ${result.segments[0].words?.length ?? 0}`);
  }
}

async function run() {
  try {
    const audioBuffer = await testTTS();
    await testSTT(audioBuffer);
    console.log("\n🎉 ALL TESTS PASSED! Both TTS and STT are operating properly on Modal.");
  } catch (err: any) {
    console.error("\n❌ TEST FAILED:", err.message);
  }
}

run();
