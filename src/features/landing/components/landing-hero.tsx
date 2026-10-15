"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PlaySquare, BookOpen, Sparkles, Radio } from "lucide-react";

import { useShowcase } from "@/components/providers/showcase-provider";

const DEMO_PRESETS = [
  { id: "youtube", label: "YouTube", icon: PlaySquare, text: "Welcome back! In today's video, we're diving into the future of voice synthesis and AI audio." },
  { id: "narrative", label: "Narrative", icon: BookOpen, text: "The ancient library stood silent under starlight, its forgotten parchment murmuring with lost wisdom." },
  { id: "ad", label: "Commercial", icon: Sparkles, text: "Crafted for speed, built for creators. Experience studio-quality voices in real-time." },
  { id: "podcast", label: "Podcast", icon: Radio, text: "Thanks for tuning in. Today we explore self-hosted neural models and why privacy matters." },
];

const WAVE_BARS = [
  8, 14, 22, 35, 18, 48, 28, 62, 45, 80, 52, 95, 68, 88, 54, 75, 42, 60, 30, 48,
  24, 70, 40, 85, 58, 100, 72, 92, 48, 65, 38, 50, 26, 68, 44, 82, 56, 94, 62, 78,
  35, 55, 28, 42, 18, 32, 14, 22, 10, 16, 8, 14, 20, 32, 16, 44, 25, 58, 40, 75
];

export function LandingHero() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [mode, setMode] = useState<"tts" | "upload">("tts");
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { interceptAction, isLiveAuthEnabled } = useShowcase();

  const handlePlayToggle = () => {
    if (playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPlaying(false), 4500);
    }
  };

  const { isSignedIn, isLoaded } = useAuth();
  const studioHref = isLoaded && isSignedIn ? "/dashboard" : "/sign-up";

  const handleLaunchClick = (e: React.MouseEvent) => {
    if (!isLiveAuthEnabled) {
      e.preventDefault();
      interceptAction();
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center bg-[#ffffff] overflow-hidden pt-32 pb-20 px-4">
      {/* Background Soft Slate & Low-Opacity Blue Radiance */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 15%, rgba(38,109,240,0.04) 0%, rgba(39,40,53,0.02) 40%, transparent 80%)"
        }}
      />

      {/* Center Refined Audio Waveform Horizon Banner in Slate Neutrals */}
      <div 
        className="pointer-events-none absolute left-0 right-0 top-[50%] -translate-y-1/2 flex items-center justify-center gap-[4px] opacity-25 overflow-hidden h-32 px-4"
        style={{ maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)" }}
      >
        {WAVE_BARS.map((height, i) => {
          const barColor = playing
            ? "#266df0"
            : "#cad0d9";

          return (
            <div
              key={i}
              className={playing ? "wavebar relative z-10" : "relative z-10"}
              style={{
                width: 2.5,
                borderRadius: 2,
                height: `${height * 0.8}%`,
                background: barColor,
                transition: "all 0.3s ease",
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Attio Style Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[7px] bg-[#ffffff] border border-[#e4e7ec] shadow-[0_1px_2px_rgba(28,40,64,0.05)] mb-7 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[#266df0]" />
          <span className="text-[12px] font-medium tracking-tight text-[#6f7988]">
            Make Anything Sound Possible
          </span>
        </div>

        {/* Hero Headline — Architectural InterDisplay style */}
        <h1 
          className="animate-fade-up-delay-1 text-[#1c1d1f] tracking-[-0.03em] leading-[1.08] mb-5 max-w-3xl font-semibold"
          style={{ fontSize: "clamp(2.3rem, 4.2vw, 3.8rem)" }}
        >
          The open platform for every layer of voice, music, and media creation.
        </h1>

        {/* Hero Subtitle */}
        <p className="animate-fade-up-delay-2 text-[#6f7988] max-w-xl text-[15px] sm:text-[17px] leading-relaxed mb-8 font-normal">
          Studio-grade neural voice synthesis, multi-track music production, and visual media creation on self-hosted GPU infrastructure.
        </p>

        {/* Action Buttons */}
        <div className="animate-fade-up-delay-3 flex flex-row items-center justify-center gap-3 mb-14 w-full max-w-sm sm:max-w-none px-2">
          <Link 
            href={studioHref} 
            onClick={handleLaunchClick}
            className="btn-dark-carbon whitespace-nowrap shrink-0 px-5 py-2.5 text-[14px]"
          >
            <span>{isLoaded && isSignedIn && isLiveAuthEnabled ? "Go to Studio" : "Open Studio Free"}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a 
            href="https://github.com/samolubukun/Cadence" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-ghost-cadence whitespace-nowrap shrink-0 px-4 py-2.5 text-[14px] flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>

        {/* Interactive Studio Preview Capsule (Attio / Lightdash style) */}
        <div className="w-full max-w-2xl bg-[#ffffff] rounded-[14px] border border-[#e4e7ec] shadow-[rgba(28,40,64,0.06)_0px_12px_32px_0px,rgba(28,40,64,0.04)_0px_2px_4px_0px] p-5 text-left animate-fade-up-delay-4 relative z-20">
          {/* Top Tabs */}
          <div className="flex items-center gap-2 border-b border-[#eeeff1] pb-3 mb-4">
            <button
              onClick={() => setMode("tts")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
                mode === "tts"
                  ? "bg-[#f4f5f6] text-[#1c1d1f]"
                  : "text-[#6f7988] hover:text-[#1c1d1f]"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
              Text to Speech
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
                mode === "upload"
                  ? "bg-[#f4f5f6] text-[#1c1d1f]"
                  : "text-[#6f7988] hover:text-[#1c1d1f]"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Voice Clone
            </button>
            <span className="ml-auto text-[11px] font-mono font-medium text-[#6f7988] bg-[#f4f5f6] px-2 py-0.5 rounded-[6px]">
              24kHz Mono
            </span>
          </div>

          {/* Textarea Preview */}
          <div className="text-[#232529] text-[14px] sm:text-[15px] leading-relaxed mb-5 min-h-[56px] font-normal">
            {mode === "tts" ? (
              DEMO_PRESETS[selectedPreset].text
            ) : (
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-[#cad0d9] rounded-[10px] bg-[#f6f8fa]">
                <span className="text-[13px] text-[#6f7988] font-medium">Drop a 5-second voice sample WAV or MP3 for instant zero-shot cloning</span>
              </div>
            )}
          </div>

          {/* Bottom Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#eeeff1]">
            {/* Presets Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(idx);
                    setPlaying(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] text-[12px] font-medium transition-all ${
                    selectedPreset === idx
                      ? "bg-[#f4f5f6] text-[#1c1d1f] border border-[#cdd2d9] font-medium"
                      : "bg-[#ffffff] text-[#6f7988] border border-[#e4e7ec] hover:border-[#cdd2d9] hover:text-[#1c1d1f]"
                  }`}
                >
                  <preset.icon className="size-3" />
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Character count & Play Button */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[11px] font-mono text-[#8f99a8] tabular-nums">
                {DEMO_PRESETS[selectedPreset].text.length} / 5000
              </span>
              <button
                onClick={handlePlayToggle}
                aria-label={playing ? "Stop preview" : "Play preview"}
                className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all ${
                  playing
                    ? "bg-[#232529] text-white"
                    : "bg-[#266df0] hover:bg-[#1b5edc] text-white shadow-[0_2px_8px_rgba(38,109,240,0.25)]"
                }`}
              >
                {playing ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <polygon points="6 4 20 12 6 20" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
