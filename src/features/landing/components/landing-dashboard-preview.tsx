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
    <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 bg-[#f6f8fa] border-y border-[#e4e7ec] overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Section Badge Before Main Image */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[7px] bg-[#ffffff] border border-[#e4e7ec] text-[12px] font-medium text-[#6f7988] shadow-[0_1px_2px_rgba(28,40,64,0.04)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#266df0]" />
            Dashboard Preview
          </div>
        </div>

        {/* Featured Main Dashboard Showcase Frame — Browser-Frame Style */}
        <div className="relative rounded-[14px] border border-[#e4e7ec] bg-[#ffffff] shadow-[rgba(28,40,64,0.06)_0px_16px_36px_0px,rgba(28,40,64,0.04)_0px_2px_4px_0px] overflow-hidden max-w-5xl mx-auto">
          {/* Browser Chrome Header Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f6f8fa] border-b border-[#e4e7ec]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#cad0d9]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#cad0d9]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#cad0d9]" />
            </div>
            <div className="mx-auto flex items-center justify-center px-4 py-0.5 rounded-[6px] bg-[#ffffff] border border-[#e4e7ec] text-[11px] font-mono text-[#8f99a8]">
              cadence.studio/dashboard
            </div>
            <div className="w-10" />
          </div>

          <div 
            onClick={() => setSelectedImage(STUDIO_SCREENSHOTS[0])}
            className="relative overflow-hidden bg-white flex items-center justify-center cursor-pointer group"
            title="Click to view full-resolution screenshot"
          >
            <Image
              src="/screenshots/dashboard.jpg"
              alt="Cadence Audio & Media Production Suite Dashboard"
              width={1920}
              height={1533}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
              className="w-full h-auto object-contain object-top transition-transform duration-500 ease-out group-hover:scale-[1.006]"
            />
            {/* Click-to-expand hover pill */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#232529] text-white text-[12px] font-medium shadow-md pointer-events-none">
              <Maximize2 className="size-3.5" />
              <span>Expand Preview</span>
            </div>
          </div>
        </div>

        {/* Collapsible Trigger Bar */}
        <div className="flex flex-col items-center justify-center pt-3">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="btn-ghost-cadence inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer"
          >
            <LayoutGrid className="size-3.5 text-[#266df0]" />
            <span>
              {isExpanded ? "Collapse Studio Showcase" : "Explore All 12 Studios & Workspaces"}
            </span>
            {isExpanded ? (
              <ChevronUp className="size-3.5 text-[#6f7988]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6f7988]" />
            )}
          </button>
          <span className="text-[12px] text-[#8f99a8] mt-2 font-normal">
            {isExpanded ? "Showing all production studio interfaces" : "Click to view screenshots of every studio interface"}
          </span>
        </div>

        {/* Collapsible 3-Column Studio Showcase Grid */}
        {isExpanded && (
          <div className="pt-6 animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {STUDIO_SCREENSHOTS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item)}
                  className="group rounded-[12px] border border-[#e4e7ec] bg-[#ffffff] p-3 shadow-[0_1px_3px_rgba(28,40,64,0.05)] hover:shadow-[rgba(28,40,64,0.08)_0px_6px_20px_0px] transition-all flex flex-col justify-between cursor-pointer hover:border-[#bad0fa]"
                >
                  <div className="space-y-3">
                    {/* Thumbnail Frame */}
                    <div className="relative rounded-[8px] overflow-hidden border border-[#eeeff1] bg-[#f6f8fa] aspect-[16/10]">
                      <Image
                        src={`/screenshots/${item.filename}`}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-[#1c1d1f]/0 group-hover:bg-[#1c1d1f]/10 transition-colors flex items-center justify-center">
                        <div className="size-7 rounded-[7px] bg-white shadow-md flex items-center justify-center text-[#1c1d1f] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="size-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Title and Category */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-[13px] font-semibold text-[#1c1d1f] group-hover:text-[#266df0] transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-[#f4f5f6] text-[#6f7988] font-medium shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#6f7988] leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-[#eeeff1] flex items-center justify-between text-[11px] text-[#8f99a8] font-medium">
                    <span className="group-hover:text-[#266df0] transition-colors">Click to inspect UI</span>
                    <Maximize2 className="size-3 text-[#8f99a8] group-hover:text-[#266df0] transition-colors" />
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
          className="fixed inset-0 z-50 bg-[#101113]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative w-full max-w-5xl bg-[#ffffff] rounded-[14px] shadow-2xl overflow-hidden border border-[#e4e7ec]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#eeeff1] bg-[#f6f8fa]">
              <div className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-[#266df0]" />
                <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#1c1d1f]">
                  {selectedImage.title}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-[5px] bg-[#e4e7ec] text-[#2e3238] font-medium hidden sm:inline-block">
                  {selectedImage.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="size-7 rounded-[7px] bg-[#ffffff] hover:bg-[#f4f5f6] border border-[#e4e7ec] flex items-center justify-center text-[#6f7988] hover:text-[#1c1d1f] transition-colors"
                title="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="relative max-h-[78vh] overflow-y-auto bg-[#f6f8fa] p-2 sm:p-5">
              <div className="w-full flex justify-center">
                <Image
                  src={`/screenshots/${selectedImage.filename}`}
                  alt={selectedImage.title}
                  width={1920}
                  height={1533}
                  priority
                  className="w-full h-auto object-contain rounded-[10px] border border-[#e4e7ec] shadow-sm"
                />
              </div>
            </div>

            {/* Modal Caption */}
            <div className="px-4 sm:px-6 py-3 bg-[#ffffff] border-t border-[#eeeff1] text-[13px] text-[#6f7988] leading-relaxed">
              {selectedImage.summary}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
