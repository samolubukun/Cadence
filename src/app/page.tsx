import type { Metadata } from "next";
import { LandingView } from "@/features/landing/views/landing-view";

export const metadata: Metadata = {
  title: "Cadence - Open Platform for Voice, Music & Media",
  description:
    "Studio-grade neural voice synthesis, multi-track music production, stem isolation, and visual media creation powered by open foundation models.",
  openGraph: {
    title: "Cadence - Open Platform for Voice, Music & Media",
    description:
      "Studio-grade neural voice synthesis, multi-track music production, stem isolation, and visual media creation on self-hosted GPU infrastructure.",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingView />;
}
