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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";

type Mode = "beats" | "song" | "sfx";

const MODE_CONFIG = {
  beats: {
    icon: Drum,
    label: "Beats & Instrumentals",
    badge: "MusicGen · No Vocals",
    badgeColor: "bg-violet-500/10 text-violet-400",
    description:
      "Generate pure instrumental beats, loops, and soundscapes — no vocals. Powered by Meta MusicGen.",
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
  const isSfx = mode === "sfx";

  const beatsMutation = useMutation(trpc.studio.generateBeats.mutationOptions());
  const songMutation = useMutation(trpc.studio.generateSong.mutationOptions());
  const soundMutation = useMutation(trpc.studio.generateSound.mutationOptions());

  const switchMode = (next: Mode) => {
    setMode(next);
    setPrompt(MODE_CONFIG[next].defaultPrompt);
    setDuration(MODE_CONFIG[next].defaultDuration);
    setAudioUrl(null);
  };

  const handleGenerate = async () => {
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
        toast.success("Beats generated!");
      } else if (isSong) {
        toast.info("Generating full song on Modal GPU via ACE-Step 1.5…");
        const res = await songMutation.mutateAsync({ prompt, lyrics, duration });
        if (res.url) setAudioUrl(res.url);
        toast.success("Song generated!");
      } else {
        toast.info("Synthesizing Foley sound effect via AudioGen…");
        const res = await soundMutation.mutateAsync({ prompt, duration });
        if (res.url) setAudioUrl(res.url);
        toast.success("Sound effect generated!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Music & Sound Studio" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left controls */}
          <div className="md:col-span-2 space-y-4">
            {/* Style prompt */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Wand2 className={`h-4 w-4 ${isBeats ? "text-violet-500" : isSong ? "text-indigo-500" : "text-amber-500"}`} />
                {isBeats ? "Beat Style & Genre" : isSong ? "Music Style & Genre" : "Sound Effect Description"}
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={cfg.promptPlaceholder}
                className="bg-background"
              />
            </div>

            {/* Lyrics — only for song mode */}
            {isSong && (
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Lyrics &amp; Structure
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    (optional — leave blank for instrumental arrangement)
                  </span>
                </label>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={8}
                  placeholder={
                    "[Verse]\nWrite your verse...\n\n[Chorus]\nWrite your chorus..."
                  }
                  className="font-mono text-xs bg-background"
                />
              </div>
            )}

            {/* Duration slider */}
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

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full ${
                isBeats
                  ? "bg-violet-600 hover:bg-violet-500"
                  : isSong
                  ? "bg-indigo-600 hover:bg-indigo-500"
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
                    : "Synthesizing Foley…"}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconComp className="h-5 w-5" />
                  {isBeats
                    ? "Generate Beats"
                    : isSong
                    ? "Generate Full Song"
                    : "Generate Sound FX"}
                </span>
              )}
            </Button>
          </div>

          {/* Right — player card */}
          <div className="rounded-xl border bg-card p-6 flex flex-col justify-between gap-6">
            <div className="space-y-4 text-center">
              <div
                className={`mx-auto w-24 h-24 rounded-2xl ${
                  isBeats
                    ? "bg-violet-500/10 border-violet-500/20"
                    : isSong
                    ? "bg-indigo-500/10 border-indigo-500/20"
                    : "bg-amber-500/10 border-amber-500/20"
                } flex items-center justify-center border`}
              >
                {isBeats ? (
                  <Radio
                    className={`h-12 w-12 text-violet-500 ${isGenerating ? "animate-pulse" : ""}`}
                  />
                ) : isSong ? (
                  <Disc3
                    className={`h-12 w-12 text-indigo-500 ${isGenerating ? "animate-spin" : ""}`}
                  />
                ) : (
                  <Volume2
                    className={`h-12 w-12 text-amber-500 ${isGenerating ? "animate-pulse" : ""}`}
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isBeats
                    ? "Beat Player"
                    : isSong
                    ? "Song Player"
                    : "Sound FX Player"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isBeats
                    ? "Your generated instrumental will stream here."
                    : isSong
                    ? "Your generated vocal song will stream here."
                    : "Your generated Foley clip will stream here."}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-4 border border-dashed text-xs text-muted-foreground text-center">
              {audioUrl ? (
                <audio src={audioUrl} controls className="w-full" />
              ) : (
                <span>
                  {isGenerating
                    ? `🎵 Generating your ${isBeats ? "beat" : isSong ? "song" : "sound effect"}…`
                    : "Audio player will unlock upon generation."}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
