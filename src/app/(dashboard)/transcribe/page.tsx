import type { Metadata } from "next";
import { SpeechToTextView } from "@/features/speech-to-text/views/speech-to-text-view";

export const metadata: Metadata = {
  title: "Speech to Text",
  description: "Transcribe audio with word-level timestamps and speaker diarization.",
};

export default function TranscribePage() {
  return <SpeechToTextView />;
}
