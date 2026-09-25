"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Mic, 
  Layers, 
  FileText, 
  Music, 
  Volume2, 
  Video, 
  ArrowRight,
  Sliders,
  Radio,
  Sparkles
} from "lucide-react";

export function LandingBento() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const studios = [
    {
      title: "Text to Speech",
      badge: "Chatterbox Turbo",
      subtitle: "24kHz Neural Synthesis",
      icon: Mic,
      accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
      link: "/text-to-speech",
      description: "Sub-second streaming TTS with fine-grained exaggeration and pacing sliders. Generates living human voice without robotic artifacts.",
      previewDetails: "Controllable 0.0x–2.0x exaggeration • 24kHz studio sampling • Token-by-token streaming",
    },
    {
      title: "Voice Cloning",
      badge: "Zero-Shot Flow-Matching",
      subtitle: "Instant 5-Second Voiceprints",
      icon: Radio,
      accent: "text-purple-600 bg-purple-50 border-purple-200",
      link: "/voice-clone",
      description: "Clone any human voice timbre in under 5 seconds from a single WAV reference clip. No fine-tuning or model retraining required.",
      previewDetails: "98.1% timbre match • Diffusion flow backbone • Instant persona creation",
    },
    {
      title: "Speech to Text",
      badge: "Whisper large-v3",
      subtitle: "Word-Accurate Transcription",
      icon: FileText,
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
      link: "/transcribe",
      description: "Transcribe long-form podcasts, interviews, and lectures in 99+ languages with forced alignment word-level timestamps and subtitle exports.",
      previewDetails: "Word timestamps • Multi-speaker diarization • Export TXT, SRT, JSON",
    },
    {
      title: "Music & Sound Studio",
      badge: "Demucs v4 • RVC v2 • ACE-Step",
      subtitle: "Beats, Songs, Stems & AI Singing",
      icon: Music,
      accent: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/music",
      description: "Produce full instrumental beats, complete vocal songs, isolate 4-track stems with Demucs v4, and create AI singing covers with RVC v2.",
      previewDetails: "4-Stem Multitrack Split • AI Singing Pitch-Shift • ACE-Step & MusicGen • Foley SFX",
    },
    {
      title: "Voice Changer",
      badge: "OpenVoice v2 & Resemble",
      subtitle: "Speech-to-Speech Timbre Morph",
      icon: Layers,
      accent: "text-pink-600 bg-pink-50 border-pink-200",
      link: "/voice-changer",
      description: "Preserve your exact emotional nuance, pauses, and cadence while instantly morphing your vocal timbre with studio neural denoising.",
      previewDetails: "Zero-shot target audio upload • Realtime pitch tuning • 44.1kHz Resemble Enhance polish",
    },
    {
      title: "Visuals & Video",
      badge: "SenseNova 8B & Wan2.1",
      subtitle: "Studio Art & Motion Loops",
      icon: Video,
      accent: "text-cyan-600 bg-cyan-50 border-cyan-200",
      link: "/media",
      description: "Generate photorealistic 1024px album covers with SenseNova-U1.5-8B MoT, fast SDXL-Turbo art, and Wan2.1 video visualizers.",
      previewDetails: "SenseNova-U1.5-8B MoT • SDXL-Turbo • Wan2.1 1.3B video • 1:1, 16:9 & 9:16",
    },
    {
      title: "Voice Agent Studio",
      badge: "Qwen2.5 • Parakeet • Kokoro",
      subtitle: "Full-Duplex Conversational AI",
      icon: Radio,
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
      link: "/agent",
      description: "Talk directly to an ultra-responsive voice assistant with instant Silero barge-in detection, sub-200ms Kokoro TTS, and zero-shot Chatterbox cloned voices.",
      previewDetails: "Silero VAD • Realtime WebSocket • Parakeet ASR • Sub-200ms TTFT • Custom Personas",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#F4F6FB] overflow-hidden border-b border-border/50">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-xs">
            Full Production Studios
          </div>
          <h2 style={{ fontSize:"clamp(1.9rem,3.5vw,2.8rem)",fontWeight:800,color:"#0F172A",letterSpacing:"-0.04em",lineHeight:1.1,marginTop:"0.75rem",marginBottom:"1rem" }}>
            Everything you need to <span className="text-gradient-cadence">generate voice, music &amp; media</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Seven dedicated production studios powered by self-hosted open source neural weights on serverless NVIDIA A10G GPUs.
          </p>
        </div>

        {/* 6 Studio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {studios.map((studio) => {
            const Icon = studio.icon;
            return (
              <div 
                key={studio.title}
                className="p-6 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group hover:border-slate-300"
              >
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className={`size-11 rounded-2xl border flex items-center justify-center ${studio.accent}`}>
                      <Icon className="size-5.5" />
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {studio.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {studio.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      {studio.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {studio.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {studio.previewDetails}
                  </div>

                  <Link 
                    href={studio.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                  >
                    <span>Open {studio.title}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
