import type { Metadata } from "next";
import { VoiceCloneView } from "@/features/voices/views/voice-clone-view";

export const metadata: Metadata = {
  title: "Voice Cloning | Cadence",
  description: "Clone any custom voice with zero-shot AI voice cloning.",
};

export default function VoiceClonePage() {
  return <VoiceCloneView />;
}
