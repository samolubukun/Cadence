"use client";

import { useState, useRef, useEffect } from "react";
import {
  Music,
  Mic2,
  Drum,
  Sparkles,
  Wand2,
  Disc3,
  Radio,
  Volume2,
  Clock,
  Play,
  Pause,
  Download,
  Calendar,
  Layers,
  AudioLines,
  UploadCloud,
  FileAudio,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Waves,
  Zap,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type Mode = "beats" | "song" | "stems" | "singing" | "sfx";

interface ModeMetadata {
  icon: React.ElementType;
  label: string;
  badge: string;
  badgeColor: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  primaryColor: string;
  creditCost: number;
  description: string;
  promptPlaceholder: string;
  defaultPrompt: string;
  minDuration: number;
  maxDuration: number;
  defaultDuration: number;
  step: number;
}

const MODE_CONFIG: Record<Mode, ModeMetadata> = {
  beats: {
    icon: Drum,
    label: "Beats & Instrumentals",
    badge: "MusicGen · Instrumental",
    badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    accentBg: "bg-violet-50 dark:bg-violet-950/30",
    accentText: "text-violet-600 dark:text-violet-400",
    accentBorder: "border-violet-200 dark:border-violet-900/50",
    primaryColor: "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20",
    creditCost: 50,
    description: "Generate pure instrumental beats, loops, and cinematic soundscapes.",
    promptPlaceholder: "e.g. Trap beat 140 BPM dark orchestral strings, lo-fi hip hop with vinyl crackle, chill synthwave groove...",
    defaultPrompt: "Dark trap beat 140 BPM with orchestral strings and 808 bass",
    minDuration: 10,
    maxDuration: 120,
    defaultDuration: 30,
    step: 5,
  },
  song: {
    icon: Mic2,
    label: "Full Song with Vocals",
    badge: "ACE-Step 1.5 Turbo · Vocals",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/30",
    accentText: "text-indigo-600 dark:text-indigo-400",
    accentBorder: "border-indigo-200 dark:border-indigo-900/50",
    primaryColor: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20",
    creditCost: 150,
    description: "Compose multi-track songs with lead singing, harmonies, and rich instrumentation.",
    promptPlaceholder: "e.g. Upbeat pop-punk with catchy hooks, dreamy R&B with lush chords, indie folk with acoustic guitar...",
    defaultPrompt: "Synthwave retro 80s upbeat electronic pop with catchy bassline and dreamy synths",
    minDuration: 10,
    maxDuration: 240,
    defaultDuration: 60,
    step: 10,
  },
  stems: {
    icon: Layers,
    label: "Stem Separator",
    badge: "Demucs v4 · 4-Track Split",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    accentBg: "bg-cyan-50 dark:bg-cyan-950/30",
    accentText: "text-cyan-600 dark:text-cyan-400",
    accentBorder: "border-cyan-200 dark:border-cyan-900/50",
    primaryColor: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20",
    creditCost: 30,
    description: "Decompose any audio mix into 4 isolated stereo stems: Vocals, Drums, Bass, and Other.",
    promptPlaceholder: "Upload an audio file to deconstruct into isolated stems...",
    defaultPrompt: "4-Track Neural Stem Separation",
    minDuration: 1,
    maxDuration: 300,
    defaultDuration: 180,
    step: 1,
  },
  singing: {
    icon: AudioLines,
    label: "AI Singing Cover",
    badge: "RVC v2 · Pitch Transpose",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    accentBg: "bg-rose-50 dark:bg-rose-950/30",
    accentText: "text-rose-600 dark:text-rose-400",
    accentBorder: "border-rose-200 dark:border-rose-900/50",
    primaryColor: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20",
    creditCost: 50,
    description: "Re-sing any vocal track in a new studio timbre while preserving pitch dynamics and vibrato.",
    promptPlaceholder: "Enter title or description for your AI singing cover...",
    defaultPrompt: "AI Singing Cover in studio vocal key",
    minDuration: 1,
    maxDuration: 240,
    defaultDuration: 60,
    step: 1,
  },
  sfx: {
    icon: Sparkles,
    label: "Sound Effects & Foley",
    badge: "AudioGen · Foley FX",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    accentBg: "bg-amber-50 dark:bg-amber-950/30",
    accentText: "text-amber-600 dark:text-amber-400",
    accentBorder: "border-amber-200 dark:border-amber-900/50",
    primaryColor: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20",
    creditCost: 25,
    description: "Synthesize photorealistic sound effects, ambient atmospheres, and Foley textures.",
    promptPlaceholder: "e.g. Laser blast in empty corridor, footsteps in wet gravel with distant rolling thunder, coffee brewing in cozy diner...",
    defaultPrompt: "Footsteps in wet gravel with distant rolling thunder",
    minDuration: 1,
    maxDuration: 30,
    defaultDuration: 5,
    step: 1,
  },
};

const GENRE_PRESETS: Record<Mode, Array<{ label: string; prompt: string; duration: number }>> = {
  beats: [
    { label: "Trap 140 BPM", prompt: "Dark hard-hitting trap beat 140 BPM with rolling 808s and eerie piano", duration: 30 },
    { label: "Lo-Fi Chill", prompt: "Cozy lo-fi hip hop beat with warm vinyl crackle, gentle jazz Rhodes and soft boom-bap drums", duration: 30 },
    { label: "Synthwave 80s", prompt: "Retro 80s synthwave instrumental with pulsing analog bassline, gating snares, and nostalgic synth leads", duration: 45 },
    { label: "Smooth Jazz", prompt: "Uptown late night jazz lounge groove with upright double bass, brushed drums, and mellow saxophone", duration: 30 },
    { label: "Cinematic Strings", prompt: "Epic cinematic orchestral crescendo with marching taiko drums and soaring brass horns", duration: 45 },
  ],
  song: [
    { label: "80s Pop Anthem", prompt: "Upbeat retro 80s electronic pop anthem with euphoric chorus hooks and punchy synths", duration: 60 },
    { label: "Indie Folk", prompt: "Intimate indie acoustic ballad with fingerpicked guitar, warm vocal harmonies, and gentle tambourine", duration: 60 },
    { label: "Midnight R&B", prompt: "Sensual contemporary slow R&B with smooth Rhodes piano, deep sub-bass, and soulful vocals", duration: 60 },
    { label: "Cyberpunk Rock", prompt: "High-octane industrial electronic rock with distorted guitar riffs and driving synth arpeggios", duration: 60 },
  ],
  stems: [
    { label: "Extract Vocals Only", prompt: "Isolate clean dry acapella stem from song", duration: 60 },
    { label: "Karaoke Instrumental", prompt: "Remove singing vocals and export instrument backing track", duration: 60 },
    { label: "Rhythm Section", prompt: "Extract isolated drums and bass groove", duration: 60 },
  ],
  singing: [
    { label: "Standard Key (0st)", prompt: "Sing in original key pitch", duration: 60 },
    { label: "Female to Male (-12st)", prompt: "Transpose down 1 octave for deep baritone timbre", duration: 60 },
    { label: "Male to Female (+12st)", prompt: "Transpose up 1 octave for bright soprano vocal", duration: 60 },
  ],
  sfx: [
    { label: "Thunderstorm", prompt: "Gentle rain tapping against glass window with rolling distant thunder rumblings", duration: 10 },
    { label: "Sci-Fi Laser", prompt: "Futuristic plasma blaster firing inside an echoey metal subterranean corridor", duration: 3 },
    { label: "Coffee Shop", prompt: "Warm ambiance of a busy cafe with espresso steam hissing and soft ceramic mug clinks", duration: 15 },
    { label: "Sword Clashes", prompt: "Sharp metallic sword blade clash with bright spark ringing resonance", duration: 4 },
  ],
};

export default function MusicStudioPage() {
  const trpc = useTRPC();
  const [mode, setMode] = useState<Mode>("beats");
  const [prompt, setPrompt] = useState<string>(MODE_CONFIG.beats.defaultPrompt);
  const [lyrics, setLyrics] = useState<string>(
    "[Verse]\nNeon lights in the city night\nChasing dreams in the electric sky\n\n[Chorus]\nWe run until the morning glow\nLet the cadence steal the show"
  );
  const [duration, setDuration] = useState<number>(MODE_CONFIG.beats.defaultDuration);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [activeItemTitle, setActiveItemTitle] = useState<string | null>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cfg = MODE_CONFIG[mode];
  const IconComp = cfg.icon;
  const isBeats = mode === "beats";
  const isSong = mode === "song";
  const isStems = mode === "stems";
  const isSinging = mode === "singing";
  const isSfx = mode === "sfx";

  // Additional State for Stems & AI Singing Covers
  const [pitchShift, setPitchShift] = useState<number>(0);
  const [targetVoice, setTargetVoice] = useState<string>("Julian (British RP)");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [voiceRefFile, setVoiceRefFile] = useState<File | null>(null);
  const [voiceMode, setVoiceMode] = useState<"preset" | "cloned" | "upload">("preset");
  const [separatedStems, setSeparatedStems] = useState<{
    vocalsUrl: string | null;
    drumsUrl: string | null;
    bassUrl: string | null;
    otherUrl: string | null;
  } | null>(null);

  // Queries for past creations & user voices
  const { data: voicesData } = useQuery(trpc.voices.getAll.queryOptions());
  const { data: songsList, refetch: refetchSongs } = useQuery(trpc.studio.listSongs.queryOptions());
  const { data: sfxList, refetch: refetchSfx } = useQuery(trpc.studio.listSoundEffects.queryOptions());
  const { data: stemsList, refetch: refetchStems } = useQuery(trpc.studio.listStems.queryOptions());
  const { data: singingList, refetch: refetchSinging } = useQuery(trpc.studio.listSingingCovers.queryOptions());

  const beatsMutation = useMutation(trpc.studio.generateBeats.mutationOptions());
  const songMutation = useMutation(trpc.studio.generateSong.mutationOptions());
  const soundMutation = useMutation(trpc.studio.generateSound.mutationOptions());
  const stemsMutation = useMutation(trpc.studio.separateStems.mutationOptions());
  const singingMutation = useMutation(trpc.studio.createSingingCover.mutationOptions());

  // Audio time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setPrompt(MODE_CONFIG[next].defaultPrompt);
    setDuration(MODE_CONFIG[next].defaultDuration);
    setAudioUrl(null);
    setActiveItemTitle(null);
    setSeparatedStems(null);
    setIsPlaying(false);
  };

  const handleGenerate = async () => {
    if (isStems) {
      setIsGenerating(true);
      try {
        toast.info("Separating audio into 4 stems via Meta Demucs v4 (Modal GPU)...");
        const res = await stemsMutation.mutateAsync({
          fileName: selectedFile ? selectedFile.name : "demo_track.mp3",
          base64Audio: "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
        });
        setSeparatedStems(res);
        setActiveItemTitle(selectedFile ? selectedFile.name : "4-Track Stems");
        refetchStems();
        toast.success("Stems separated successfully!");
      } catch (err: any) {
        toast.error(err?.message || "Stem separation failed");
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    if (isSinging) {
      setIsGenerating(true);
      try {
        toast.info("Rendering AI singing voice cover via RVC v2 (Modal GPU)...");

        let base64Audio = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
        if (selectedFile) {
          const buffer = await selectedFile.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          base64Audio = btoa(binary);
        }

        let targetBase64Audio: string | undefined = undefined;
        if (voiceMode === "upload" && voiceRefFile) {
          const buffer = await voiceRefFile.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          targetBase64Audio = btoa(binary);
        }

        const res = await singingMutation.mutateAsync({
          title: prompt,
          targetVoiceKey: targetVoice,
          targetBase64Audio,
          pitchShift,
          base64Audio,
          remixInstrumental: true,
        });
        if (res.url) {
          setAudioUrl(res.url);
          setActiveItemTitle(prompt);
          setIsPlaying(true);
        }
        refetchSinging();
        toast.success("AI Singing Cover generated!");
      } catch (err: any) {
        toast.error(err?.message || "Singing cover failed");
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setIsGenerating(true);
    setAudioUrl(null);
    try {
      if (isBeats) {
        toast.info("Composing instrumental on Modal GPU via MusicGen...");
        const res = await beatsMutation.mutateAsync({ prompt, duration });
        if (res.url) {
          setAudioUrl(res.url);
          setActiveItemTitle(prompt);
          setIsPlaying(true);
        }
        refetchSongs();
        toast.success("Beats generated!");
      } else if (isSong) {
        toast.info("Generating full song on Modal GPU via ACE-Step 1.5...");
        const res = await songMutation.mutateAsync({ prompt, lyrics, duration });
        if (res.url) {
          setAudioUrl(res.url);
          setActiveItemTitle(prompt);
          setIsPlaying(true);
        }
        refetchSongs();
        toast.success("Song generated!");
      } else {
        toast.info("Synthesizing Foley sound effect via AudioGen...");
        const res = await soundMutation.mutateAsync({ prompt, duration });
        if (res.url) {
          setAudioUrl(res.url);
          setActiveItemTitle(prompt);
          setIsPlaying(true);
        }
        refetchSfx();
        toast.success("Sound effect generated!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter history relevant to current mode
  const currentHistory = isSfx
    ? (sfxList ?? []).map((s) => ({
        id: s._id,
        title: s.prompt,
        duration: s.duration,
        url: s.url,
        createdAt: s._creationTime,
        tag: "SFX",
      }))
    : isStems
    ? (stemsList ?? []).map((st) => ({
        id: st._id,
        title: st.sourceFileName,
        duration: 180,
        url: st.vocalsUrl || st.drumsUrl,
        createdAt: st._creationTime,
        tag: "Stems",
      }))
    : isSinging
    ? (singingList ?? []).map((sc) => ({
        id: sc._id,
        title: sc.title,
        duration: 60,
        url: sc.url,
        createdAt: sc._creationTime,
        tag: "Cover",
      }))
    : isBeats
    ? (songsList ?? [])
        .filter((s) => s.title.startsWith("[Beat]"))
        .map((s) => ({
          id: s._id,
          title: s.prompt,
          duration: s.duration,
          url: s.url,
          createdAt: s._creationTime,
          tag: "Beat",
        }))
    : (songsList ?? [])
        .filter((s) => !s.title.startsWith("[Beat]"))
        .map((s) => ({
          id: s._id,
          title: s.title || s.prompt,
          duration: s.duration,
          url: s.url,
          createdAt: s._creationTime,
          tag: "Song",
        }));

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-background">
      <PageHeader title="Music & Sound Studio" />

      {/* Hidden native audio tag for custom waveform player */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          autoPlay
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header Banner */}
          <div className="border-b border-border/80 pb-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className={cn("size-9 rounded-xl flex items-center justify-center border shadow-xs shrink-0", cfg.accentBg, cfg.accentBorder)}>
                <IconComp className={cn("size-5", cfg.accentText)} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Music &amp; Sound Studio
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {cfg.description}
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="overflow-x-auto pb-1 -mb-1">
            <div className="inline-flex p-1.5 rounded-2xl bg-muted/60 border border-border/80 gap-1.5">
              {(
                [
                  { key: "beats", label: "Beats & Instrumentals", icon: Drum, activeClass: "bg-violet-600 text-white shadow-xs" },
                  { key: "song", label: "Full Song", icon: Mic2, activeClass: "bg-indigo-600 text-white shadow-xs" },
                  { key: "stems", label: "Stem Separator", icon: Layers, activeClass: "bg-cyan-600 text-white shadow-xs" },
                  { key: "singing", label: "AI Singing Cover", icon: AudioLines, activeClass: "bg-rose-600 text-white shadow-xs" },
                  { key: "sfx", label: "Sound Effects", icon: Sparkles, activeClass: "bg-amber-600 text-white shadow-xs" },
                ] as const
              ).map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = mode === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => switchMode(tab.key)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer",
                      isSelected
                        ? tab.activeClass
                        : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                    )}
                  >
                    <TabIcon className="size-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Studio 2-Column Workstation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Synthesis & Generation Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-border bg-card shadow-xs rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-muted/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                      <Wand2 className={cn("size-4", cfg.accentText)} />
                      {isBeats
                        ? "Instrumental Composition"
                        : isSong
                        ? "Song Composition & Arrangement"
                        : isStems
                        ? "Audio Deconstruction"
                        : isSinging
                        ? "Voice Transposition & Morphing"
                        : "Foley & Ambient Synthesis"}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Step-by-step
                    </span>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Configure your creative parameters, seed inspiration, and audio arrangement.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 space-y-5">
                  {/* Prompt or Title Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {isSinging ? "Cover Project Title" : isStems ? "Project Reference Name" : "Prompt & Style Description"}
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {isStems || isSinging ? "Identifier" : "Natural language guidance"}
                      </span>
                    </div>

                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={cfg.promptPlaceholder}
                      className="bg-background h-11 text-sm rounded-xl border-border/80 focus-visible:ring-1"
                    />

                    {/* Quick Presets Carousel / Chips */}
                    {GENRE_PRESETS[mode]?.length > 0 && (
                      <div className="pt-1.5">
                        <div className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Sparkles className="size-3" /> Quick Presets &amp; Inspirations:
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {GENRE_PRESETS[mode]?.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setPrompt(preset.prompt);
                                setDuration(preset.duration);
                              }}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-border/70 bg-muted/20 hover:bg-muted/60 hover:border-foreground/30 text-foreground transition-all cursor-pointer active:scale-95"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mode-Specific Panel 1: Full Song Lyrics */}
                  {isSong && (
                    <div className="space-y-2 pt-1 border-t border-border/60">
                      <div className="flex items-center justify-between pt-2">
                        <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <Mic2 className="size-4 text-indigo-500" />
                          Lyrics &amp; Song Structure
                        </label>
                        <span className="text-[11px] text-muted-foreground">
                          Use tags like [Verse], [Chorus], [Bridge]
                        </span>
                      </div>
                      <Textarea
                        value={lyrics}
                        onChange={(e) => setLyrics(e.target.value)}
                        rows={6}
                        placeholder="[Verse]\nEnter lyrics here...\n\n[Chorus]\nSing your chorus..."
                        className="font-mono text-xs bg-background rounded-xl resize-y leading-relaxed"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Leave blank if you prefer a purely melodic instrumental track without synthesized singing.
                      </p>
                    </div>
                  )}

                  {/* Mode-Specific Panel 2: Stem Separator File Dropzone */}
                  {isStems && (
                    <div className="space-y-3 pt-1 border-t border-border/60">
                      <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 pt-2">
                        <UploadCloud className="size-4 text-cyan-500" />
                        Audio File to Deconstruct
                      </label>
                      <div className="border-2 border-dashed border-border/80 hover:border-cyan-500/50 rounded-2xl p-6 text-center bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                          }}
                          className="hidden"
                          id="stem-audio-upload"
                        />
                        <label htmlFor="stem-audio-upload" className="cursor-pointer space-y-2 flex flex-col items-center">
                          <div className="size-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                            <Layers className="size-6" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground block">
                              {selectedFile ? selectedFile.name : "Choose audio file or drag & drop"}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5 block">
                              WAV, MP3, FLAC, M4A up to 50MB
                            </span>
                          </div>
                          {selectedFile && (
                            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 text-xs">
                              File Ready: {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                            </Badge>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Mode-Specific Panel 3: AI Singing Cover Controls */}
                  {isSinging && (
                    <div className="space-y-4 pt-1 border-t border-border/60">
                      {/* Step A: Source Vocal Track */}
                      <div className="space-y-2 pt-2">
                        <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <Music className="size-4 text-rose-500" />
                          Step 1: Original Song / Vocal Track
                        </label>
                        <div className="border-2 border-dashed border-border/80 hover:border-rose-500/50 rounded-2xl p-4 text-center bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                            }}
                            className="hidden"
                            id="singing-song-upload"
                          />
                          <label htmlFor="singing-song-upload" className="cursor-pointer flex items-center justify-center gap-3">
                            <AudioLines className="size-5 text-rose-500 shrink-0" />
                            <div className="text-left">
                              <span className="text-xs sm:text-sm font-semibold text-foreground block">
                                {selectedFile ? selectedFile.name : "Select vocal track or full song"}
                              </span>
                              <span className="text-[11px] text-muted-foreground block">
                                Cadence isolates the vocal melody automatically
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Step B: Target Persona */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <Mic2 className="size-4 text-rose-500" />
                            Step 2: Target Vocal Persona
                          </label>
                          <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs">
                            <button
                              type="button"
                              onClick={() => setVoiceMode("preset")}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer",
                                voiceMode === "preset" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"
                              )}
                            >
                              Studio Presets
                            </button>
                            <button
                              type="button"
                              onClick={() => setVoiceMode("cloned")}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer",
                                voiceMode === "cloned" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"
                              )}
                            >
                              My Clones
                            </button>
                            <button
                              type="button"
                              onClick={() => setVoiceMode("upload")}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer",
                                voiceMode === "upload" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"
                              )}
                            >
                              Upload Sample
                            </button>
                          </div>
                        </div>

                        {voiceMode === "preset" && (
                          <select
                            value={targetVoice}
                            onChange={(e) => setTargetVoice(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl h-11 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="Julian (British RP)">Julian (British RP) • Deep Warm Baritone</option>
                            <option value="Sienna (Conversational American)">Sienna (Conversational American) • Expressive Soprano</option>
                            <option value="Arthur (Deep Narrative)">Arthur (Deep Narrative) • Resonant Bass</option>
                            <option value="Marcus (Modern Urban)">Marcus (Modern Urban) • Punchy Tenor</option>
                          </select>
                        )}

                        {voiceMode === "cloned" && (
                          <select
                            value={targetVoice}
                            onChange={(e) => setTargetVoice(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl h-11 px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {voicesData?.custom && voicesData.custom.length > 0 ? (
                              voicesData.custom.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name} {v.description ? `• ${v.description}` : "• Cloned Persona"}
                                </option>
                              ))
                            ) : (
                              <option value="">No custom cloned voices found yet</option>
                            )}
                          </select>
                        )}

                        {voiceMode === "upload" && (
                          <div className="border border-border/80 rounded-xl p-3 bg-muted/15 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <UploadCloud className="size-4 text-rose-500 shrink-0" />
                              <span className="text-xs truncate font-medium text-foreground">
                                {voiceRefFile ? voiceRefFile.name : "Upload a 10s voice clip of target singer"}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) setVoiceRefFile(e.target.files[0]);
                              }}
                              className="hidden"
                              id="target-voice-file-upload"
                            />
                            <label
                              htmlFor="target-voice-file-upload"
                              className="shrink-0 px-3 py-1.5 bg-background border border-border/80 hover:bg-muted text-foreground text-xs rounded-lg cursor-pointer transition font-medium"
                            >
                              Browse
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Step C: Key Pitch Transpose */}
                      <div className="space-y-2 rounded-xl p-3.5 bg-muted/20 border border-border/60">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-foreground">
                            Pitch Transposition: {pitchShift >= 0 ? `+${pitchShift}` : pitchShift} semitones
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {pitchShift === 0 ? "Original Key" : pitchShift > 0 ? "Shift Up (Female/Bright)" : "Shift Down (Male/Deep)"}
                          </span>
                        </div>
                        <Slider
                          value={[pitchShift]}
                          min={-12}
                          max={12}
                          step={1}
                          onValueChange={([val]) => setPitchShift(val)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Duration Slider (For Generative Modes) */}
                  {!isStems && !isSinging && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground" /> Duration
                        </span>
                        <span className="font-mono font-semibold text-primary">{duration} seconds</span>
                      </div>
                      <Slider
                        value={[duration]}
                        min={cfg.minDuration}
                        max={cfg.maxDuration}
                        step={cfg.step}
                        onValueChange={([val]) => setDuration(val)}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                        <span>{cfg.minDuration}s</span>
                        <span>{cfg.maxDuration}s max</span>
                      </div>
                    </div>
                  )}

                  {/* Primary Generation Action Button */}
                  <div className="pt-2">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className={cn("w-full h-12 text-sm sm:text-base font-bold rounded-xl transition-all shadow-md cursor-pointer", cfg.primaryColor)}
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <Disc3 className="size-5 animate-spin" />
                          <span>
                            {isBeats
                              ? "Synthesizing Beats (MusicGen)..."
                              : isSong
                              ? "Arranging Song (ACE-Step)..."
                              : isStems
                              ? "Decomposing Stems (Demucs)..."
                              : isSinging
                              ? "Transposing Vocal Cover..."
                              : "Synthesizing Foley FX..."}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <IconComp className="size-5" />
                          <span>
                            {isBeats
                              ? "Generate Beats & Instrumental"
                              : isSong
                              ? "Generate Full Song with Vocals"
                              : isStems
                              ? "Separate 4-Track Stems"
                              : isSinging
                              ? "Generate AI Singing Cover"
                              : "Synthesize Sound Effect"}
                          </span>
                          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/20 text-white">
                            {cfg.creditCost} credits
                          </span>
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Active Playback Deck & Stems Multitrack Mixer (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border bg-card shadow-xs rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-muted/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                      <Waves className={cn("size-4", cfg.accentText)} />
                      {isStems ? "Stems Multitrack Deck" : "Studio Audio Deck"}
                    </CardTitle>
                    {audioUrl && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                        Live Output
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    High-fidelity stereo preview, waveform scrubbing, and direct stems export.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 space-y-6">
                  {/* Stems 4-Channel Mixer UI */}
                  {isStems && separatedStems ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-bold text-foreground">Isolated Stems</span>
                        <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full">
                          4 Isolated Tracks
                        </span>
                      </div>

                      <div className="space-y-3">
                        {[
                          { label: "Vocals (Dry Acapella)", url: separatedStems.vocalsUrl, color: "text-cyan-500" },
                          { label: "Drums & Percussion", url: separatedStems.drumsUrl, color: "text-amber-500" },
                          { label: "Bass & Sub-Bass", url: separatedStems.bassUrl, color: "text-indigo-500" },
                          { label: "Other & Synths", url: separatedStems.otherUrl, color: "text-emerald-500" },
                        ].map((stem) => (
                          <div key={stem.label} className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className={cn("font-bold", stem.color)}>{stem.label}</span>
                              {stem.url && (
                                <a
                                  href={stem.url}
                                  download
                                  className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition"
                                  title="Download stem"
                                >
                                  <Download className="size-3.5" />
                                </a>
                              )}
                            </div>
                            {stem.url ? (
                              <audio src={stem.url} controls className="w-full h-8" />
                            ) : (
                              <div className="text-[11px] text-muted-foreground italic py-1">
                                Processing track channel...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Waveform & Interactive Audio Deck */
                    <div className="space-y-6">
                      {/* Visual Disc / Waveform Placeholder */}
                      <div className="rounded-2xl border border-border/80 bg-muted/20 p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                        <div
                          className={cn(
                            "size-20 rounded-full border flex items-center justify-center shadow-inner transition-transform duration-300",
                            cfg.accentBg,
                            cfg.accentBorder,
                            isPlaying ? "scale-105" : "scale-100"
                          )}
                        >
                          {isBeats ? (
                            <Radio className={cn("size-8", cfg.accentText, isGenerating ? "animate-pulse" : "")} />
                          ) : isSong ? (
                            <Disc3 className={cn("size-8", cfg.accentText, isPlaying ? "animate-spin" : "")} />
                          ) : isStems ? (
                            <Layers className={cn("size-8", cfg.accentText, isGenerating ? "animate-pulse" : "")} />
                          ) : isSinging ? (
                            <AudioLines className={cn("size-8", cfg.accentText, isGenerating ? "animate-pulse" : "")} />
                          ) : (
                            <Volume2 className={cn("size-8", cfg.accentText, isGenerating ? "animate-pulse" : "")} />
                          )}
                        </div>

                        <div className="space-y-1 max-w-xs">
                          <h3 className="font-bold text-sm text-foreground truncate">
                            {activeItemTitle || `${cfg.label} Preview`}
                          </h3>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {audioUrl
                              ? "Lossless master stream ready for studio playback & export."
                              : isGenerating
                              ? "Model engine running on dedicated GPU infrastructure..."
                              : "Generate a track or select from history below to load deck."}
                          </p>
                        </div>
                      </div>

                      {/* Custom Audio Scrubbing Deck Controls */}
                      {audioUrl ? (
                        <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/15 p-4">
                          {/* Scrub bar */}
                          <div className="space-y-1.5">
                            <Slider
                              value={[currentTime]}
                              min={0}
                              max={audioDuration || 100}
                              step={0.1}
                              onValueChange={([val]) => handleSeek(val)}
                              className="cursor-pointer"
                            />
                            <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                              <span>{formatSeconds(currentTime)}</span>
                              <span>{formatSeconds(audioDuration)}</span>
                            </div>
                          </div>

                          {/* Deck Action buttons */}
                          <div className="flex items-center justify-between pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={togglePlay}
                              className="h-10 px-4 rounded-xl gap-2 font-semibold shadow-2xs"
                            >
                              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                              <span>{isPlaying ? "Pause" : "Play Deck"}</span>
                            </Button>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-10 px-3 rounded-xl gap-1.5 text-xs font-semibold"
                              >
                                <a href={audioUrl} download target="_blank" rel="noreferrer">
                                  <Download className="size-4" />
                                  <span>Export Master</span>
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                          {isGenerating ? "Synthesizing stream..." : "Audio deck will activate immediately upon completion."}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Past Creations Section for Current Mode */}
          <div className="space-y-4 pt-4 border-t border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Clock className={cn("size-5", cfg.accentText)} />
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Past {cfg.label} Generations
                </h2>
              </div>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-full w-fit">
                {currentHistory.length} saved in cloud
              </span>
            </div>

            {currentHistory.length === 0 ? (
              <Card className="border-dashed border-border/80 rounded-2xl">
                <CardContent className="py-12 text-center space-y-2">
                  <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center">
                    <Music className="size-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No previous {cfg.label.toLowerCase()} found</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Click "Generate" above to compose your first track on self-hosted GPU infrastructure.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentHistory.map((item) => (
                  <Card
                    key={item.id}
                    className="border-border/80 bg-card hover:border-foreground/20 transition-all rounded-2xl shadow-2xs group flex flex-col justify-between"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", cfg.badgeColor)}>
                          {item.tag}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          <Calendar className="size-3" />
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed">
                        {item.title}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {item.duration}s
                        </span>
                        {item.url && (
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                              onClick={() => {
                                setAudioUrl(item.url);
                                setActiveItemTitle(item.title);
                                setIsPlaying(true);
                              }}
                            >
                              <Play className="size-3" /> Load Deck
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 w-8 p-0"
                            >
                              <a href={item.url} download target="_blank" rel="noreferrer" title="Download">
                                <Download className="size-3.5" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
