"use client";

import Image from "next/image";
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
      logo: "/images/logos/resemble.png",
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
      logo: "/images/logos/openai.png",
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
      logo: "/images/logos/myshell.png",
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
      logo: "/images/logos/meta.png",
      badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-200/80",
    },
    {
      name: "SenseNova-U1.5-8B",
      provider: "SenseTime / Open Weights",
      category: "Studio Visuals",
      tag: "MoT Visuals",
      specs: "8B MoT • Native 1024px • 28 steps",
      description: "State-of-the-art Mixture-of-Transformers for ultra-detailed photorealistic album art, lighting, and textures.",
      icon: Wand2,
      logo: "/images/logos/sensenova.png",
      badgeColor: "text-amber-600 bg-amber-50 border-amber-200/80",
    },
    {
      name: "Qwen-Image-2.1",
      provider: "Alibaba Cloud / Open Weights",
      category: "Typography & Multi-Image Edit",
      tag: "7B DiT + 8B VL",
      specs: "2048px Ultra • Multi-image reference • RGBA",
      description: "Next-gen visual foundation model specialized in flawless legible English typography, transparent PNG assets, and multi-image contextual editing.",
      icon: Wand2,
      logo: "/images/logos/wan.png",
      badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-200/80",
    },
    {
      name: "Meta Demucs v4",
      provider: "Meta AI Research",
      category: "Stem Isolation",
      tag: "htdemucs",
      specs: "44.1kHz • 4 Stems • Hybrid Transformer",
      description: "Deconstruct master tracks into crystal-clean isolated Vocals, Drums, Bass, and Instrumental stems.",
      icon: Layers,
      logo: "/images/logos/meta.png",
      badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-200/80",
    },
    {
      name: "RVC v2",
      provider: "Retrieval-based Voice Conversion",
      category: "AI Singing Voice",
      tag: "RMVPE",
      specs: "RMVPE pitch tracker • Semitone shifting",
      description: "Neural singing voice conversion transforming vocal leads and harmonies into any target artist timbre.",
      icon: Mic,
      badgeColor: "text-rose-600 bg-rose-50 border-rose-200/80",
    },
    {
      name: "Resemble Enhance",
      provider: "Resemble AI",
      category: "Audio Denoise & Polish",
      tag: "Upscaler",
      specs: "44.1kHz • Neural Denoise & Clean",
      description: "Zero-shot acoustic speech restoration removing background noise, distortion, and microphone artifacts.",
      icon: Sparkles,
      logo: "/images/logos/resemble.png",
      badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
    },
    {
      name: "Meta MusicGen Melody",
      provider: "Meta Audiocraft",
      category: "Melody & Harmony",
      tag: "Composition",
      specs: "32kHz • Melody conditioning",
      description: "Controllable text-to-music generation guided by harmonic structure and BPM guidance.",
      icon: Music,
      logo: "/images/logos/meta.png",
      badgeColor: "text-purple-600 bg-purple-50 border-purple-200/80",
    },
    {
      name: "ACE-Step 1.5 Turbo",
      provider: "Torchcodec Accelerated",
      category: "Beat & Full Song",
      tag: "Vocal Engine",
      specs: "44.1kHz • Low-latency step engine",
      description: "Rhythmic beat creation and complete multi-genre songs complete with structured vocals and lyrics.",
      icon: Cpu,
      logo: "/images/logos/acestep.png",
      badgeColor: "text-indigo-600 bg-indigo-50 border-indigo-200/80",
    },
    {
      name: "SDXL-Turbo",
      provider: "Stability AI",
      category: "Fast Visuals",
      tag: "Image",
      specs: "1024x1024 • Adversarial Diffusion",
      description: "Single-step ultra-fast image generation creating high-res album covers and visual artwork.",
      icon: Wand2,
      logo: "/images/logos/stability.png",
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
      logo: "/images/logos/wan.png",
      badgeColor: "text-violet-600 bg-violet-50 border-violet-200/80",
    },
    {
      name: "Kokoro-82M",
      provider: "Hexgrad / Open Weights",
      category: "Real-Time TTS",
      tag: "Ultra-Fast TTS",
      specs: "82M • Sub-200ms TTFT • 24kHz",
      description: "Featherweight neural speech engine delivering studio-grade voice generation at extreme conversational speeds.",
      icon: Mic,
      logo: "/images/logos/kokoro.png",
      badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
    },
    {
      name: "Qwen2.5-1.5B",
      provider: "Alibaba Cloud / Open Weights",
      category: "Conversational Agent",
      tag: "Realtime LLM",
      specs: "1.5B Instruct • Sub-50ms TTFT • Streaming",
      description: "Ultra-responsive reasoning model driving real-time agent dialogue, instant barge-in context, and creative answers.",
      icon: Cpu,
      logo: "/images/logos/wan.png",
      badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-200/80",
    },
    {
      name: "NVIDIA Parakeet",
      provider: "NVIDIA NeMo / FastConformer",
      category: "Low-Latency STT",
      tag: "Realtime ASR",
      specs: "0.6B CTC • Sub-80ms • 16kHz",
      description: "Ultra-fast automated speech recognition with state-of-the-art accuracy for instant real-time user transcription.",
      icon: FileText,
      logo: "/images/logos/nvidia.svg",
      badgeColor: "text-teal-600 bg-teal-50 border-teal-200/80",
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
            Every audio, voice, visual, and video studio in Cadence runs on vetted, self-hosted open source neural weights on serverless NVIDIA A10G GPUs.
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
                    <div className={`size-9 rounded-xl border flex items-center justify-center p-1.5 overflow-hidden ${m.badgeColor}`}>
                      {m.logo ? (
                        <Image
                          src={m.logo}
                          alt={m.provider}
                          width={24}
                          height={24}
                          className="size-full object-contain rounded-full"
                        />
                      ) : (
                        <Icon className="size-4.5" />
                      )}
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

        {/* Original 4-Card Enterprise Cloud Infrastructure Box */}
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

        {/* Detached Moving Logo Strip Directly on the Background Canvas */}
        <div 
          className="relative w-full overflow-hidden py-4"
          style={{ maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}
        >
          <div className="animate-marquee flex items-center gap-5 sm:gap-7">
            {[...Array(2)].flatMap((_, setIdx) => [
              {
                id: `sensenova-${setIdx}`,
                name: "SenseNova",
                logo: "/images/logos/sensenova.png",
                bg: "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20",
                textColor: "text-amber-900",
              },
              {
                id: `qwen-image-${setIdx}`,
                name: "Qwen-Image",
                logo: "/images/logos/wan.png",
                bg: "bg-cyan-500/10 hover:bg-cyan-500/15 border-cyan-500/20",
                textColor: "text-cyan-900",
              },
              {
                id: `acestep-${setIdx}`,
                name: "ACE-Step",
                logo: "/images/logos/acestep.png",
                bg: "bg-slate-900/10 hover:bg-slate-900/15 border-slate-900/20",
                textColor: "text-slate-950",
              },
              {
                id: `stability-${setIdx}`,
                name: "Stability AI",
                logo: "/images/logos/stability.png",
                bg: "bg-purple-500/10 hover:bg-purple-500/15 border-purple-500/20",
                textColor: "text-purple-900",
              },
              {
                id: `wan-${setIdx}`,
                name: "Wan Video",
                logo: "/images/logos/wan.png",
                bg: "bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20",
                textColor: "text-indigo-900",
              },
              {
                id: `meta-${setIdx}`,
                name: "Meta AI",
                logo: "/images/logos/meta.png",
                bg: "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20",
                textColor: "text-blue-900",
              },
              {
                id: `openai-${setIdx}`,
                name: "OpenAI",
                logo: "/images/logos/openai.png",
                bg: "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20",
                textColor: "text-emerald-950",
              },
              {
                id: `resemble-${setIdx}`,
                name: "Resemble AI",
                logo: "/images/logos/resemble.png",
                bg: "bg-teal-500/10 hover:bg-teal-500/15 border-teal-500/20",
                textColor: "text-teal-900",
              },
              {
                id: `myshell-${setIdx}`,
                name: "MyShell AI",
                logo: "/images/logos/myshell.png",
                bg: "bg-purple-500/10 hover:bg-purple-500/15 border-purple-500/20",
                textColor: "text-purple-950",
              },
              {
                id: `kokoro-${setIdx}`,
                name: "Kokoro TTS",
                logo: "/images/logos/kokoro.png",
                bg: "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20",
                textColor: "text-emerald-950",
              },
              {
                id: `nvidia-${setIdx}`,
                name: "NVIDIA",
                logo: "/images/logos/nvidia.svg",
                bg: "bg-lime-500/10 hover:bg-lime-500/15 border-lime-500/20",
                textColor: "text-emerald-950",
              },
              {
                id: `modal-${setIdx}`,
                name: "Modal Labs",
                logo: "/images/logos/modal.png",
                bg: "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20",
                textColor: "text-emerald-800",
              },
              {
                id: `nextjs-${setIdx}`,
                name: "Next.js",
                logo: "/images/logos/nextjs.png",
                bg: "bg-black/5 hover:bg-black/10 border-black/10",
                textColor: "text-slate-900",
              },
              {
                id: `cloudflare-${setIdx}`,
                name: "Cloudflare",
                logo: "/images/logos/cloudflare.png",
                bg: "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20",
                textColor: "text-amber-700",
              },
              {
                id: `convex-${setIdx}`,
                name: "Convex",
                logo: "/images/logos/convex.png",
                bg: "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20",
                textColor: "text-rose-700",
              },
            ]).map((item) => (
              <div
                key={item.id}
                className={`shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${item.bg} backdrop-blur-xs transition-all cursor-default shadow-2xs hover:scale-105`}
              >
                <div className="size-8 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <Image
                    src={item.logo}
                    alt={item.name}
                    width={32}
                    height={32}
                    className="size-full object-contain rounded-full"
                  />
                </div>
                <span className={`text-xs sm:text-sm font-bold tracking-tight ${item.textColor}`}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
