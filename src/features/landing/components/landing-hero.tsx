"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const DEMO_PRESETS = [
  { id: "youtube", label: "YouTube", icon: "▶", text: "Welcome back! In today's video, we're diving into the future of voice synthesis and AI audio." },
  { id: "narrative", label: "Narrative", icon: "📖", text: "The ancient library stood silent under starlight, its forgotten parchment murmuring with lost wisdom." },
  { id: "ad", label: "Commercial", icon: "✨", text: "Crafted for speed, built for creators. Experience studio-quality voices in real-time." },
  { id: "podcast", label: "Podcast", icon: "🎙", text: "Thanks for tuning in. Today we explore self-hosted neural models and why privacy matters." },
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

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center bg-[#FAF9F6] overflow-hidden pt-28 pb-16 px-4">
      {/* Background Soft Glow & Radial Radiance */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(99,102,241,0.08) 0%, rgba(14,165,233,0.04) 50%, transparent 80%)"
        }}
      />

      {/* Center Subdued Audio Waveform Horizon Banner (Inspired by Image 1) */}
      <div 
        className="pointer-events-none absolute left-0 right-0 top-[52%] -translate-y-1/2 flex items-center justify-center gap-[3px] opacity-25 overflow-hidden h-32 px-4"
        style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}
      >
        {WAVE_BARS.map((height, i) => (
          <div
            key={i}
            className={playing ? "wavebar" : ""}
            style={{
              width: 3,
              borderRadius: 3,
              height: `${height}%`,
              background: playing 
                ? "linear-gradient(to top, #4F46E5, #A855F7)" 
                : "linear-gradient(to top, #0F172A, #64748B)",
              animationDelay: `${(i * 0.05).toFixed(2)}s`,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Luminous Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-100 shadow-[0_2px_10px_rgba(99,102,241,0.08)] mb-6 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide uppercase text-indigo-900/80">
            DON&apos;T JUST TALK. SPEAK WITH CADENCE.
          </span>
        </div>

        {/* Hero Headline */}
        <h1 
          className="animate-fade-up-delay-1 text-gradient-hero text-slate-900 tracking-tight leading-[1.08] mb-5"
          style={{ fontSize: "clamp(2.6rem, 5.2vw, 4.4rem)", fontWeight: 800 }}
        >
          Built for extreme<br />speed and pure efficiency
        </h1>

        {/* Hero Subtitle */}
        <p className="animate-fade-up-delay-2 text-slate-600 max-w-xl text-base sm:text-lg leading-relaxed mb-8">
          Sub-second TTS inference, 24kHz zero-shot voice cloning, and word-accurate Whisper transcription on self-hosted GPU infrastructure.
        </p>

        {/* Action Buttons */}
        <div className="animate-fade-up-delay-3 flex flex-row items-center justify-center gap-2.5 sm:gap-3.5 mb-14 w-full max-w-sm sm:max-w-none px-2">
          <Link 
            href={studioHref} 
            className="btn-dark-carbon shadow-lg hover:shadow-xl transition-all whitespace-nowrap shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="whitespace-nowrap">{isLoaded && isSignedIn ? "Studio" : "Open Studio"}</span>
          </Link>
          <a 
            href="#architecture" 
            className="btn-ghost-cadence bg-white/70 hover:bg-white whitespace-nowrap shrink-0 px-3.5 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span className="whitespace-nowrap">Architecture</span>
          </a>
        </div>

        {/* Interactive Studio Preview Capsule (Matches Image 1 reference precisely) */}
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-2xl border border-black/5 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] p-5 text-left animate-fade-up-delay-4 relative z-20">
          {/* Top Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <button
              onClick={() => setMode("tts")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "tts"
                  ? "bg-slate-100 text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
              Text to Speech
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "upload"
                  ? "bg-slate-100 text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Voice Clone
            </button>
            <span className="ml-auto text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
              24kHz High Fidelity
            </span>
          </div>

          {/* Textarea Preview */}
          <div className="text-slate-700 text-sm sm:text-base leading-relaxed mb-5 min-h-[56px] font-normal">
            {mode === "tts" ? (
              DEMO_PRESETS[selectedPreset].text
            ) : (
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <span className="text-xs text-slate-500 font-medium">Drop a 5-second voice sample WAV or MP3 for instant zero-shot cloning</span>
              </div>
            )}
          </div>

          {/* Bottom Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Presets Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(idx);
                    setPlaying(false);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedPreset === idx
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold"
                      : "bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[10px]">{preset.icon}</span>
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Character count & Play Button */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {DEMO_PRESETS[selectedPreset].text.length} / 5000
              </span>
              <button
                onClick={handlePlayToggle}
                aria-label={playing ? "Stop preview" : "Play preview"}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  playing
                    ? "bg-emerald-500 text-white shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                }`}
              >
                {playing ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <polygon points="6 4 20 12 6 20" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Proof Statement Underneath */}
        <p className="mt-8 text-xs font-medium tracking-wide text-slate-400 animate-fade-up-delay-4">
          The solution of choice for fast audio engineering, content creators, and AI teams.
        </p>
      </div>
    </section>
  );
}
