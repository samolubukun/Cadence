"use client";

import React, { useState } from "react";
import { 
  Link2, Upload, Scissors, Sparkles, Smartphone, Square, Monitor, 
  Settings2, Wand2, ShieldCheck, Flame, ChevronDown, RefreshCw,
  Video, Eye, Type, Sliders, Check, Layers, Cpu, Play
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const CREATOR_FONTS = [
  { id: "THEBOLDFONT", name: "The Bold Font (Kinetic)", category: "Ultra Bold & Kinetic" },
  { id: "Impact", name: "Impact Heavy", category: "Ultra Bold & Kinetic" },
  { id: "Bebas Neue", name: "Bebas Neue Tall", category: "Ultra Bold & Kinetic" },
  { id: "Anton", name: "Anton Editorial", category: "Ultra Bold & Kinetic" },
  { id: "TikTokSans", name: "TikTok Sans (Official)", category: "Clean & Modern Tech" },
  { id: "Inter", name: "Inter ExtraBold", category: "Clean & Modern Tech" },
  { id: "Proxima Nova", name: "Proxima Nova Clean", category: "Clean & Modern Tech" },
  { id: "Montserrat", name: "Montserrat Black", category: "Clean & Modern Tech" },
  { id: "Komika Axis", name: "Komika Axis (Punchy)", category: "High Energy & Dynamic" },
  { id: "Luckiest Guy", name: "Luckiest Guy Comic", category: "High Energy & Dynamic" },
  { id: "Bungee", name: "Bungee Block", category: "High Energy & YouTube" },
  { id: "Black Ops One", name: "Black Ops Geometric", category: "High Energy & YouTube" },
  { id: "Cinzel", name: "Cinzel Roman Luxury", category: "Cinematic & Luxury" },
  { id: "Oswald", name: "Oswald Documentary", category: "Cinematic & Luxury" },
  { id: "Playfair Display", name: "Playfair Serif", category: "Cinematic & Luxury" },
  { id: "Space Grotesk", name: "Space Grotesk Cyber", category: "Cinematic & Luxury" },
];

export const SUBTITLE_PRESETS = [
  { id: "hormozi", name: "Kinetic", font: "THEBOLDFONT", pri: "#FFFFFF", hl: "#00FF66", desc: "White text with kinetic electric lime pop" },
  { id: "mrbeast", name: "Vibrant", font: "Montserrat", pri: "#FFFF00", hl: "#FF2D2D", desc: "Vibrant yellow with punchy red highlight" },
  { id: "tiktok", name: "TikTok", font: "TikTokSans", pri: "#FFFFFF", hl: "#FE2C55", desc: "Official TikTok font with viral pink accent" },
  { id: "cyber", name: "Cyber", font: "THEBOLDFONT", pri: "#39FF14", hl: "#00FFFF", desc: "Neon green with cyan kinetic pop" },
  { id: "neon", name: "Neon", font: "THEBOLDFONT", pri: "#00FFFF", hl: "#FF00FF", desc: "Cyan text with hot magenta glow" },
  { id: "podcast", name: "Podcast", font: "Inter", pri: "#FFFFFF", hl: "#FFB800", desc: "Crisp white text with amber emphasis" },
  { id: "cinematic", name: "Gold", font: "THEBOLDFONT", pri: "#FFD700", hl: "#FFFFFF", desc: "Luxury warm gold with clean white" },
  { id: "clean", name: "Clean", font: "Proxima Nova", pri: "#FFFFFF", hl: "#FFE000", desc: "Minimal aesthetic with subtle yellow pop" },
  { id: "comic", name: "Comic", font: "Komika Axis", pri: "#FFFFFF", hl: "#FFA500", desc: "Bouncy comic style with fiery orange" },
];

interface ClipperIngestPanelProps {
  onSubmit: (params: any) => void;
  isLoading: boolean;
}

export function ClipperIngestPanel({ onSubmit, isLoading }: ClipperIngestPanelProps) {
  const [sourceType, setSourceType] = useState<"youtube" | "upload">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Settings
  const [numClips, setNumClips] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [enableReframe, setEnableReframe] = useState(true);
  const [reframeMode, setReframeMode] = useState<"speaker" | "podcast_split" | "blur_fill">("speaker");
  const [subtitleStyle, setSubtitleStyle] = useState("hormozi");
  const [fontFamily, setFontFamily] = useState("THEBOLDFONT");
  const [primaryColor, setPrimaryColor] = useState("#FFFFFF");
  const [highlightColor, setHighlightColor] = useState("#00FF66");
  const [wordsPerLine, setWordsPerLine] = useState(3);
  const [wordPop, setWordPop] = useState(true);
  const [showHookBanner, setShowHookBanner] = useState(true);
  const [originalityBoost, setOriginalityBoost] = useState(true);
  const [durationCategory, setDurationCategory] = useState<"<30" | "30-60" | "60-90">("30-60");

  const currentPreset = SUBTITLE_PRESETS.find(p => p.id === subtitleStyle) || SUBTITLE_PRESETS[0];

  const handlePresetSelect = (presetId: string) => {
    setSubtitleStyle(presetId);
    const p = SUBTITLE_PRESETS.find(item => item.id === presetId);
    if (p) {
      setFontFamily(p.font);
      setPrimaryColor(p.pri);
      setHighlightColor(p.hl);
    }
  };

  const handleGenerate = () => {
    if (sourceType === "youtube" && !youtubeUrl.trim()) {
      toast.error("Please enter a valid YouTube video URL");
      return;
    }
    if (sourceType === "upload" && !selectedFile) {
      toast.error("Please select a video file to upload");
      return;
    }

    onSubmit({
      sourceType,
      sourceUrl: sourceType === "youtube" ? youtubeUrl : undefined,
      numClips,
      aspectRatio,
      enableReframe,
      reframeMode,
      subtitleStyle,
      fontFamily,
      primaryColor,
      highlightColor,
      wordsPerLine,
      wordPop,
      showHookBanner,
      originalityBoost,
      preferredDurationCategory: durationCategory,
    });
  };

  return (
    <Card className="border-border/80 bg-card shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-5 sm:p-6 lg:p-7 space-y-6">
        {/* Main 3-Column Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ── COL 1: SOURCE VIDEO & ASPECT RATIO (4 Cols) ─────────────────── */}
          <div className="lg:col-span-4 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-5">
            <div className="space-y-4">
              {/* Step Title Header (Dedicated Line) */}
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <div className="size-6 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                  <Video className="size-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  1. Source Video
                </h3>
              </div>

              {/* Ingest Source Switcher Tab */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Input Method</span>
                <div className="inline-flex p-0.5 rounded-xl bg-background border border-border/80 text-xs shadow-xs">
                  <button
                    type="button"
                    onClick={() => setSourceType("youtube")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      sourceType === "youtube"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link2 className="size-3" />
                    <span>YouTube</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType("upload")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      sourceType === "upload"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Upload className="size-3" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Ingest Input Form */}
              {sourceType === "youtube" ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="url"
                      placeholder="Paste YouTube or Shorts URL..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="h-10 text-xs pl-3.5 pr-8 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-red-500/40 rounded-xl"
                    />
                    {youtubeUrl && (
                      <button
                        type="button"
                        onClick={() => setYoutubeUrl("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Whisper large-v3 automatically extracts transcripts and identifies highest retention hooks.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="clipper-file-upload"
                  />
                  <label
                    htmlFor="clipper-file-upload"
                    className="h-24 border-2 border-dashed border-border/80 hover:border-amber-500/50 rounded-xl p-3 text-center cursor-pointer transition-all bg-background hover:bg-amber-500/5 flex flex-col items-center justify-center space-y-1 group"
                  >
                    <Upload className="size-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    <span className="text-xs font-semibold text-foreground truncate max-w-[220px]">
                      {selectedFile ? selectedFile.name : "Choose MP4 / MOV file"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Up to 2GB high-definition</span>
                  </label>
                </div>
              )}
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Canvas Framing</Label>
                <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold">
                  {aspectRatio === "9:16" ? "Shorts / Reels / TikTok" : aspectRatio}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "9:16", label: "9:16", sub: "Vertical", Icon: Smartphone },
                  { id: "1:1", label: "1:1", sub: "Square", Icon: Square },
                  { id: "16:9", label: "16:9", sub: "Landscape", Icon: Monitor },
                ].map((item) => {
                  const isSelected = aspectRatio === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAspectRatio(item.id as any)}
                      className={cn(
                        "py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                        isSelected
                          ? "bg-background border-primary text-primary shadow-xs font-bold ring-1 ring-primary/20"
                          : "bg-background/60 border-border/70 hover:border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.Icon className={cn("size-3.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-xs font-semibold">{item.label}</span>
                      <span className="text-[10px] opacity-75">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── COL 2: AI FRAMING & KINETIC PRESETS (4 Cols) ─────────────────── */}
          <div className="lg:col-span-4 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-4">
            <div className="space-y-3.5">
              {/* Step Title Header (Dedicated Line) */}
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <div className="size-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Eye className="size-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. Framing &amp; Captions
                </h3>
              </div>

              {/* Sub-Header: YOLO Reframe Switch */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Speaker Tracking</span>
                <div className="flex items-center gap-2 bg-background px-2.5 py-1 rounded-xl border border-border/80 shadow-xs">
                  <span className="text-[11px] font-semibold text-foreground">
                    {enableReframe ? "Auto-Track" : "Static"}
                  </span>
                  <Switch
                    checked={enableReframe}
                    onCheckedChange={setEnableReframe}
                    aria-label="Toggle YOLO AI Reframing"
                  />
                </div>
              </div>

              {/* Subtitle Presets Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">Subtitle Style Preset</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">9 Curated</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {SUBTITLE_PRESETS.map((p) => {
                    const isSelected = subtitleStyle === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePresetSelect(p.id)}
                        className={cn(
                          "p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 h-[52px]",
                          isSelected
                            ? "bg-background border-primary text-primary shadow-xs font-bold ring-1 ring-primary/20"
                            : "bg-background/60 border-border/70 hover:border-border text-foreground hover:bg-background"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={cn("size-2 rounded-full shrink-0 shadow-xs", isSelected && "ring-2 ring-white/50")}
                            style={{ backgroundColor: p.hl }}
                          />
                          {isSelected && <Check className="size-3 text-primary" />}
                        </div>
                        <span className="text-[11px] font-semibold truncate leading-tight">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Caption Visualizer Box */}
              <div className="rounded-xl border border-border/80 bg-neutral-950 p-2.5 text-center flex flex-col items-center justify-center min-h-[50px] shadow-inner">
                <span className="text-[10px] font-mono text-neutral-400 mb-1 tracking-wider uppercase">
                  Subtitle Preview ({currentPreset.name})
                </span>
                <div className="flex items-center gap-1.5 text-xs font-black tracking-wide">
                  <span style={{ color: currentPreset.pri }}>CADENCE</span>
                  <span 
                    className="px-1.5 py-0.5 rounded shadow-sm text-black uppercase font-black"
                    style={{ backgroundColor: currentPreset.hl }}
                  >
                    VIRAL
                  </span>
                  <span style={{ color: currentPreset.pri }}>MOMENT</span>
                </div>
              </div>
            </div>

            {/* Creator Font Family Selector */}
            <div className="space-y-1.5 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Type className="size-3 text-muted-foreground" />
                  <span>Typography Font</span>
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">16 Pro Fonts</span>
              </div>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full h-9 bg-background border border-border/80 rounded-xl px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-xs"
              >
                {CREATOR_FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── COL 3: VIRALITY STRATEGY & AI TUNING (4 Cols) ─────────────────── */}
          <div className="lg:col-span-4 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-4">
            <div className="space-y-3.5">
              {/* Step Title Header (Dedicated Line) */}
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <div className="size-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Sliders className="size-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  3. Virality Strategy
                </h3>
              </div>

              {/* Sub-Header: Pipeline Mode */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Moment Scoring</span>
                <Badge variant="outline" className="text-[10px] font-mono bg-amber-500/10 text-amber-600 border-amber-500/30">
                  High-Hook AI
                </Badge>
              </div>

              {/* Clip Count & Duration Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Clips Count</Label>
                  <div className="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-background border border-border/80 shadow-xs">
                    {[1, 3, 5, 8].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNumClips(c)}
                        className={cn(
                          "h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                          numClips === c
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Duration Target</Label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 rounded-xl bg-background border border-border/80 shadow-xs">
                    {[
                      { id: "<30", label: "<30s" },
                      { id: "30-60", label: "30–60s" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDurationCategory(d.id as any)}
                        className={cn(
                          "h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                          durationCategory === d.id
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hook Banner & Anti-dupe Switches */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setShowHookBanner(!showHookBanner)}
                  className="p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/30 transition-all flex flex-col justify-between gap-2 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Hook Banner</span>
                    <Switch
                      checked={showHookBanner}
                      onCheckedChange={setShowHookBanner}
                      aria-label="Toggle Hook Banner"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    Top retention header text overlay
                  </span>
                </div>

                <div
                  onClick={() => setOriginalityBoost(!originalityBoost)}
                  className="p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/30 transition-all flex flex-col justify-between gap-2 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-emerald-500" />
                      <span>Anti-Dupe</span>
                    </span>
                    <Switch
                      checked={originalityBoost}
                      onCheckedChange={setOriginalityBoost}
                      aria-label="Toggle Anti-Dupe Protection"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    Algorithm bypass with micro-offsets
                  </span>
                </div>
              </div>
            </div>

            {/* Pipeline Feature Badges */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-amber-500" /> GPU Accelerated
              </span>
              <span>~45s runtime</span>
            </div>
          </div>

        </div>

        {/* ── FULL WIDTH ACTION BAR ACROSS BOTTOM ──────────────────────────── */}
        <div className="pt-2 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-4 text-amber-500" />
            <span>
              Extracts viral hooks, tracks speakers with YOLO, burns kinetic captions &amp; outputs vertical shorts ready for publishing.
            </span>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            size="lg"
            className="w-full sm:w-auto min-w-[280px] h-12 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer px-6 shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="size-4 animate-spin mr-2" />
                <span>Processing on Modal GPU...</span>
              </>
            ) : (
              <>
                <Flame className="size-4 fill-white mr-2" />
                <span>Generate Viral Clips (50 Credits)</span>
              </>
            )}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
