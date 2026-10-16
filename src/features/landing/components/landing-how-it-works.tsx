"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useShowcase } from "@/components/providers/showcase-provider";
import { Mic, Music, Disc3, Radio, AudioWaveform, Film, Sparkles, Play, Sliders, Cpu, Cloud, Layers, CheckCircle2 } from "lucide-react";

interface WorkflowStep {
  step: string;
  title: string;
  tag: string;
  desc: string;
  detail: string;
  badge: string;
  iconName: "mic" | "sliders" | "cpu" | "layers" | "music" | "disc" | "film";
  bars: number[];
}

interface StudioWorkflow {
  id: string;
  name: string;
  tagline: string;
  model: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  studioHref: string;
  ctaText: string;
  interactivePreview: {
    headline: string;
    sub: string;
    chips: string[];
    telemetry: string;
    stats: { label: string; val: string }[];
  };
  steps: WorkflowStep[];
}

const STUDIOS: StudioWorkflow[] = [
  {
    id: "tts",
    name: "Voice Studio & TTS",
    tagline: "Ultra-natural speech synthesis & zero-shot cloning",
    model: "Chatterbox Turbo • Kokoro • 24kHz",
    accent: "#6366F1",
    accentBg: "bg-indigo-50",
    accentBorder: "border-indigo-500",
    studioHref: "/text-to-speech",
    ctaText: "Open Voice Studio",
    interactivePreview: {
      headline: "Broadcast Voice Synthesis Console",
      sub: "Chatterbox neural vocoder and Kokoro neural engine mapping phonetic cadences into emotional speech.",
      chips: ["Chatterbox Turbo", "Kokoro Fast TTS", "Zero-Shot Voice Clones", "Private R2 Export"],
      telemetry: "Modal NVIDIA A10G • 24kHz Uncompressed PCM • Latency: ~140ms",
      stats: [
        { label: "Sampling", val: "24 kHz" },
        { label: "TTFB", val: "~140 ms" },
        { label: "Voice Personas", val: "30+ Built-in" },
        { label: "Cold Start", val: "0s (Warm Pool)" },
      ],
    },
    steps: [
      {
        step: "01",
        title: "Curated Persona or Instant Clone",
        tag: "Timbre Selection",
        desc: "Pick from 30 hand-crafted studio personas across British, American, and regional accents, or clone any custom voice from a 5s audio clip.",
        detail: "Zero-shot acoustic embedding extracts pitch contours and vocal timbre without requiring lengthy model fine-tuning or training datasets.",
        badge: "Zero-Shot Latent",
        iconName: "mic",
        bars: [30, 55, 80, 45, 90, 100, 70, 85, 40, 75, 95, 60],
      },
      {
        step: "02",
        title: "Tune Expressiveness & Pacing",
        tag: "Prosody Control",
        desc: "Dial in emotion exaggeration (0.0x–2.0x), pacing rate, and micro-pauses directly from the responsive control console.",
        detail: "Real-time diffusion vocoders preserve natural breath dynamics, whisper tones, and nuanced syllable stress for broadcast perfection.",
        badge: "Emotion Matrix",
        iconName: "sliders",
        bars: [40, 70, 50, 95, 65, 80, 100, 60, 85, 35, 75, 90],
      },
      {
        step: "03",
        title: "Serverless PyTorch Inference",
        tag: "A10G Compute",
        desc: "Dispatches directly to isolated serverless GPU containers on Modal. Scale-to-zero compute guarantees zero idle cloud cost.",
        detail: "Optimized CUDA kernels execute high-speed tensor transformations, completing multi-paragraph narrations in seconds.",
        badge: "Scale-to-Zero",
        iconName: "cpu",
        bars: [60, 85, 40, 90, 70, 50, 100, 80, 60, 90, 70, 45],
      },
      {
        step: "04",
        title: "Master Audio & Private R2 Storage",
        tag: "Encrypted Storage",
        desc: "Generated audio streams immediately in 24kHz WAV/MP3 and commits to your private Cloudflare R2 bucket with signed URLs.",
        detail: "Export with full metadata, sample rates, and seamless integration into voice changers, video generators, or external media suites.",
        badge: "Zero-Egress R2",
        iconName: "layers",
        bars: [35, 60, 75, 90, 65, 85, 100, 75, 60, 80, 95, 45],
      },
    ],
  },
  {
    id: "stt",
    name: "Speech-to-Text & Transcripts",
    tagline: "Synchronized word-level timestamps & multi-language subtitles",
    model: "OpenAI Whisper Large-v3 • Faster-Whisper CT2",
    accent: "#10B981",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-500",
    studioHref: "/transcribe",
    ctaText: "Open Transcriber",
    interactivePreview: {
      headline: "Whisper Large-v3 Transcription Engine",
      sub: "Timestamped word alignment, diarization, and multi-language translation for podcasts and videos.",
      chips: ["Whisper Large-v3", "Faster-Whisper CT2", "SRT & VTT Exports", "99+ Languages"],
      telemetry: "Modal NVIDIA A10G • Faster-Whisper CT2 • 4x Realtime Speed",
      stats: [
        { label: "Word Accuracy", val: "98.7% WER" },
        { label: "Speed", val: "4x Realtime" },
        { label: "Languages", val: "99+ Native" },
        { label: "Formats", val: "SRT, VTT, JSON, TXT" },
      ],
    },
    steps: [
      {
        step: "01",
        title: "Ingest Speech or Voice Audio",
        tag: "Multilingual Ingest",
        desc: "Upload podcast episodes, meeting recordings, voice memos, or link rendered speech from your Cadence library.",
        detail: "Pre-processing audio filter strips background hum and normalizes audio levels for optimal acoustic recognition.",
        badge: "Noise Suppressed",
        iconName: "mic",
        bars: [40, 65, 85, 55, 80, 100, 65, 90, 45, 75, 95, 60],
      },
      {
        step: "02",
        title: "Whisper Large-v3 Transduction",
        tag: "Transformer Decoder",
        desc: "Processes through Whisper Large-v3 on GPU, recovering accurate punctuation, capitalization, and speaker context.",
        detail: "Generates microsecond-accurate word boundaries for perfect subtitle synchronization in video editing suites.",
        badge: "Word Alignment",
        iconName: "cpu",
        bars: [45, 75, 55, 95, 70, 85, 100, 65, 90, 40, 80, 95],
      },
      {
        step: "03",
        title: "Interactive Transcript Editor",
        tag: "Live Inspector",
        desc: "Click any word in the transcript to jump audio playback directly to that millisecond mark in the waveform.",
        detail: "Search, edit typographical details, and preview synchronized video subtitles right in the browser.",
        badge: "Interactive Sync",
        iconName: "sliders",
        bars: [60, 85, 50, 95, 75, 60, 100, 80, 65, 90, 75, 45],
      },
      {
        step: "04",
        title: "Export Subtitles & Broadcast Formats",
        tag: "SRT / VTT / JSON",
        desc: "Download formatted .SRT, .VTT, or structured JSON with complete per-word timestamp arrays for media pipelines.",
        detail: "Automatically push synchronized subtitle captions into video renders or documentation repositories.",
        badge: "Subtitles Ready",
        iconName: "layers",
        bars: [35, 60, 75, 95, 70, 85, 100, 75, 60, 85, 95, 45],
      },
    ],
  },
  {
    id: "music",
    name: "Music & Beat Lab",
    tagline: "Instrumentals, vocal songs & 4-track Demucs stem separation",
    model: "Meta MusicGen • ACE-Step 1.5 • Demucs v4",
    accent: "#8B5CF6",
    accentBg: "bg-purple-50",
    accentBorder: "border-purple-500",
    studioHref: "/music",
    ctaText: "Open Music & Stems Studio",
    interactivePreview: {
      headline: "Composition, Beats & 4-Track Stems Workstation",
      sub: "Generate full-length arrangements, lyrical vocal tracks with ACE-Step 1.5, beats with MusicGen, and isolate stems with Demucs v4.",
      chips: ["Meta MusicGen Melody", "ACE-Step 1.5 Vocal Songs", "Demucs v4 Stems", "AudioGen SFX"],
      telemetry: "Modal NVIDIA A10G • 44.1kHz Hi-Fi Stereo • Polyphonic EnCodec & Demucs v4",
      stats: [
        { label: "Audio Quality", val: "44.1 kHz Hi-Fi" },
        { label: "Stem Tracks", val: "Vocals, Drums, Bass, Other" },
        { label: "Separation SDR", val: "> 9.2 dB Clean" },
        { label: "Export Formats", val: "WAV, MP3 & ZIP Stems" },
      ],
    },
    steps: [
      {
        step: "01",
        title: "Composition Prompt or Audio Upload",
        tag: "Input Guidance",
        desc: "Generate instrumental beats via MusicGen or full lyrical songs with ACE-Step 1.5, or drop existing audio for 4-track Demucs splitting.",
        detail: "Specify musical key, BPM, and mood parameters, or upload commercial WAV/MP3 tracks up to 10 minutes in length.",
        badge: "Beats & Stems",
        iconName: "music",
        bars: [45, 85, 60, 100, 70, 90, 65, 80, 50, 95, 85, 70],
      },
      {
        step: "02",
        title: "Arrangement & Harmonic Synthesis",
        tag: "EnCodec & Demucs v4",
        desc: "Neural transformers arrange melodies and verses, or deep spectrogram networks isolate acoustic transients without phase bleed.",
        detail: "Produces rich harmonic dynamics or decouples vocal lead frequencies from background rhythm sections in ~10 seconds.",
        badge: "CUDA Synthesis",
        iconName: "cpu",
        bars: [50, 65, 90, 70, 100, 85, 60, 95, 80, 55, 90, 75],
      },
      {
        step: "03",
        title: "Interactive Multitrack Stems Mixer",
        tag: "Real-time Console",
        desc: "Solo vocals, mute drums, adjust bass frequencies, and scrub through synchronized waveform playback in real time.",
        detail: "Built-in interactive mixer enables live A/B comparisons between original mixes and individual isolated tracks.",
        badge: "Multitrack Deck",
        iconName: "sliders",
        bars: [65, 90, 50, 95, 75, 60, 100, 85, 70, 90, 80, 50],
      },
      {
        step: "04",
        title: "Download Masters & ZIP Stems",
        tag: "Audio Export",
        desc: "Export radio-ready stereo master WAVs or download discrete 4-track stems bundled into a single ZIP archive.",
        detail: "Feed isolated vocal acapellas straight into the Voice Changer or Voice Studio with zero quality degradation.",
        badge: "Lossless ZIP Master",
        iconName: "layers",
        bars: [40, 70, 85, 95, 70, 90, 100, 80, 65, 85, 95, 55],
      },
    ],
  },
  {
    id: "media",
    name: "Visuals & Video Media",
    tagline: "Cosmic visualizers, cover art & generative video",
    model: "Wan2.1 • SenseNova-U1.5 • Qwen-Image-2.1 • SDXL-Turbo",
    accent: "#F59E0B",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-500",
    studioHref: "/media",
    ctaText: "Open Visuals Studio",
    interactivePreview: {
      headline: "Generative Media & Video Synthesis Deck",
      sub: "Transform audio tracks into synced visualizers, 4K artwork with SenseNova, typography with Qwen-Image-2.1, and cinematic Wan2.1 video.",
      chips: ["Wan2.1 1.3B Video", "SenseNova-U1.5 8B MoT", "Qwen-Image-2.1 DiT", "SDXL-Turbo 1024px"],
      telemetry: "Modal NVIDIA A10G • Diffusers Pipeline • Hardware Accelerated MP4",
      stats: [
        { label: "Visual Formats", val: "1080p / 4K UHD" },
        { label: "Aspect Ratios", val: "16:9, 9:16, 1:1" },
        { label: "Sync", val: "Audio-Reactive FFT" },
        { label: "Output", val: "MP4 Video & PNG" },
      ],
    },
    steps: [
      {
        step: "01",
        title: "Select Audio & Visual Concept",
        tag: "Audio Binding",
        desc: "Link any voiceover or music composition from your studio and select your desired visual engine.",
        detail: "Choose between Wan2.1 generative video, SenseNova photorealism, Qwen-Image typographic flyer art, or SDXL-Turbo rapid covers.",
        badge: "Visual Presets",
        iconName: "film",
        bars: [45, 70, 90, 60, 85, 100, 70, 90, 50, 80, 95, 65],
      },
      {
        step: "02",
        title: "Style & Aspect Ratio Formatting",
        tag: "Canvas Control",
        desc: "Select widescreen (16:9 for YouTube) or vertical (9:16 for Reels/TikTok) with custom color themes and typography.",
        detail: "Real-time shader engine maps bass kick frequencies and vocal pitch contours directly to visual particle motion.",
        badge: "FFT Reactive",
        iconName: "sliders",
        bars: [50, 80, 60, 95, 75, 85, 100, 70, 90, 45, 85, 95],
      },
      {
        step: "03",
        title: "Serverless Video Encoding",
        tag: "Hardware Render",
        desc: "Render audio-synchronized video frames on high-throughput GPU clusters with hardware-accelerated NVENC encoding.",
        detail: "Outputs optimized H.264/MP4 files with crisp audio fidelity ready for instantaneous social distribution.",
        badge: "NVENC 60fps",
        iconName: "cpu",
        bars: [65, 85, 55, 100, 75, 65, 90, 85, 70, 95, 80, 50],
      },
      {
        step: "04",
        title: "Broadcast Delivery & R2 Assets",
        tag: "Complete Media",
        desc: "Download high-definition video files, poster thumbnails, and promotional artwork directly from private R2 storage.",
        detail: "Everything packaged and ready for immediate deployment to streaming platforms, social channels, or client review.",
        badge: "Broadcast Master",
        iconName: "layers",
        bars: [40, 65, 80, 95, 70, 90, 100, 80, 65, 85, 95, 55],
      },
    ],
  },
];

function StepIcon({ name }: { name: WorkflowStep["iconName"] }) {
  switch (name) {
    case "mic":
      return <Mic className="w-5 h-5" />;
    case "music":
      return <Music className="w-5 h-5" />;
    case "disc":
      return <Disc3 className="w-5 h-5" />;
    case "film":
      return <Film className="w-5 h-5" />;
    case "sliders":
      return <Sliders className="w-5 h-5" />;
    case "cpu":
      return <Cpu className="w-5 h-5" />;
    case "layers":
    default:
      return <Layers className="w-5 h-5" />;
  }
}

export function LandingHowItWorks() {
  const [selectedStudioId, setSelectedStudioId] = useState<string>("tts");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const { isSignedIn, isLoaded } = useAuth();
  const { interceptAction, isLiveAuthEnabled } = useShowcase();

  const currentStudio = STUDIOS.find((s) => s.id === selectedStudioId) || STUDIOS[0];
  const activeStep = currentStudio.steps[activeStepIndex] || currentStudio.steps[0];
  const studioHref = isLoaded && isSignedIn ? currentStudio.studioHref : "/sign-up";

  const handleLaunchClick = (e: React.MouseEvent) => {
    if (!isLiveAuthEnabled) {
      e.preventDefault();
      interceptAction();
    }
  };

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 px-4 sm:px-6 bg-[#F8FAFC] border-y border-slate-200/60 overflow-hidden">
      {/* Subtle ambient radiant glow behind the section */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${currentStudio.accent}12 0%, transparent 70%)`
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="section-label inline-flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentStudio.accent }} />
            End-to-End Workflow
          </div>
          <h2 
            className="text-slate-900 tracking-tight leading-[1.12] mb-4 text-gradient-hero"
            style={{ fontSize: "clamp(2rem, 3.8vw, 3rem)", fontWeight: 800 }}
          >
            How Cadence transforms<br className="hidden sm:block" /> ideas into broadcast media
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            From raw script and melodies to studio-grade voice, multi-track music, stem splits, and cinematic visuals. Powered by open foundation models on self-hosted GPU infrastructure.
          </p>
        </div>

        {/* Studio Tabs Switcher */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-10 scrollbar-none px-1">
          {STUDIOS.map((studio) => {
            const isSelected = studio.id === selectedStudioId;
            return (
              <button
                key={studio.id}
                type="button"
                onClick={() => {
                  setSelectedStudioId(studio.id);
                  setActiveStepIndex(0);
                }}
                className={`group flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 border ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.12)] border-slate-300 -translate-y-0.5"
                    : "bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/70"
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: isSelected ? studio.accent : "#94A3B8" }}
                />
                <span>{studio.name}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Studio Preview Banner */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.08)] mb-8 transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2" style={{ backgroundColor: `${currentStudio.accent}15`, color: currentStudio.accent }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentStudio.model}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">
                {currentStudio.interactivePreview.headline}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                {currentStudio.interactivePreview.sub}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentStudio.interactivePreview.chips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Telemetry / Live Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            {currentStudio.interactivePreview.stats.map((stat, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                  {stat.label}
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  {stat.val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Dynamic Step Cards for Selected Studio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {currentStudio.steps.map((s, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`text-left p-6 sm:p-7 rounded-2xl transition-all duration-300 relative flex flex-col justify-between ${
                  isActive
                    ? "bg-white border-2 shadow-[0_16px_36px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(99,102,241,0.2)] -translate-y-1"
                    : "bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]"
                }`}
                style={{
                  borderColor: isActive ? currentStudio.accent : undefined,
                }}
              >
                <div>
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span 
                      className={`text-xs font-mono font-bold tracking-widest px-2.5 py-1 rounded-full ${
                        isActive 
                          ? "text-white shadow-xs" 
                          : "bg-slate-100 text-slate-500"
                      }`}
                      style={{
                        backgroundColor: isActive ? currentStudio.accent : undefined,
                      }}
                    >
                      STEP {s.step}
                    </span>
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: isActive ? `${currentStudio.accent}18` : "#F1F5F9",
                        color: isActive ? currentStudio.accent : "#64748B",
                      }}
                    >
                      <StepIcon name={s.iconName} />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {s.desc}
                  </p>
                </div>

                {/* Bottom Visual Wave Bar Mini Preview */}
                <div className="pt-4 border-t border-slate-100/80 mt-auto">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                    <span>{s.tag}</span>
                    <span 
                      className="font-mono text-[10px] px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${currentStudio.accent}15`,
                        color: currentStudio.accent,
                      }}
                    >
                      {s.badge}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-6">
                    {s.bars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-full transition-all duration-300"
                        style={{
                          height: `${h}%`,
                          backgroundColor: isActive ? currentStudio.accent : "#CBD5E1",
                          opacity: isActive ? 0.35 + (h / 100) * 0.65 : 0.5,
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
            <div 
              className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-3"
              style={{
                backgroundColor: `${currentStudio.accent}15`,
                color: currentStudio.accent,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentStudio.accent }} />
              Active Stage: Step {activeStep.step} - {activeStep.title} ({currentStudio.name})
            </div>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl">
              {activeStep.detail}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={studioHref}
              onClick={handleLaunchClick}
              className="btn-dark-carbon whitespace-nowrap flex-shrink-0 text-center justify-center text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2"
            >
              <span>{currentStudio.ctaText}</span>
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
