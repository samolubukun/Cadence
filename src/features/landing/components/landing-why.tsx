"use client";

import { Terminal, Shield, Zap, Sparkles, Cpu, Layers } from "lucide-react";

export function LandingWhy() {
  const openSourceBenefits = [
    {
      icon: Terminal,
      title: "100% Open Weights & Self-Hostable",
      subtitle: "Run on Your Own GPU Infrastructure",
      description: "Cadence is built entirely on open-source foundation models (Chatterbox, Whisper, OpenVoice, Audiocraft, Wan2.1). Deploy to your own Modal, AWS, or local GPU cluster anytime.",
      badge: "Zero Lock-In",
    },
    {
      icon: Cpu,
      title: "Isolated Serverless GPU Execution",
      subtitle: "Scale-to-Zero NVIDIA A10G",
      description: "No dedicated instance waste. Inference requests spin up isolated GPU containers on demand in ~2.5s and terminate immediately when complete ($0 idle cost).",
      badge: "Pure Efficiency",
    },
    {
      icon: Shield,
      title: "Data Sovereignty & Private R2 Storage",
      subtitle: "Your Voiceprints Stay Yours",
      description: "Cloned voice references, generated audio stems, and transcriptions live in your private Cloudflare R2 bucket protected by short-lived signed URLs.",
      badge: "Private & Secure",
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAF9F6] border-b border-border/60 relative overflow-hidden">
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle 800px at 50% 10%, rgba(99,102,241,0.06), transparent 70%)"
        }}
      />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/60 text-xs font-semibold uppercase tracking-wider text-indigo-900">
            Why Cadence
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Built on open-source models, deployed on your own infrastructure
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            No proprietary black boxes. You get full control of model weights, transparent sub-second latency, and private cloud storage with zero vendor lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {openSourceBenefits.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.title}
                className="p-7 rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="size-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono text-indigo-600 mt-1">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
