import type { Metadata } from "next";
import { LandingView } from "@/features/landing/views/landing-view";

export const metadata: Metadata = {
  title: "Cadence - AI Voice Studio",
  description:
    "Natural speech synthesis, zero-shot voice cloning, and word-accurate transcription on self-hosted GPU infrastructure. Powered by Chatterbox TTS and OpenAI Whisper.",
  openGraph: {
    title: "Cadence - AI Voice Studio",
    description:
      "Transform pure text into living human voice. Zero vendor lock-in, private R2 storage, serverless NVIDIA A10G.",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingView />;
}
