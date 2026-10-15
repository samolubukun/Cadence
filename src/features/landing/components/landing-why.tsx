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
    { name: "Ultralytics YOLO11", role: "Speaker Tracking", spec: "Real-Time 9:16" },
  ];

  return (
    <section id="why" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#ffffff] border-b border-[#e4e7ec] relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[7px] bg-[#ffffff] border border-[#e4e7ec] text-[12px] font-medium text-[#6f7988] shadow-[0_1px_2px_rgba(28,40,64,0.04)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#266df0]" />
            Why Cadence
          </div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.2vw,2.6rem)", fontWeight: 600, color: "#1c1d1f", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            The open creative platform for voice, music &amp; media
          </h2>
          <p className="text-[#6f7988] text-[15px] sm:text-[16px] leading-relaxed max-w-2xl mx-auto font-normal">
            Built entirely on open foundation weights and self-hosted serverless GPU infrastructure. Complete ownership of your models, sub-second latency, and zero vendor lock-in.
          </p>
        </div>

        {/* Modern Bento Grid — Attio & Lightdash architectural style */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Bento Card 1: 100% Open Weights (Spans 7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-7 rounded-[14px] bg-[#ffffff] border border-[#e4e7ec] shadow-[0_1px_3px_rgba(28,40,64,0.04)] flex flex-col justify-between relative overflow-hidden hover:border-[#cdd2d9] transition-all">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-[8px] bg-[#f4f5f6] border border-[#e4e7ec] flex items-center justify-center text-[#1c1d1f]">
                  <Terminal className="size-4" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-[6px] bg-[#f4f5f6] text-[#2e3238] border border-[#e4e7ec]">
                  100% Open Weights
                </span>
              </div>

              <div>
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1c1d1f] tracking-tight mb-1.5">
                  Unrestricted Open-Source Foundation Models
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#6f7988] leading-relaxed max-w-xl">
                  Cadence brings state-of-the-art weights directly to your studio. No black-box closed APIs, no sudden feature deprecations, and no arbitrary rate limit shutdowns.
                </p>
              </div>

              {/* Stack Model Badges */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-[#8f99a8] uppercase tracking-wider">
                    Integrated Model Stack ({models.length})
                  </span>
                  <span className="text-[11px] font-mono text-[#266df0]">Verified Checkpoints</span>
                </div>
                
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
                  {models.map((m) => (
                    <div 
                      key={m.name}
                      className="flex items-start gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#f6f8fa] border border-[#e4e7ec] text-[11px] font-mono font-medium text-[#2e3238] leading-tight"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#266df0] shrink-0 mt-1" />
                      <span className="break-words">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#eeeff1] flex items-center justify-between text-[12px] text-[#6f7988] font-normal">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#266df0]" />
                Commercial license ready
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#266df0]" />
                Inspectable PyTorch checkpoints
              </span>
            </div>
          </div>

          {/* Bento Card 2: Dual Compute Architecture — Lightdash Terminal Style (Spans 5 cols) */}
          <div className="md:col-span-5 p-6 sm:p-7 rounded-[14px] bg-[#1a1b25] text-white border border-[#272835] shadow-[rgba(39,40,53,0.12)_0px_8px_24px_0px] flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-[8px] bg-[#272835] border border-[#36394a] flex items-center justify-center text-white">
                  <Cpu className="size-4" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] bg-[#272835] text-[#dfdbff] border border-[#36394a] text-[11px] font-mono font-medium">
                  <span className="size-1.5 rounded-full bg-[#5e4cff]" />
                  Dual Compute
                </div>
              </div>

              <div>
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-white tracking-tight mb-1.5">
                  Modal Cloud &amp; Docker On-Prem
                </h3>
                <p className="text-[13px] text-[#a4abb8] leading-relaxed">
                  Run on serverless NVIDIA A10G GPUs with instant scale-to-zero, or self-host completely air-gapped using modular Docker Compose microservices.
                </p>
              </div>

              {/* Architecture Spec Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div className="p-2.5 rounded-[8px] bg-[#272835]/70 border border-[#36394a]/60">
                  <div className="text-[10px] uppercase text-[#818898] tracking-wider">Cloud Engine</div>
                  <div className="text-[12px] font-medium text-white mt-0.5">Modal Serverless</div>
                  <div className="text-[11px] text-[#5e4cff] font-medium mt-0.5">$0.00 idle • A10G</div>
                </div>

                <div className="p-2.5 rounded-[8px] bg-[#272835]/70 border border-[#36394a]/60">
                  <div className="text-[10px] uppercase text-[#818898] tracking-wider">On-Prem Engine</div>
                  <div className="text-[12px] font-medium text-white mt-0.5">Docker Compose</div>
                  <div className="text-[11px] text-[#a4abb8] font-medium mt-0.5">Local GPU + MinIO</div>
                </div>

                <div className="p-2.5 rounded-[8px] bg-[#272835]/70 border border-[#36394a]/60">
                  <div className="text-[10px] uppercase text-[#818898] tracking-wider">Cold Start</div>
                  <div className="text-[12px] font-medium text-white mt-0.5">~2.4s Cached</div>
                  <div className="text-[11px] text-[#818898] font-medium mt-0.5">Instant volumes</div>
                </div>

                <div className="p-2.5 rounded-[8px] bg-[#272835]/70 border border-[#36394a]/60">
                  <div className="text-[10px] uppercase text-[#818898] tracking-wider">Microservices</div>
                  <div className="text-[12px] font-medium text-white mt-0.5">FastAPI Endpoints</div>
                  <div className="text-[11px] text-[#c8ccf3] font-medium mt-0.5">Dual-Stream Tracing</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#272835] flex items-center justify-between text-[11px] text-[#818898] font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-[#5e4cff]" />
                Zero instance waste
              </span>
              <span className="text-[#a4abb8]">100% Private Workloads</span>
            </div>
          </div>

          {/* Bento Card 3: Data Sovereignty Vault (Spans 5 cols) */}
          <div className="md:col-span-5 p-6 sm:p-7 rounded-[14px] bg-[#ffffff] border border-[#e4e7ec] shadow-[0_1px_3px_rgba(28,40,64,0.04)] flex flex-col justify-between hover:border-[#cdd2d9] transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-[8px] bg-[#f4f5f6] border border-[#e4e7ec] flex items-center justify-center text-[#1c1d1f]">
                  <Shield className="size-4" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-[6px] bg-[#f4f5f6] text-[#2e3238] border border-[#e4e7ec]">
                  Data Sovereignty
                </span>
              </div>

              <div>
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1c1d1f] tracking-tight mb-1.5">
                  Your Voiceprints Stay Yours
                </h3>
                <p className="text-[13px] text-[#6f7988] leading-relaxed">
                  Cloned reference audio, generated stems, and transcripts reside in your private Cloudflare R2 bucket protected by short-lived signed URLs.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {[
                  "No training on customer voiceprints or audio stems",
                  "Short-lived cryptographic signed audio URLs",
                  "Zero egress fees on Cloudflare R2 audio streaming",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[13px] text-[#2e3238]">
                    <div className="size-3.5 rounded-full bg-[#f4f5f6] flex items-center justify-center text-[#266df0] shrink-0">
                      <CheckCircle2 className="size-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#eeeff1] text-[11px] font-mono text-[#8f99a8]">
              Private Cloudflare R2 Storage Encryption
            </div>
          </div>

          {/* Bento Card 4: Audio Quality & Latency Benchmark (Spans 7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-7 rounded-[14px] bg-[#ffffff] border border-[#e4e7ec] shadow-[0_1px_3px_rgba(28,40,64,0.04)] flex flex-col justify-between hover:border-[#cdd2d9] transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-[8px] bg-[#f4f5f6] border border-[#e4e7ec] flex items-center justify-center text-[#1c1d1f]">
                  <Layers className="size-4" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-[6px] bg-[#f4f5f6] text-[#2e3238] border border-[#e4e7ec]">
                  Full Creative Suite
                </span>
              </div>

              <div>
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1c1d1f] tracking-tight mb-1.5">
                  From Text and Voice to Music and Visuals
                </h3>
                <p className="text-[13px] text-[#6f7988] leading-relaxed">
                  Turn text into lifelike speech, clone your own voice from a short audio clip, transform vocal tone with the voice changer, produce custom music tracks, transcribe speech with accurate timestamps, and create visuals for your media.
                </p>
              </div>

              {/* 3 Metric Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-[8px] bg-[#f6f8fa] border border-[#e4e7ec]">
                  <div className="text-[10px] font-bold text-[#8f99a8] uppercase tracking-wider">Audio Quality</div>
                  <div className="text-[16px] font-semibold text-[#1c1d1f] mt-0.5">44.1 kHz</div>
                  <div className="text-[10px] text-[#6f7988] font-mono mt-0.5">Hi-Fi Stereo Output</div>
                </div>
                <div className="p-3 rounded-[8px] bg-[#f6f8fa] border border-[#e4e7ec]">
                  <div className="text-[10px] font-bold text-[#8f99a8] uppercase tracking-wider">Voice Cloning</div>
                  <div className="text-[16px] font-semibold text-[#266df0] mt-0.5">5s Clip</div>
                  <div className="text-[10px] text-[#6f7988] font-mono mt-0.5">Zero-Shot Latent</div>
                </div>
                <div className="p-3 rounded-[8px] bg-[#f6f8fa] border border-[#e4e7ec]">
                  <div className="text-[10px] font-bold text-[#8f99a8] uppercase tracking-wider">Inference Speed</div>
                  <div className="text-[16px] font-semibold text-[#1c1d1f] mt-0.5">~140 ms</div>
                  <div className="text-[10px] text-[#6f7988] font-mono mt-0.5">Sub-Second Response</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#eeeff1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[12px] text-[#6f7988] font-normal">Ready to build or clone your first voice?</span>
              <Link
                href={studioHref}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#266df0] hover:underline"
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
