"use client";

import { useState } from "react";
import { Terminal, Shield, Zap, Sparkles, Cpu, Layers, HardDrive, Lock, Server, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function LandingWhy() {
  const { isSignedIn, isLoaded } = useAuth();
  const studioHref = isLoaded && isSignedIn ? "/dashboard" : "/sign-up";

  const models = [
    { name: "Chatterbox Turbo", role: "Voice Synthesis", spec: "24kHz Mono" },
    { name: "Whisper Large-v3", role: "Speech-to-Text", spec: "99+ Languages" },
    { name: "OpenVoice v2", role: "Tone Morphing", spec: "Zero-shot" },
    { name: "Meta MusicGen Melody", role: "Beats & Harmony", spec: "44.1kHz Stereo" },
    { name: "ACE-Step 1.5", role: "Full Songs & Vocals", spec: "Multi-genre" },
    { name: "Meta Demucs v4", role: "4-Track Stem Separation", spec: ">9.2 dB SDR" },
    { name: "Meta AudioGen", role: "Foley & Sound FX", spec: "Studio SFX" },
    { name: "RVC v2", role: "Singing Voice Conversion", spec: "RMVPE Pitch" },
    { name: "Resemble Enhance", role: "Neural Speech Denoise", spec: "44.1kHz Clean" },
    { name: "SenseNova-U1.5", role: "Photorealistic Art", spec: "8B MoT" },
    { name: "Qwen-Image-2.1", role: "Typography & Multi-Image Edit", spec: "7B DiT + 8B VL" },
    { name: "SDXL-Turbo", role: "Single-Step Diffusion", spec: "1024px Fast" },
    { name: "Wan2.1", role: "Cinematic Video & Visuals", spec: "4K UHD" },
    { name: "Kokoro-82M", role: "Real-Time Agent TTS", spec: "<200ms TTFT" },
    { name: "Qwen2.5-1.5B", role: "Conversational Agent", spec: "Sub-50ms TTFT" },
    { name: "NVIDIA Parakeet", role: "Real-Time ASR", spec: "Sub-80ms CTC" },
  ];

  return (
    <section id="why" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAF9F6] border-b border-border/50 relative overflow-hidden">
      {/* Ambient background glow */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle 900px at 50% 15%, rgba(99,102,241,0.07), transparent 70%)"
        }}
      />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Why Cadence
          </div>
          <h2 style={{ fontSize: "clamp(1.9rem,3.5vw,2.8rem)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: "0.75rem", marginBottom: "1rem" }}>
            The open creative platform for <span className="text-gradient-cadence">voice, music &amp; media</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Built entirely on open foundation weights and self-hosted serverless GPU infrastructure. Complete ownership of your models, sub-second latency, and zero vendor lock-in.
          </p>
        </div>

        {/* Modern Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Bento Card 1: 100% Open Weights (Spans 7 cols) */}
          <div className="md:col-span-7 p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="size-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                  <Terminal className="size-5" />
                </div>
                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-indigo-50/80 text-indigo-700 border border-indigo-200/60">
                  100% Open Weights
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  Unrestricted Open-Source Foundation Models
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  Cadence brings state-of-the-art weights directly to your studio. No black-box closed APIs, no sudden feature deprecations, and no arbitrary rate limit shutdowns.
                </p>
              </div>

              {/* Stack Model Badges - Guaranteed 2 Per Row on Mobile, Flex on Desktop */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Integrated Model Stack ({models.length})
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold">100% Open Weights</span>
                </div>
                
                {/* 2 per row grid on mobile with natural text wrapping so nothing cuts off */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {models.map((m) => (
                    <div 
                      key={m.name}
                      className="flex items-start gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100/90 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200/70 text-[11px] sm:text-xs font-semibold text-slate-800 transition-colors leading-tight"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1" />
                      <span className="break-words">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Commercial license ready
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Inspectable PyTorch checkpoints
              </span>
            </div>
          </div>

          {/* Bento Card 2: Serverless GPU Telemetry (Spans 5 cols) */}
          <div className="md:col-span-5 p-5 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-[0_16px_40px_-10px_rgba(15,23,42,0.3)] flex flex-col justify-between relative overflow-hidden">
            {/* Terminal Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full bg-red-500/80" />
                    <div className="size-2.5 rounded-full bg-amber-500/80" />
                    <div className="size-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">telemetry</span>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Scale-to-Zero
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1.5">
                  NVIDIA A10G On Demand
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Containers initialize in ~2.4s and terminate immediately after processing. $0.00 idle cost when no generation is active.
                </p>
              </div>

              {/* Terminal Readout Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between gap-2 text-slate-400 text-[11px]">
                  <span className="shrink-0">GPU INSTANCE</span>
                  <span className="text-indigo-400 text-right">Modal A10G (24GB)</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-slate-400 text-[11px]">
                  <span className="shrink-0">IDLE CLOUD COST</span>
                  <span className="text-emerald-400 font-bold text-right">$0.00 / hour</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-slate-400 text-[11px]">
                  <span className="shrink-0">COLD START TIME</span>
                  <span className="text-white text-right">~2.4s warm cached</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-slate-400 text-[11px]">
                  <span className="shrink-0">CUDA RUNTIME</span>
                  <span className="text-amber-400 text-right">PyTorch 2.4 + cu121</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Pay only for GPU seconds</span>
              <span className="text-indigo-400 font-semibold">Zero instance waste</span>
            </div>
          </div>

          {/* Bento Card 3: Data Sovereignty Vault (Spans 5 cols) */}
          <div className="md:col-span-5 p-5 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="size-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Shield className="size-5" />
                </div>
                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Data Sovereignty
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-2">
                  Your Voiceprints Stay Yours
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Cloned reference audio, generated stems, and transcripts reside in your private Cloudflare R2 bucket protected by short-lived signed URLs.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {[
                  "No training on customer voiceprints or stems",
                  "Short-lived cryptographic signed audio URLs",
                  "Zero egress fees on Cloudflare R2 streaming",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="size-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <CheckCircle2 className="size-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
              Private Cloudflare R2 Storage Encryption
            </div>
          </div>

          {/* Bento Card 4: Audio Quality & Latency Benchmark (Spans 7 cols) */}
          <div className="md:col-span-7 p-5 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="size-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
                  <Layers className="size-5" />
                </div>
                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Full Creative Suite
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  From Text and Voice to Music and Visuals
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Turn text into lifelike speech, clone your own voice from a short audio clip, transform vocal tone with the voice changer, produce custom music tracks, transcribe speech with accurate timestamps, and create visuals for your media.
                </p>
              </div>

              {/* 3 Metric Badges - Horizontal on sm+, vertical stack or flex on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audio Quality</div>
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">44.1 kHz</div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono sm:mt-1">Hi-Fi Stereo Output</div>
                </div>
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Voice Cloning</div>
                    <div className="text-base sm:text-lg font-extrabold text-indigo-600 mt-0.5">5s Clip</div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono sm:mt-1">Zero-Shot Latent</div>
                </div>
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inference Speed</div>
                    <div className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">~140 ms</div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono sm:mt-1">Sub-Second Response</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">Ready to build or clone your first voice?</span>
              <Link
                href={studioHref}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <span>Launch Studio Free</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
