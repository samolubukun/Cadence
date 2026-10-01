"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Maximize2, X, LayoutGrid } from "lucide-react";

interface StudioScreenshot {
  id: string;
  title: string;
  filename: string;
  summary: string;
  category: string;
}

const STUDIO_SCREENSHOTS: StudioScreenshot[] = [
  {
    id: "dashboard",
    title: "1. Dashboard",
    filename: "dashboard.jpg",
    category: "Command Center",
    summary: "Unified Command Center: Quick launcher cards across all generation studios, curated voice library browser, and recent studio generation history.",
  },
  {
    id: "explore-voices",
    title: "2. Explore Voices",
    filename: "explore-voices.jpg",
    category: "Voice Library",
    summary: "Curated Voice Library: Browse, search, filter, and instantly audition over 30 broadcast-quality voice personas, accents, genders, and custom clones.",
  },
  {
    id: "tts",
    title: "3. Text to Speech",
    filename: "tts.jpg",
    category: "Speech Generation",
    summary: "Expressive TTS Studio: High-throughput speech synthesis powered by Chatterbox Turbo with instant style presets, audio dynamics controls, and audio player.",
  },
  {
    id: "stt",
    title: "4. Speech to Text",
    filename: "stt.jpg",
    category: "Audio Intelligence",
    summary: "Whisper Transcription: Multilingual transcription powered by Whisper large-v3 featuring clickable word-level timestamps and subtitle exports (.srt, .vtt).",
  },
  {
    id: "voice-cloning",
    title: "5. Voice Cloning",
    filename: "voice-cloning.jpg",
    category: "Flow-Matching",
    summary: "Zero-Shot Voice Cloner: Clone any voice in seconds from a 5-15s reference audio sample or microphone recording into reusable custom voice profiles.",
  },
  {
    id: "music-studio",
    title: "6. Music Studio",
    filename: "music-studio.jpg",
    category: "Composition",
    summary: "Beats, Songs & Foley: Multi-engine music workstation creating instrumental beats (MusicGen), full vocal songs with lyrics (ACE-Step 1.5), and cinematic SFX (AudioGen).",
  },
  {
    id: "voice-changer",
    title: "7. Voice Changer",
    filename: "voice-changer.jpg",
    category: "Voice Morphing",
    summary: "Speech-to-Speech Conversion: Real-time zero-shot timbre and pitch morphing via OpenVoice v2, preserving original emotion, rhythm, and expressive cadence.",
  },
  {
    id: "visuals-video",
    title: "8. Visuals & Video",
    filename: "visuals-video.jpg",
    category: "Generative Art",
    summary: "Generative Visual Suite: Multi-engine image generation & editing (Qwen-Image-2.1, SenseNova MoT, SDXL-Turbo) alongside dynamic motion video visualizers (Wan2.1).",
  },
  {
    id: "viral-clipper",
    title: "9. Viral Clipper",
    filename: "viral-clipper.jpg",
    category: "9:16 Shorts",
    summary: "Automated 9:16 Shorts: Long-form to vertical video pipeline with AI virality scoring, YOLO11 active speaker tracking, retention banners, and kinetic subtitles.",
  },
  {
    id: "voice-agent",
    title: "10. Voice Agent",
    filename: "voice-agent.jpg",
    category: "Real-Time Agent",
    summary: "Real-Time Conversational AI: Ultra-low-latency voice assistant with Silero VAD, instant barge-in interruption, liquid orb visualizer, and custom personas.",
  },
  {
    id: "usage-analytics",
    title: "11. Usage & Analytics",
    filename: "usage-analytics.jpg",
    category: "Telemetry & Accounting",
    summary: "Resource Accounting: Real-time credit consumption breakdowns, per-studio usage charts, execution counts, and team allocation metrics.",
  },
  {
    id: "observability",
    title: "12. Observability",
    filename: "observability.jpg",
    category: "LLM & Model Tracing",
    summary: "Dual-Stream Model Telemetry: Deep observability with Langfuse & Convex traces, latency percentiles, token burn KPIs, waterfall inspect, and payload exports.",
  },
];

export function LandingDashboardPreview() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<StudioScreenshot | null>(null);

  return (
    <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 bg-[#FAF9F6] overflow-hidden">
      {/* Ambient background spotlight */}
      <div 
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.15), transparent 70%)"
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Section Badge Before Main Image */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Dashboard Preview
          </div>
        </div>

        {/* Featured Main Dashboard Showcase Frame */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/90 p-1 sm:p-2 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.15),0_0_0_1px_rgba(255,255,255,0.9)_inset] backdrop-blur-xl group overflow-hidden max-w-5xl mx-auto">
          <div 
            onClick={() => setSelectedImage(STUDIO_SCREENSHOTS[0])}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/70 bg-white shadow-inner flex items-center justify-center cursor-pointer"
            title="Click to view full-resolution screenshot"
          >
            <Image
              src="/screenshots/dashboard.jpg"
              alt="Cadence Audio & Media Production Suite Dashboard"
              width={1920}
              height={1533}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
              className="w-full h-auto object-contain object-top transition-transform duration-700 ease-out group-hover:scale-[1.008]"
            />
            {/* Click-to-expand hover pill */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium shadow-md pointer-events-none">
              <Maximize2 className="size-3.5" />
              <span>Expand</span>
            </div>
          </div>
        </div>

        {/* Collapsible Trigger Bar */}
        <div className="flex flex-col items-center justify-center pt-2">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs hover:shadow-md transition-all text-xs sm:text-sm font-semibold group cursor-pointer"
          >
            <LayoutGrid className="size-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>
              {isExpanded ? "Collapse Studio Showcase" : "Explore All 12 Studios & Workspaces"}
            </span>
            {isExpanded ? (
              <ChevronUp className="size-4 text-slate-500" />
            ) : (
              <ChevronDown className="size-4 text-slate-500 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">
            {isExpanded ? "Showing all production studio interfaces" : "Click to view screenshots of every studio interface"}
          </span>
        </div>

        {/* Collapsible 3-Column Studio Showcase Grid */}
        {isExpanded && (
          <div className="pt-6 animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {STUDIO_SCREENSHOTS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item)}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer hover:border-indigo-200"
                >
                  <div className="space-y-3">
                    {/* Thumbnail Frame */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-[16/10] shadow-2xs">
                      <Image
                        src={`/screenshots/${item.filename}`}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                        <div className="size-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="size-4" />
                        </div>
                      </div>
                    </div>

                    {/* Title and Category */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="group-hover:text-indigo-600 transition-colors">Click to inspect UI</span>
                    <Maximize2 className="size-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-Resolution Modal / Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-indigo-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {selectedImage.title}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold hidden sm:inline-block">
                  {selectedImage.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="size-8 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="relative max-h-[78vh] overflow-y-auto bg-slate-50/50 p-2 sm:p-5">
              <div className="w-full flex justify-center">
                <Image
                  src={`/screenshots/${selectedImage.filename}`}
                  alt={selectedImage.title}
                  width={1920}
                  height={1533}
                  priority
                  className="w-full h-auto object-contain rounded-xl border border-slate-200/90 shadow-sm"
                />
              </div>
            </div>

            {/* Modal Caption */}
            <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
              {selectedImage.summary}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
