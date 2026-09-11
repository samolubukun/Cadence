"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const STEPS = [
  {
    step: "01",
    title: "Select or Clone Persona",
    tag: "Acoustic Timbre",
    desc: "Choose from 30 hand-curated studio personas with labeled accents and styles, or upload a 5-second voice recording to extract vocal timbre and prosody zero-shot.",
    detail: "No fine-tuning or training jobs required. Timbre is mapped into high-dimensional flow space in < 150ms.",
    badge: "30 System Voices",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
      </svg>
    ),
    visual: {
      label: "Persona Profile",
      value: "Julian (British Broadcast)",
      meta: "Sample: 24kHz Mono WAV",
      bars: [35, 60, 90, 45, 80, 100, 65, 85, 40, 70, 95, 55],
    },
  },
  {
    step: "02",
    title: "Fine-Tune Prosody & Emotion",
    tag: "Neural Control",
    desc: "Adjust vocal exaggeration (0.0–2.0x), pacing rate, and punctuation pausing directly in the editor. Shape expressive emotion without robotic artifacts.",
    detail: "Real-time diffusion vocoder preserves micro-intonations, whisper dynamics, and breath cadence.",
    badge: "Flow Matching",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14"/>
        <line x1="4" y1="10" x2="4" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12" y2="3"/>
        <line x1="20" y1="21" x2="20" y2="16"/>
        <line x1="20" y1="12" x2="20" y2="3"/>
        <line x1="1" y1="14" x2="7" y2="14"/>
        <line x1="9" y1="8" x2="15" y2="8"/>
        <line x1="17" y1="16" x2="23" y2="16"/>
      </svg>
    ),
    visual: {
      label: "Prosody Matrix",
      value: "Exaggeration: 0.85x | Pace: 1.0x",
      meta: "Temperature: 0.80 | Top-P: 0.95",
      bars: [45, 75, 50, 90, 60, 80, 100, 70, 85, 40, 65, 90],
    },
  },
  {
    step: "03",
    title: "Serverless GPU Generation",
    tag: "A10G Compute",
    desc: "Requests execute on dedicated NVIDIA A10G tensor cores managed via Modal. Containers scale to zero automatically when idle, eliminating 24/7 cloud costs.",
    detail: "Pure PyTorch CUDA inference completes in sub-second response times with zero cold-start queue lockups.",
    badge: "$0.00 Idle Cost",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/>
        <line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>
    ),
    visual: {
      label: "Cluster Telemetry",
      value: "Latency: 640ms | Scale: 0 -> 1",
      meta: "Modal A10G 24GB VRAM",
      bars: [60, 85, 40, 95, 70, 50, 100, 80, 60, 90, 75, 45],
    },
  },
  {
    step: "04",
    title: "Instant Audio & Word Timestamps",
    tag: "Delivery & Sync",
    desc: "Stream the pristine 24kHz WAV directly to your browser or save to private Cloudflare R2 storage. Simultaneously export OpenAI Whisper word-level timestamps for video captions.",
    detail: "Generate SRT, VTT, or JSON subtitles locked perfectly to every phoneme for video editing and dubbing.",
    badge: "Whisper large-v3",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    visual: {
      label: "Audio & Subtitle Sync",
      value: "Format: 24kHz WAV + SRT",
      meta: "Word Alignment: 99.4% precision",
      bars: [30, 50, 70, 90, 65, 85, 100, 75, 60, 80, 95, 40],
    },
  },
];

export function LandingHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const { isSignedIn, isLoaded } = useAuth();
  const studioHref = isLoaded && isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 px-4 sm:px-6 bg-[#F8FAFC] border-y border-slate-200/60 overflow-hidden">
      {/* Subtle ambient radiant glow behind the section */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)"
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <div className="section-label inline-flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            End-to-End Workflow
          </div>
          <h2 
            className="text-slate-900 tracking-tight leading-[1.12] mb-4 text-gradient-hero"
            style={{ fontSize: "clamp(2rem, 3.8vw, 3rem)", fontWeight: 800 }}
          >
            How Cadence transforms<br className="hidden sm:block" /> pure text into living voice
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            From raw script to studio-grade broadcast master in 4 frictionless steps. Powered by open-source flow-matching diffusion and zero-latency GPU pipelines.
          </p>
        </div>

        {/* 4 Interactive Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {STEPS.map((s, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`text-left p-6 sm:p-7 rounded-2xl transition-all duration-300 relative flex flex-col justify-between ${
                  isActive
                    ? "bg-white border-2 border-indigo-500/80 shadow-[0_16px_36px_-12px_rgba(99,102,241,0.2),0_0_0_1px_rgba(99,102,241,0.2)] -translate-y-1"
                    : "bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]"
                }`}
              >
                <div>
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span 
                      className={`text-xs font-mono font-bold tracking-widest px-2.5 py-1 rounded-full ${
                        isActive 
                          ? "bg-indigo-600 text-white shadow-xs" 
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      STEP {s.step}
                    </span>
                    <div 
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isActive 
                          ? "bg-indigo-50 text-indigo-600" 
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {s.icon}
                    </div>
                  </div>

                  {/* Title & Tag */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {s.desc}
                  </p>
                </div>

                {/* Bottom Visual Wave Bar Mini Preview */}
                <div className="pt-4 border-t border-slate-100/80 mt-auto">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                    <span>{s.tag}</span>
                    <span className="text-indigo-600 font-mono text-[10px] bg-indigo-50/80 px-2 py-0.5 rounded">
                      {s.badge}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-6">
                    {s.visual.bars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-full transition-all duration-300"
                        style={{
                          height: `${h}%`,
                          backgroundColor: isActive ? "#6366F1" : "#E2E8F0",
                          opacity: isActive ? 0.35 + (h / 100) * 0.65 : 0.6,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Deep Dive Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Active Pipeline Stage: {STEPS[activeStep].step} - {STEPS[activeStep].title}
            </div>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl">
              {STEPS[activeStep].detail}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={studioHref}
              className="btn-dark-carbon whitespace-nowrap flex-shrink-0 text-center justify-center text-xs sm:text-sm px-5 py-2.5"
            >
              <span>Test This In Studio</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
