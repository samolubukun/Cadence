"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Pause, Mic, Sparkles } from "lucide-react";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { VOICE_CATEGORY_LABELS, type VoiceCategory } from "@/features/voices/data/voice-categories";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

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

// Fallback curated voices if DB query is loading
const FALLBACK_SYSTEM_VOICES = [
  { id: "vctk_p225", name: "Sienna", category: "NARRATIVE", language: "en-US", description: "Warm, articulate narrator for audiobooks & long-form stories." },
  { id: "vctk_p226", name: "Julian", category: "PODCAST", language: "en-GB", description: "Crisp British broadcaster with resonant authoritative cadence." },
  { id: "vctk_p227", name: "Claire", category: "CONVERSATIONAL", language: "en-US", description: "Natural, friendly conversationalist for podcasts & customer AI." },
  { id: "vctk_p228", name: "Marcus", category: "CHARACTERS", language: "en-GB", description: "Deep cinematic timbre engineered for trailers and dramatic voiceovers." },
  { id: "vctk_p229", name: "Elara", category: "AUDIOBOOK", language: "en-IE", description: "Melodic Irish lilt delivering poetic expressiveness." },
  { id: "vctk_p230", name: "Silas", category: "VOICEOVER", language: "en-GB", description: "Rich Scottish storyteller voice with grounded gravitas." },
];

function LandingVoiceCard({ voice }: { voice: { id: string; name: string; category: string; language: string; description: string | null } }) {
  const { flag, region } = parseLanguage(voice.language);
  const audioSrc = `/api/voices/${encodeURIComponent(voice.id)}`;
  const { isPlaying, isLoading, togglePlay } = useAudioPlayback(audioSrc);

  return (
    <div className="flex items-center gap-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xs hover:shadow-md transition-all pr-3 lg:pr-5 group">
      {/* Left Avatar Container with Vertical Dividing Border (matches /voices card) */}
      <div className="relative h-24 w-20 shrink-0 lg:h-28 lg:w-24">
        <div className="absolute left-0 top-0 h-24 w-10 border-r border-slate-100 bg-slate-50/70 lg:h-28 lg:w-12" />
        <div className="absolute inset-0 flex items-center justify-center">
          <VoiceAvatar
            seed={voice.id}
            name={voice.name}
            className="size-13 border-[2px] border-white shadow-sm lg:size-16 transition-transform group-hover:scale-105"
          />
        </div>
      </div>

      {/* Voice Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-3">
        <div className="flex items-center gap-1.5 line-clamp-1 text-sm font-bold text-slate-900 tracking-tight">
          <span>{voice.name}</span>
          <span className="size-1 shrink-0 rounded-full bg-slate-300" />
          <span className="text-xs font-semibold text-[#327c88] truncate">
            {VOICE_CATEGORY_LABELS[voice.category as VoiceCategory] ?? voice.category}
          </span>
        </div>

        <p className="line-clamp-1 text-xs text-slate-500">
          {voice.description || "24kHz neutral high-fidelity reference voice."}
        </p>

        <p className="flex items-center gap-1 text-xs text-slate-600 font-medium">
          <span className="shrink-0">{flag}</span>
          <span className="truncate">{region}</span>
        </p>
      </div>

      {/* Play Preview & Use Actions */}
      <div className="ml-2 flex shrink-0 items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full bg-slate-50 hover:bg-slate-100 border-slate-200"
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
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition"
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
  const trpc = useTRPC();
  const { data: systemVoices } = useQuery(trpc.voices.getPublicSystemVoices.queryOptions());

  const displayedVoices = (systemVoices && systemVoices.length > 0)
    ? systemVoices.slice(0, 6)
    : FALLBACK_SYSTEM_VOICES;

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
            . Every timbre is calibrated for zero-shot cloning, speech-to-speech, and neural TTS.
          </p>
        </div>

        {/* Dynamic Voice Grid matching /voices layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedVoices.map((voice) => (
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
