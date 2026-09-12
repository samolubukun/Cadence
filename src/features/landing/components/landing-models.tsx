"use client";

import { Cpu, Music, Mic, FileText, Video, Sparkles, Wand2, Layers, CheckCircle2 } from "lucide-react";

export function LandingModels() {
  const models = [
    {
      name: "Chatterbox Turbo",
      provider: "Resemble AI / Open Weights",
      category: "Text-to-Speech",
      tag: "TTS",
      specs: "24kHz • Sub-second • Zero-shot",
      description: "Fast multi-speaker speech synthesis with fine emotion and pitch conditioning.",
      icon: Mic,
      badgeColor: "text-indigo-600 bg-indigo-50 border-indigo-200/80",
    },
    {
      name: "Whisper large-v3",
      provider: "OpenAI Open Source",
      category: "Speech-to-Text",
      tag: "STT",
      specs: "Word-level timestamps • 99+ languages",
      description: "Robust multilingual transcription and automatic translation at state-of-the-art accuracy.",
      icon: FileText,
      badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
    },
    {
      name: "OpenVoice v2",
      provider: "MyShell AI",
      category: "Speech-to-Speech",
      tag: "STS",
      specs: "Zero-shot cloning • Tone color clone",
      description: "Instantaneous timbre morphing while preserving original emotion, rhythm, and intonation.",
      icon: Layers,
      badgeColor: "text-pink-600 bg-pink-50 border-pink-200/80",
    },
    {
      name: "Meta AudioGen",
      provider: "Meta Audiocraft",
      category: "Sound FX Synthesis",
      tag: "SFX",
      specs: "16kHz • Autoregressive LM",
      description: "Generate photorealistic Foley, studio ambient soundscapes, and cinematic impact effects.",
      icon: Sparkles,
      badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-200/80",
    },
    {
      name: "Meta MusicGen Melody",
      provider: "Meta Audiocraft",
      category: "Melody & Harmony",
      tag: "Composition",
      specs: "32kHz • Melody conditioning",
      description: "Controllable text-to-music generation guided by harmonic structure and BPM guidance.",
      icon: Music,
      badgeColor: "text-purple-600 bg-purple-50 border-purple-200/80",
    },
    {
      name: "ACE-Step 1.5 Turbo",
      provider: "Torchcodec Accelerated",
      category: "Beat & Groove Studio",
      tag: "Drum Machine",
      specs: "44.1kHz • Low-latency step engine",
      description: "Rhythmic beat creation spanning Hip-Hop, Lo-Fi, Trap, and Cinematic percussion.",
      icon: Cpu,
      badgeColor: "text-amber-600 bg-amber-50 border-amber-200/80",
    },
    {
      name: "SDXL-Turbo",
      provider: "Stability AI",
      category: "Visuals & Album Art",
      tag: "Image",
      specs: "1024x1024 • Adversarial Diffusion",
      description: "Single-step ultra-fast image generation creating high-res album covers and visual artwork.",
      icon: Wand2,
      badgeColor: "text-blue-600 bg-blue-50 border-blue-200/80",
    },
    {
      name: "Wan2.1 1.3B",
      provider: "Wan-Video Open Model",
      category: "Video Visualizers",
      tag: "Video",
      specs: "Diffusion Transformer • 4s loop",
      description: "Cinematic audio-reactive scene generation, dynamic sound wave rendering, and cosmic visualizers.",
      icon: Video,
      badgeColor: "text-violet-600 bg-violet-50 border-violet-200/80",
    },
  ];

  return (
    <section id="models" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAF9F6] border-b border-border/50 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 10%, rgba(99,102,241,0.06) 0%, transparent 70%)"
        }}
      />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/60 text-xs font-semibold uppercase tracking-wider text-indigo-900">
            Open Weights Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Powered by Foundation Open Models
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every audio, voice, visual, and video studio in Cadence runs on vetted, self-hosted open-source neural weights on serverless NVIDIA A10G GPUs.
          </p>
        </div>

        {/* 8-Model Grid - Clean, light-themed luxury cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {models.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className="p-5 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group hover:border-indigo-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`size-9 rounded-xl border flex items-center justify-center ${m.badgeColor}`}>
                      <Icon className="size-4.5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {m.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {m.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {m.provider}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-mono text-indigo-700 font-semibold block truncate">
                    {m.specs}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cloud Infrastructure Bar */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white/95 border border-slate-200 shadow-xs text-center space-y-5">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500">
            Enterprise Cloud Infrastructure
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-slate-900 tracking-tight">Next.js 16</span>
              <span className="text-[10px] font-mono text-slate-500">App Router &amp; Actions</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-amber-600 tracking-tight">Cloudflare R2</span>
              <span className="text-[10px] font-mono text-slate-500">Zero Egress Storage</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-rose-600 tracking-tight">Convex</span>
              <span className="text-[10px] font-mono text-slate-500">Realtime Reactive Sync</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-emerald-700 tracking-tight">Modal Labs</span>
              <span className="text-[10px] font-mono text-slate-500">NVIDIA A10G GPUs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
