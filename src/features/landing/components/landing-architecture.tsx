"use client";

import Image from "next/image";
import { Cpu, HardDrive, Database, ShieldCheck, Layers, Mic, Music, Video, Wand2 } from "lucide-react";

export function LandingArchitecture() {
  const modalWorkloads = [
    {
      title: "Voice & Speech Engine",
      models: "Chatterbox Turbo & Whisper large-v3",
      specs: "24kHz TTS • Word timestamps STT",
      icon: Mic,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      title: "Real-Time Voice Agent",
      models: "Silero VAD, Parakeet, Qwen2.5 & Kokoro",
      specs: "Sub-200ms TTFT • WebSocket • Instant Barge-In",
      icon: Mic,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Cadence Studio Engine",
      models: "Demucs v4, RVC v2 & Resemble Enhance",
      specs: "4-Stem split • Singing cover • 44.1kHz denoise",
      icon: Layers,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      title: "Voice Morphing Engine",
      models: "OpenVoice v2 Engine",
      specs: "Zero-shot timbre clone • Pitch shift",
      icon: Mic,
      color: "text-pink-600 bg-pink-50 border-pink-200",
    },
    {
      title: "Music & Beat Engine",
      models: "MusicGen, AudioGen & ACE-Step",
      specs: "Melody & beats • Foley SFX",
      icon: Music,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Studio Image Visuals",
      models: "SenseNova-U1.5-8B MoT & SDXL-Turbo",
      specs: "Native 1024px • MoT realism & 1-step fast",
      icon: Wand2,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Video Visualizer Engine",
      models: "Wan2.1 1.3B Diffusion Transformer",
      specs: "4s audio-reactive scene loops • 16:9 & 9:16",
      icon: Video,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
  ];

  const cloudServices = [
    {
      layer: "02",
      icon: HardDrive,
      logo: "/images/logos/cloudflare.png",
      title: "Cloudflare R2 Storage",
      subtitle: "Private Bucket • Zero Egress Fees",
      badge: "Media Vault",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      desc: "All generated WAV masters, audio stems, reference recordings, album covers, and MP4 visualizer files live in your private Cloudflare R2 bucket. Access is secured by short-lived pre-signed URLs.",
      pills: ["Zero Egress Fees", "Private Buckets", "Short-lived Signed URLs", "Global Edge Cache", "GDPR Compliant"],
    },
    {
      layer: "03",
      icon: Database,
      logo: "/images/logos/convex.png",
      title: "Convex Real-Time Database",
      subtitle: "Reactive Subscriptions • Instant State Sync",
      badge: "Sync & State",
      color: "text-rose-600 bg-rose-50 border-rose-200",
      desc: "Convex handles generations metadata, live credit audit ledgers, voice catalog indexing, and organization state. Reactive queries update the dashboard immediately as GPU inference completes.",
      pills: ["Reactive Queries", "Instant Client Sync", "ACID Transactions", "Zero WebSockets Overhead", "Credit Audit Ledger"],
    },
    {
      layer: "04",
      icon: ShieldCheck,
      logo: "/images/logos/nextjs.png",
      title: "Edge Security & Tenant Isolation",
      subtitle: "Clerk Auth • JWT Cryptographic Verification",
      badge: "Zero-Trust",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      desc: "Cryptographically verified session tokens with automated multi-tenant isolation. Every media download and voice conversion request validates organization boundaries before issuing signed streaming tokens.",
      pills: ["Multi-Tenant Isolation", "Clerk JWT Auth", "Signed Audio Streaming", "Encrypted At Rest", "Sub-50ms Edge Gating"],
    },
  ];

  return (
    <section id="architecture" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAF9F6] border-b border-slate-200/60 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/60 text-xs font-semibold uppercase tracking-wider text-indigo-900">
            Under the Hood
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Self-hosted infrastructure, zero vendor lock-in
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every component runs on open source models and managed cloud primitives. No proprietary black boxes, transparent latency.
          </p>
        </div>

        {/* TOP ROW: Full-Width Dedicated Modal Serverless GPU Containers Card */}
        <div className="p-5 sm:p-8 bg-white/95 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-6 group hover:border-slate-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="size-11 sm:size-12 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                <Image
                  src="/images/logos/modal.png"
                  alt="Modal Labs"
                  width={36}
                  height={36}
                  className="size-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  Modal Serverless GPU Compute Engine
                </h3>
                <p className="text-xs sm:text-sm font-mono text-slate-500 mt-0.5">
                  Dedicated NVIDIA A10G (24GB VRAM) • 6 Specialized GPU Microservices
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pl-14 sm:pl-0">
              <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                Compute Engine
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
                01
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-4xl">
            Six specialized container microservices cold-start on demand (~2.5s) and terminate immediately when inference completes ($0.00 idle cost). PyTorch CUDA kernels run directly on high-bandwidth A10G GPUs:
          </p>

          {/* 6 Mini Container Cards in a Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {modalWorkloads.map((workload) => {
              const Icon = workload.icon;
              return (
                <div
                  key={workload.title}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`size-8 rounded-xl border flex items-center justify-center ${workload.color}`}>
                        <Icon className="size-4" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        Container
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {workload.title}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-600 mt-1">
                        {workload.models}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold block truncate">
                      {workload.specs}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Pills */}
          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
            {["NVIDIA A10G (24GB VRAM)", "6 Specialized Microservices", "$0.00 Idle Cost", "~2.5s Cold Start", "PyTorch CUDA Native", "Auto Scale-to-Zero"].map((pill) => (
              <span
                key={pill}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100/80 text-slate-600 border border-slate-200/60"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* BOTTOM ROW: 3 Cards for Cloudflare R2, Convex, and Edge Security */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cloudServices.map(({ layer, logo, title, subtitle, badge, color, desc, pills }) => (
            <div
              key={layer}
              className="p-7 rounded-3xl bg-white/95 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group hover:border-slate-300"
            >
              <div className="space-y-4">
                {/* Top bar with Official Logo and Layer Number */}
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Image
                      src={logo}
                      alt={title}
                      width={32}
                      height={32}
                      className="size-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {badge}
                    </span>
                    <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
                      {layer}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {subtitle}
                  </p>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {desc}
                </p>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100/80 text-slate-600 border border-slate-200/60"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
