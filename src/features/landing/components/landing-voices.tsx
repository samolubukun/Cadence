"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Pause, Mic, Sparkles } from "lucide-react";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { VOICE_CATEGORY_LABELS, type VoiceCategory } from "@/features/voices/data/voice-categories";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function parseLanguage(locale: string) {
  const [, country] = locale.split("-");
  if (!country) return { flag: "", region: locale };

  const flag = [...country.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");

  const region = regionNames.of(country) ?? country;
  return { flag, region };
}

// Curated high-fidelity system voices with local zero-latency audio assets (/public/voices/)
interface LandingVoiceItem {
  id: string;
  name: string;
  category: string;
  language: string;
  description: string;
  audioFile: string;
}

const LANDING_SYSTEM_VOICES: LandingVoiceItem[] = [
  {
    id: "jd7cakgk8p89yr8a0pvj7z8m158e44c3",
    name: "Sienna",
    category: "AUDIOBOOK",
    language: "en-US",
    description: "Warm, expressive American female voice ideal for audiobooks and storytelling.",
    audioFile: "sienna.wav",
  },
  {
    id: "jd71x0btr9hzh4qbvk4r9qy9hd8e48pn",
    name: "Julian",
    category: "CONVERSATIONAL",
    language: "en-US",
    description: "Confident American male narrator with a natural conversational flow.",
    audioFile: "julian.wav",
  },
  {
    id: "jd7fkhasnpw4chy5k59dtjqj358e5zpp",
    name: "Claire",
    category: "CONVERSATIONAL",
    language: "en-US",
    description: "Relaxed and conversational American female tone, perfect for podcasts.",
    audioFile: "claire.wav",
  },
  {
    id: "jd78cpyzv5px9cnv6jysss3mcn8e594q",
    name: "Marcus",
    category: "PODCAST",
    language: "en-AU",
    description: "Laid-back Australian male voice from Sydney, great for casual podcasts.",
    audioFile: "marcus.wav",
  },
  {
    id: "jd793havan6twpba681hy5kc0x8e5d68",
    name: "Elara",
    category: "MEDITATION",
    language: "en-US",
    description: "Gentle and melodic American delivery, well-suited for meditation and calm narration.",
    audioFile: "elara.wav",
  },
  {
    id: "jd7fv0xby95xz7gpjeh01fchjh8e49f9",
    name: "Silas",
    category: "ADVERTISING",
    language: "en-AU",
    description: "Deep Australian male timbre suited for commercial reads and promotions.",
    audioFile: "silas.wav",
  },
];

function LandingVoiceCard({ voice }: { voice: LandingVoiceItem }) {
  const { flag, region } = parseLanguage(voice.language);
  // Serve zero-latency local audio directly from /public/voices/
  const audioSrc = `/voices/${voice.audioFile}`;
  const { isPlaying, isLoading, togglePlay } = useAudioPlayback(audioSrc);

  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xs hover:shadow-md transition-all p-3 sm:p-4 group">
      {/* Left Avatar Container */}
      <div className="relative shrink-0 flex items-center justify-center">
        <VoiceAvatar
          seed={voice.id}
          name={voice.name}
          className="size-13 border-[2px] border-white shadow-sm sm:size-14 transition-transform group-hover:scale-105"
        />
      </div>

      {/* Voice Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 tracking-tight">
          <span className="truncate">{voice.name}</span>
          <span className="size-1 shrink-0 rounded-full bg-slate-300" />
          <span className="text-xs font-semibold text-[#327c88] shrink-0">
            {VOICE_CATEGORY_LABELS[voice.category as VoiceCategory] ?? voice.category}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {voice.description || "24kHz neutral high-fidelity reference voice."}
        </p>

        <p className="flex items-center gap-1 text-[11px] text-slate-600 font-medium pt-0.5">
          <span className="shrink-0">{flag}</span>
          <span className="truncate">{region}</span>
        </p>
      </div>

      {/* Play Preview & Use Actions */}
      <div className="flex shrink-0 items-center gap-1.5 pl-1">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full bg-slate-50 hover:bg-slate-100 border-slate-200 shrink-0"
          onClick={togglePlay}
          disabled={isLoading}
          title="Preview Voice Sample"
        >
          {isLoading ? (
            <Spinner className="size-4 text-slate-600" />
          ) : isPlaying ? (
            <Pause className="size-4 text-indigo-600 fill-indigo-600" />
          ) : (
            <Play className="size-4 text-slate-700" />
          )}
        </Button>

        <Link
          href={`/text-to-speech?voiceId=${voice.id}`}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition shrink-0"
          title="Use in Text to Speech"
        >
          <Mic className="size-3" />
          <span>Use</span>
        </Link>
      </div>
    </div>
  );
}

export function LandingVoices() {
  return (
    <section id="voices" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#F4F6FB] overflow-hidden border-b border-border/50">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-xs">
            Voice Library
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Built-in System Voices
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Listen to studio-grade 24kHz reference voices sourced from the{" "}
            <a 
              href="https://www.kaggle.com/datasets/pratt3000/vctk-corpus/data" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 font-semibold hover:underline"
            >
              VCTK corpus
            </a>
            . Every timbre is calibrated for zero-shot cloning, speech-to-speech, and Chatterbox Turbo neural TTS.
          </p>
        </div>

        {/* Dynamic Voice Grid matching /voices layout with local zero-latency playback */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANDING_SYSTEM_VOICES.map((voice) => (
            <LandingVoiceCard key={voice.id} voice={voice} />
          ))}
        </div>

        {/* Footer Bar */}
        <div className="flex justify-center pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:px-8 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xs text-center sm:text-left">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <Sparkles className="size-4 text-indigo-600" />
              <span>
                30+ hand-curated accents across American, British, Irish, Scottish, and Australian dialects.
              </span>
            </div>
            <Link 
              href="/voices" 
              className="btn-dark-carbon whitespace-nowrap text-xs px-4 py-2 font-semibold"
            >
              <span>Explore All Voices in Studio</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
