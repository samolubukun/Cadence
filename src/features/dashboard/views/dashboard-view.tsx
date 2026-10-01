"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AudioLines,
  Headphones,
  Mic2,
  ArrowRight,
  Play,
  Clock,
  Music,
  Clapperboard,
  Sparkles,
  Drum,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { cn } from "@/lib/utils";

// ── Services ───────────────────────────────────────────────────────────────────

const POPULAR_SERVICES = [
  {
    id: "tts",
    label: "Text to Speech",
    description: "Natural studio-quality neural voice synthesis",
    icon: AudioLines,
    color: "bg-violet-100 text-violet-600",
    href: "/text-to-speech",
  },
  {
    id: "stt",
    label: "Speech to Text",
    description: "High-accuracy transcription & word-level timestamps",
    icon: Headphones,
    color: "bg-sky-100 text-sky-600",
    href: "/transcribe",
  },
  {
    id: "music",
    label: "Music & Sound Studio",
    description: "Full vocal songs, beats, and Foley sound effects",
    icon: Music,
    color: "bg-indigo-100 text-indigo-600",
    href: "/music",
  },
  {
    id: "clone",
    label: "Voice Cloning",
    description: "Instant zero-shot timbre cloning from reference audio",
    icon: Mic2,
    color: "bg-amber-100 text-amber-600",
    href: "/voice-clone",
  },
  {
    id: "media",
    label: "Visuals & Video",
    description: "AI artwork, image editing & cinematic video visualizers",
    icon: Clapperboard,
    color: "bg-cyan-100 text-cyan-600",
    href: "/media",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function useCarousel(total: number, perPage: number) {
  const [idx, setIdx] = useState(0);
  const maxIdx = Math.max(0, total - perPage);
  return {
    idx,
    prev: () => setIdx((i) => Math.max(0, i - 1)),
    next: () => setIdx((i) => Math.min(maxIdx, i + 1)),
    canPrev: idx > 0,
    canNext: idx < maxIdx,
  };
}

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

// ── View ───────────────────────────────────────────────────────────────────────

export function DashboardView() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const trpc = useTRPC();

  const { data: voicesData } = useQuery(trpc.voices.getAll.queryOptions());
  const { data: generationsData } = useQuery(trpc.generations.getAll.queryOptions());
  const { data: transcriptionsData } = useQuery(trpc.transcriptions.getAll.queryOptions());
  const { data: songsData } = useQuery(trpc.studio.listSongs.queryOptions());
  const { data: sfxData } = useQuery(trpc.studio.listSoundEffects.queryOptions());
  const { data: mediaData } = useQuery(trpc.studio.listMediaGenerations.queryOptions());

  const allVoices = [...(voicesData?.system ?? []), ...(voicesData?.custom ?? [])];

  // Aggregate recent generations across all tools
  type UnifiedItem = {
    id: string;
    type: "tts" | "stt" | "song" | "beat" | "sfx" | "media";
    title: string;
    subtitle: string;
    href: string;
    date: Date;
    badgeText: string;
    badgeColor: string;
  };

  const unifiedList: UnifiedItem[] = [
    ...(generationsData ?? []).map((g) => ({
      id: `tts-${g.id}`,
      type: "tts" as const,
      title: g.text?.slice(0, 60) + ((g.text?.length ?? 0) > 60 ? "…" : ""),
      subtitle: `${g.voiceName} • ${(g.text?.length ?? 0).toLocaleString()} chars`,
      href: `/text-to-speech/${g.id}`,
      date: new Date(g.createdAt),
      badgeText: "TTS Voice",
      badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    })),
    ...(transcriptionsData ?? []).map((t) => ({
      id: `stt-${t.id}`,
      type: "stt" as const,
      title: t.fileName,
      subtitle: `${t.duration ? `${t.duration.toFixed(0)}s` : "Audio"} • ${t.text?.slice(0, 45)}…`,
      href: "/transcribe",
      date: new Date(t.createdAt),
      badgeText: "Transcript",
      badgeColor: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    })),
    ...(songsData ?? []).map((s) => {
      const isBeat = s.title.startsWith("[Beat]");
      return {
        id: `song-${s._id}`,
        type: isBeat ? ("beat" as const) : ("song" as const),
        title: s.prompt?.slice(0, 60) || s.title,
        subtitle: `${s.duration}s • ${isBeat ? "MusicGen Beats" : "ACE-Step Vocal Song"}`,
        href: "/music",
        date: new Date(s._creationTime),
        badgeText: isBeat ? "Beat" : "Song",
        badgeColor: isBeat
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
      };
    }),
    ...(sfxData ?? []).map((s) => ({
      id: `sfx-${s._id}`,
      type: "sfx" as const,
      title: s.prompt?.slice(0, 60),
      subtitle: `${s.duration}s • AudioGen Foley SFX`,
      href: "/music",
      date: new Date(s._creationTime),
      badgeText: "Sound FX",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    })),
    ...(mediaData ?? []).map((m) => ({
      id: `media-${m._id}`,
      type: "media" as const,
      title: m.prompt?.slice(0, 60),
      subtitle: m.type === "video" ? `${m.duration ?? 4}s • Wan2.1 Video` : "1024x1024 • SDXL Cover",
      href: "/media",
      date: new Date(m._creationTime),
      badgeText: m.type === "video" ? "Video" : "Artwork",
      badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  const voiceCarousel = useCarousel(allVoices.length, 6);
  const visibleVoices = allVoices.slice(voiceCarousel.idx, voiceCarousel.idx + 6);

  return (
    <div className="relative min-h-0 flex-1 flex flex-col overflow-y-auto bg-[#f5f5f7]">
      <PageHeader title="My Workspace" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">

        {/* ── Welcome + CTA ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome,{" "}
              <span className="italic">
                {isLoaded ? (user?.firstName ?? user?.fullName ?? "Creator") : "..."}
              </span>{" "}
              👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Sound, voice, and vision. Composed in rhythm, produced without boundaries.
            </p>
          </div>
          <Button
            onClick={() => router.push("/voice-clone")}
            className="self-start sm:self-auto rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-sm gap-1.5 px-4"
          >
            <Plus className="size-4" />
            Create Voice
          </Button>
        </div>

        {/* ── Hero + Popular Services row ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-4">

          {/* Hero Banner */}
          <Link
            href="/text-to-speech"
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-6 flex flex-col justify-end min-h-[220px] group cursor-pointer"
          >
            <div className="absolute top-3 right-6 flex gap-1">
              <span className="size-5 rounded-full bg-white/30" />
              <span className="size-3 rounded-full bg-white/20 mt-2" />
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-[11px] font-medium">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              Neural Generative Studio
            </div>
            <div className="relative z-10">
              <p className="text-white/90 text-xl font-bold leading-tight mb-0.5">
                Voice, Music, Speech &amp; Media
              </p>
              <p className="text-white text-2xl font-extrabold italic leading-tight mb-3">
                Synthesize Everything
              </p>
              <p className="text-white/70 text-xs mb-4">
                Make anything sound possible
              </p>
              <span className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 transition-colors text-white text-xs font-semibold rounded-full px-4 py-2">
                Start Creating
                <ArrowRight className="size-3" />
              </span>
            </div>
          </Link>

          {/* Popular Services */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-bold text-gray-900">Studio Tools</h2>
            <div className="flex flex-col gap-2">
              {POPULAR_SERVICES.map((svc) => {
                const Icon = svc.icon;
                return (
                  <Link
                    key={svc.id}
                    href={svc.href}
                    className="flex items-center gap-3.5 p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                  >
                    <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", svc.color)}>
                      <Icon className="size-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {svc.label}
                      </p>
                      <p className="text-[11px] text-gray-400 leading-snug mt-0.5 truncate">
                        {svc.description}
                      </p>
                    </div>
                    <ArrowRight className="size-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Trending Voices ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Voice Library</h2>
              <Link href="/voices" className="text-[11px] text-blue-500 hover:underline flex items-center gap-0.5">
                Browse all <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="flex gap-1">
              <button
                onClick={voiceCarousel.prev}
                disabled={!voiceCarousel.canPrev}
                className="size-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                onClick={voiceCarousel.next}
                disabled={!voiceCarousel.canNext}
                className="size-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>

          {allVoices.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 animate-pulse">
                  <div className="size-10 rounded-full bg-gray-100 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleVoices.map((voice) => {
                const { flag, region } = parseLanguage(voice.language);
                return (
                  <Link
                    key={voice.id}
                    href={`/text-to-speech?voiceId=${voice.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group cursor-pointer"
                  >
                    <VoiceAvatar
                      seed={voice.id}
                      name={voice.name}
                      className="size-10 shrink-0 border border-gray-100 shadow-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {voice.name}
                      </p>
                      <p className="text-[11px] text-[#327c88] capitalize font-medium">
                        {voice.category?.toLowerCase().replace(/_/g, " ") ?? "General"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {flag} {region}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent Generations Across All Studios ────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Recent Studio Generations</h2>
              <span className="text-[11px] text-gray-400">
                (Voice, Transcripts, Songs, Beats &amp; Media)
              </span>
            </div>
            <Clock className="size-3.5 text-gray-400" />
          </div>

          {generationsData === undefined ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 animate-pulse">
                  <div className="size-8 rounded-full bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : unifiedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
              <AudioLines className="size-8 opacity-30" />
              <p className="text-xs font-medium">No generations yet</p>
              <Link
                href="/text-to-speech"
                className="text-xs text-blue-500 hover:underline font-medium"
              >
                Create your first speech or music track →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {unifiedList.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                >
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shrink-0",
                      item.badgeColor
                    )}
                  >
                    {item.badgeText}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  </div>

                  <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                    {timeAgo(item.date)}
                  </span>
                  <ArrowRight className="size-3 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
