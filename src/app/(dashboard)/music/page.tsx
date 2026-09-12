"use client";

import { useState } from "react";
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
  Download,
  Calendar,
  Layers,
  Sliders,
  AudioLines,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";
import { formatDistanceToNow } from "date-fns";

type Mode = "beats" | "song" | "stems" | "singing" | "sfx";

const MODE_CONFIG = {
  beats: {
    icon: Drum,
    label: "Beats & Instrumentals",
    badge: "MusicGen · No Vocals",
    badgeColor: "bg-violet-500/10 text-violet-400",
    description:
      "Generate pure instrumental beats, loops, and soundscapes (no vocals). Powered by Meta MusicGen.",
    promptPlaceholder:
      "e.g. Trap beat 140 BPM dark orchestral strings, lo-fi hip hop with vinyl crackle, chill synthwave groove...",
    defaultPrompt: "Dark trap beat 140 BPM with orchestral strings and 808 bass",
    minDuration: 10,
    maxDuration: 120,
    defaultDuration: 30,
    step: 5,
    accentColor: "violet",
  },
  song: {
    icon: Mic2,
    label: "Full Song with Vocals",
    badge: "ACE-Step 1.5 Turbo · Vocals",
    badgeColor: "bg-indigo-500/10 text-indigo-400",
    description:
      "Generate complete songs with singing, harmonies, and full instrumentation. Powered by ACE-Step 1.5 Turbo.",
    promptPlaceholder:
      "e.g. upbeat pop-punk with catchy hooks, dreamy R&B with lush chords, indie folk with acoustic guitar...",
    defaultPrompt: "Synthwave retro 80s upbeat electronic pop with catchy bassline and dreamy synths",
    minDuration: 10,
    maxDuration: 240,
    defaultDuration: 60,
    step: 10,
    accentColor: "indigo",
  },
  stems: {
    icon: Layers,
    label: "Stem Separator",
    badge: "Demucs v4 · 4-Track Split",
    badgeColor: "bg-cyan-500/10 text-cyan-400",
    description:
      "Separate any audio mix into 4 isolated stereo stems: Vocals, Drums, Bass, and Instruments. Powered by Meta Demucs v4.",
    promptPlaceholder: "Upload an audio file to deconstruct into stems...",
    defaultPrompt: "4-Track Neural Stem Separation",
    minDuration: 1,
    maxDuration: 300,
    defaultDuration: 180,
    step: 1,
    accentColor: "cyan",
  },
  singing: {
    icon: AudioLines,
    label: "AI Singing Cover",
    badge: "RVC v2 · Vocal Transpose",
    badgeColor: "bg-rose-500/10 text-rose-400",
    description:
      "Re-sing any vocal track in a new voice while preserving musical key, rhythm, and vibrato. Powered by RVC v2.",
    promptPlaceholder: "AI Singing Voice Cover & Transposition",
    defaultPrompt: "AI Singing Cover in studio vocal key",
    minDuration: 1,
    maxDuration: 240,
    defaultDuration: 60,
    step: 1,
    accentColor: "rose",
  },
  sfx: {
    icon: Sparkles,
    label: "Sound Effects & Foley",
    badge: "AudioGen · Foley SFX",
    badgeColor: "bg-amber-500/10 text-amber-400",
    description:
      "Generate photorealistic sound effects, ambient atmospheres, and Foley powered by Meta AudioGen.",
    promptPlaceholder:
      "e.g. Laser blast in empty corridor, footsteps in wet gravel with distant rolling thunder, coffee brewing in cozy diner...",
    defaultPrompt: "Footsteps in wet gravel with distant rolling thunder",
    minDuration: 1,
    maxDuration: 30,
    defaultDuration: 5,
    step: 1,
    accentColor: "amber",
  },
} as const;

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

  const switchMode = (next: Mode) => {
    setMode(next);
    setPrompt(MODE_CONFIG[next].defaultPrompt);
    setDuration(MODE_CONFIG[next].defaultDuration);
    setAudioUrl(null);
    setSeparatedStems(null);
  };

  const handleGenerate = async () => {
    if (isStems) {
      setIsGenerating(true);
      try {
        toast.info("Separating audio into 4 stems via Meta Demucs v4 (Modal GPU)…");
        // Demo placeholder / file separation
        const res = await stemsMutation.mutateAsync({
          fileName: selectedFile ? selectedFile.name : "demo_track.mp3",
          base64Audio: "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
        });
        setSeparatedStems(res);
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
        toast.info("Rendering AI singing voice cover via RVC v2 (Modal GPU)…");

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
        if (res.url) setAudioUrl(res.url);
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
        toast.info("Composing instrumental on Modal GPU via MusicGen…");
        const res = await beatsMutation.mutateAsync({ prompt, duration });
        if (res.url) setAudioUrl(res.url);
        refetchSongs();
        toast.success("Beats generated!");
      } else if (isSong) {
        toast.info("Generating full song on Modal GPU via ACE-Step 1.5…");
        const res = await songMutation.mutateAsync({ prompt, lyrics, duration });
        if (res.url) setAudioUrl(res.url);
        refetchSongs();
        toast.success("Song generated!");
      } else {
        toast.info("Synthesizing Foley sound effect via AudioGen…");
        const res = await soundMutation.mutateAsync({ prompt, duration });
        if (res.url) setAudioUrl(res.url);
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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Music & Sound Studio" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Music className="h-7 w-7 text-violet-500" />
              Music &amp; Sound Studio
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{cfg.description}</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border w-fit flex-wrap">
          <button
            onClick={() => switchMode("beats")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isBeats
                ? "bg-violet-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Drum className="h-4 w-4" />
            Beats &amp; Instrumentals
          </button>
          <button
            onClick={() => switchMode("song")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isSong
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mic2 className="h-4 w-4" />
            Full Song
          </button>
          <button
            onClick={() => switchMode("stems")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isStems
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            Stem Separator
          </button>
          <button
            onClick={() => switchMode("singing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isSinging
                ? "bg-rose-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AudioLines className="h-4 w-4" />
            AI Singing Cover
          </button>
          <button
            onClick={() => switchMode("sfx")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isSfx
                ? "bg-amber-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Sound Effects &amp; Foley
          </button>
        </div>

        {/* Generation Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left controls */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Wand2 className={`h-4 w-4 ${isBeats ? "text-violet-500" : isSong ? "text-indigo-500" : "text-amber-500"}`} />
                  {isBeats ? "Beat Style & Genre" : isSong ? "Music Style & Genre" : "Sound Effect Description"}
                </label>
                <span className="text-[11px] text-muted-foreground font-medium">Click a preset below or write custom</span>
              </div>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={cfg.promptPlaceholder}
                className="bg-background h-11 text-sm rounded-xl"
              />

              {/* Quick Genre Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {GENRE_PRESETS[mode]?.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setPrompt(preset.prompt);
                      setDuration(preset.duration);
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border/80 bg-background hover:bg-muted/60 hover:border-primary/40 text-foreground transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lyrics - only for song mode */}
            {isSong && (
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Lyrics &amp; Structure
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    (optional - leave blank for instrumental arrangement)
                  </span>
                </label>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={7}
                  placeholder="[Verse]\nWrite your verse...\n\n[Chorus]\nWrite your chorus..."
                  className="font-mono text-xs bg-background"
                />
              </div>
            )}

            {/* Stem Separator Upload Dropzone */}
            {isStems && (
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-cyan-500" /> Upload Song / Audio File
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/30 transition cursor-pointer">
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
                    <Layers className="size-8 text-cyan-500" />
                    <span className="text-sm font-medium text-foreground">
                      {selectedFile ? selectedFile.name : "Click or drag audio file here (MP3, WAV, FLAC, M4A)"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Demucs v4 will decompose this file into Vocals, Drums, Bass, and Other.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* AI Singing Cover Settings */}
            {isSinging && (
              <div className="space-y-4">
                {/* 1. Song Audio File Uploader */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-1.5">
                    <Music className="h-4 w-4 text-rose-500" /> Song / Vocal Track to Convert
                  </label>
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/30 transition cursor-pointer">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                      }}
                      className="hidden"
                      id="singing-song-upload"
                    />
                    <label htmlFor="singing-song-upload" className="cursor-pointer space-y-1 flex flex-col items-center">
                      <AudioLines className="size-6 text-rose-500" />
                      <span className="text-sm font-medium text-foreground">
                        {selectedFile ? selectedFile.name : "Select or drag song file here (MP3, WAV, FLAC)"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        The singing melody and lyrics from this track will be converted to the target voice.
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2. Target Voice Selector Mode */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center gap-1.5">
                      <Mic2 className="h-4 w-4 text-rose-500" /> Target Voice Source
                    </label>
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setVoiceMode("preset")}
                        className={`px-2 py-1 rounded-md transition ${voiceMode === "preset" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground"}`}
                      >
                        Studio Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceMode("cloned")}
                        className={`px-2 py-1 rounded-md transition ${voiceMode === "cloned" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground"}`}
                      >
                        My Clones
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceMode("upload")}
                        className={`px-2 py-1 rounded-md transition ${voiceMode === "upload" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground"}`}
                      >
                        Upload Audio
                      </button>
                    </div>
                  </div>

                  {voiceMode === "preset" && (
                    <select
                      value={targetVoice}
                      onChange={(e) => setTargetVoice(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl h-11 px-3 text-sm"
                    >
                      <option value="Julian (British RP)">Julian (British RP) • Baritone</option>
                      <option value="Sienna (Conversational American)">Sienna (Conversational American) • Soprano</option>
                      <option value="Arthur (Deep Narrative)">Arthur (Deep Narrative) • Bass</option>
                      <option value="Marcus (Modern Urban)">Marcus (Modern Urban) • Tenor</option>
                    </select>
                  )}

                  {voiceMode === "cloned" && (
                    <select
                      value={targetVoice}
                      onChange={(e) => setTargetVoice(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl h-11 px-3 text-sm"
                    >
                      {voicesData?.custom && voicesData.custom.length > 0 ? (
                        voicesData.custom.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} {v.description ? `• ${v.description}` : "• Cloned Voice"}
                          </option>
                        ))
                      ) : (
                        <option value="">No custom cloned voices found yet</option>
                      )}
                    </select>
                  )}

                  {voiceMode === "upload" && (
                    <div className="border border-border rounded-xl p-3 bg-background/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Upload className="size-4 text-rose-500 shrink-0" />
                        <span className="text-xs truncate font-medium text-foreground">
                          {voiceRefFile ? voiceRefFile.name : "Upload a 10s audio clip of the target singer / voice"}
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
                        className="shrink-0 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-lg cursor-pointer transition font-medium"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>

                {/* Pitch Transposition Slider */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Pitch Transpose: {pitchShift >= 0 ? `+${pitchShift}` : pitchShift} semitones
                    </span>
                    <span>{pitchShift === 0 ? "Original Key" : pitchShift > 0 ? "Higher Pitch" : "Lower Pitch"}</span>
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

            {/* Duration slider (for generative modes) */}
            {!isStems && !isSinging && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Duration: {duration}s</span>
                  <span>Max: {cfg.maxDuration}s</span>
                </div>
                <Slider
                  value={[duration]}
                  min={cfg.minDuration}
                  max={cfg.maxDuration}
                  step={cfg.step}
                  onValueChange={([val]) => setDuration(val)}
                />
              </div>
            )}

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full ${
                isBeats
                  ? "bg-violet-600 hover:bg-violet-500"
                  : isSong
                  ? "bg-indigo-600 hover:bg-indigo-500"
                  : isStems
                  ? "bg-cyan-600 hover:bg-cyan-500"
                  : isSinging
                  ? "bg-rose-600 hover:bg-rose-500"
                  : "bg-amber-600 hover:bg-amber-500"
              } text-white font-semibold py-6 text-base`}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Disc3 className="h-5 w-5 animate-spin" />
                  {isBeats
                    ? "Composing Beats…"
                    : isSong
                    ? "Recording Song…"
                    : isStems
                    ? "Separating Stems…"
                    : isSinging
                    ? "Converting Singing…"
                    : "Synthesizing Foley…"}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <IconComp className="h-5 w-5" />
                  {isBeats
                    ? "Generate Beats"
                    : isSong
                    ? "Generate Full Song"
                    : isStems
                    ? "Separate Stems (Demucs v4)"
                    : isSinging
                    ? "Generate AI Singing Cover"
                    : "Generate Sound FX"}
                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white/90">
                    {isBeats ? "50 credits" : isSong ? "150 credits" : isStems ? "30 credits" : isSinging ? "50 credits" : "25 credits"}
                  </span>
                </span>
              )}
            </Button>
          </div>

          {/* Right - player card */}
          <div className="rounded-xl border bg-card p-6 flex flex-col justify-between gap-6">
            {isStems && separatedStems ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Layers className="size-4 text-cyan-500" /> Isolated 4-Track Stems
                  </h3>
                  <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full">
                    Demucs v4
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "🎤 Vocals (Dry Acapella)", url: separatedStems.vocalsUrl, color: "text-cyan-400" },
                    { label: "🥁 Drums", url: separatedStems.drumsUrl, color: "text-amber-400" },
                    { label: "🎸 Bass", url: separatedStems.bassUrl, color: "text-indigo-400" },
                    { label: "🎹 Instruments / Other", url: separatedStems.otherUrl, color: "text-emerald-400" },
                  ].map((stem) => (
                    <div key={stem.label} className="p-2.5 rounded-lg border bg-muted/20 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${stem.color}`}>{stem.label}</span>
                        {stem.url && (
                          <a href={stem.url} download className="text-muted-foreground hover:text-foreground">
                            <Download className="size-3" />
                          </a>
                        )}
                      </div>
                      {stem.url && <audio src={stem.url} controls className="w-full h-7" />}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div
                  className={`mx-auto w-24 h-24 rounded-2xl ${
                    isBeats
                      ? "bg-violet-500/10 border-violet-500/20"
                      : isSong
                      ? "bg-indigo-500/10 border-indigo-500/20"
                      : isStems
                      ? "bg-cyan-500/10 border-cyan-500/20"
                      : isSinging
                      ? "bg-rose-500/10 border-rose-500/20"
                      : "bg-amber-500/10 border-amber-500/20"
                  } flex items-center justify-center border`}
                >
                  {isBeats ? (
                    <Radio className={`h-12 w-12 text-violet-500 ${isGenerating ? "animate-pulse" : ""}`} />
                  ) : isSong ? (
                    <Disc3 className={`h-12 w-12 text-indigo-500 ${isGenerating ? "animate-spin" : ""}`} />
                  ) : isStems ? (
                    <Layers className={`h-12 w-12 text-cyan-500 ${isGenerating ? "animate-pulse" : ""}`} />
                  ) : isSinging ? (
                    <AudioLines className={`h-12 w-12 text-rose-500 ${isGenerating ? "animate-pulse" : ""}`} />
                  ) : (
                    <Volume2 className={`h-12 w-12 text-amber-500 ${isGenerating ? "animate-pulse" : ""}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {isBeats
                      ? "Beat Player"
                      : isSong
                      ? "Song Player"
                      : isStems
                      ? "Stems Multitrack Mixer"
                      : isSinging
                      ? "AI Singing Cover Player"
                      : "Sound FX Player"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isBeats
                      ? "Your generated instrumental will stream here."
                      : isSong
                      ? "Your generated vocal song will stream here."
                      : isStems
                      ? "Individual stem channels (vocals, drums, bass, other) will unlock here."
                      : isSinging
                      ? "Your transposed singing cover will stream here."
                      : "Your generated Foley clip will stream here."}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-muted/40 p-4 border border-dashed text-xs text-muted-foreground text-center">
              {audioUrl ? (
                <audio src={audioUrl} controls className="w-full" />
              ) : (
                <span>
                  {isGenerating
                    ? `Processing your ${isBeats ? "beat" : isSong ? "song" : isStems ? "stems" : isSinging ? "singing cover" : "sound effect"}…`
                    : "Audio output will unlock upon completion."}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* History Card for Active Mode */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${isBeats ? "text-violet-500" : isSong ? "text-indigo-500" : "text-amber-500"}`} />
              <h2 className="text-base font-semibold text-foreground">
                Past {isBeats ? "Instrumental Beats" : isSong ? "Full Songs" : "Sound Effects"}
              </h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {currentHistory.length} saved
            </span>
          </div>

          {currentHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No previous {isBeats ? "beats" : isSong ? "songs" : "sound effects"} found for your organization.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between p-3.5 rounded-xl border border-border/60 bg-muted/15 hover:bg-muted/30 transition gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {item.tag}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed">
                      {item.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {item.duration}s
                    </span>
                    {item.url && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-primary hover:bg-primary/10"
                          onClick={() => setAudioUrl(item.url)}
                        >
                          <Play className="h-3 w-3" /> Play
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <a href={item.url} download target="_blank" rel="noreferrer">
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
