"use client";

import React, { useState } from "react";
import { 
  Link2, Upload, Scissors, Sparkles, Smartphone, Square, Monitor, 
  Settings2, Wand2, ShieldCheck, Flame, ChevronDown, RefreshCw,
  Video, Eye, Type, Sliders, Check, Layers
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
  { id: "THEBOLDFONT", name: "The Bold Font (Hormozi)", category: "Ultra Bold & Kinetic" },
  { id: "Impact", name: "Impact Heavy", category: "Ultra Bold & Kinetic" },
  { id: "Bebas Neue", name: "Bebas Neue Tall", category: "Ultra Bold & Kinetic" },
  { id: "Anton", name: "Anton Editorial", category: "Ultra Bold & Kinetic" },
  { id: "TikTokSans", name: "TikTok Sans (Official)", category: "Clean & Modern Tech" },
  { id: "Inter", name: "Inter ExtraBold", category: "Clean & Modern Tech" },
  { id: "Proxima Nova", name: "Proxima Nova Clean", category: "Clean & Modern Tech" },
  { id: "Montserrat", name: "Montserrat Black", category: "Clean & Modern Tech" },
  { id: "Komika Axis", name: "Komika Axis (MrBeast)", category: "High Energy & YouTube" },
  { id: "Luckiest Guy", name: "Luckiest Guy Comic", category: "High Energy & YouTube" },
  { id: "Bungee", name: "Bungee Block", category: "High Energy & YouTube" },
  { id: "Black Ops One", name: "Black Ops Geometric", category: "High Energy & YouTube" },
  { id: "Cinzel", name: "Cinzel Roman Luxury", category: "Cinematic & Luxury" },
  { id: "Oswald", name: "Oswald Documentary", category: "Cinematic & Luxury" },
  { id: "Playfair Display", name: "Playfair Serif", category: "Cinematic & Luxury" },
  { id: "Space Grotesk", name: "Space Grotesk Cyber", category: "Cinematic & Luxury" },
];

export const SUBTITLE_PRESETS = [
  { id: "hormozi", name: "Hormozi Bold", font: "THEBOLDFONT", pri: "#FFFFFF", hl: "#00FF66", desc: "White text, electric lime active bounce" },
  { id: "mrbeast", name: "MrBeast Vibrant", font: "Montserrat", pri: "#FFFF00", hl: "#FF2D2D", desc: "Vibrant yellow with energetic red highlight" },
  { id: "tiktok", name: "TikTok Signature", font: "TikTokSans", pri: "#FFFFFF", hl: "#FE2C55", desc: "Clean native TikTok font with pink accents" },
  { id: "cyber", name: "Cyber Lime", font: "THEBOLDFONT", pri: "#39FF14", hl: "#00FFFF", desc: "Electric cyber green with cyan glow" },
  { id: "neon", name: "Neon Violet", font: "THEBOLDFONT", pri: "#00FFFF", hl: "#FF00FF", desc: "Cyan text with hot magenta glow" },
  { id: "podcast", name: "Podcast Dark Pill", font: "Inter", pri: "#FFFFFF", hl: "#FFB800", desc: "Dark high-contrast pill box for crisp readability" },
  { id: "cinematic", name: "Cinematic Gold", font: "THEBOLDFONT", pri: "#FFD700", hl: "#FFFFFF", desc: "Luxury gold with pure white pop" },
  { id: "clean", name: "Clean White", font: "Proxima Nova", pri: "#FFFFFF", hl: "#FFE000", desc: "Minimal white text with bright yellow accent" },
  { id: "minimal", name: "Minimalist", font: "Inter", pri: "#E2E8F0", hl: "#FFFFFF", desc: "Subtle aesthetic lower third text" },
  { id: "comic", name: "Comic Energy", font: "Komika Axis", pri: "#FFFFFF", hl: "#FFA500", desc: "Bouncy comic font with vivid orange" },
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
    <Card className="border-border/80 bg-card shadow-sm overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Col 1: Video Ingest & Aspect Ratio (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Video className="size-4" />
                  </div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    1. Source Video
                  </Label>
                </div>
                
                {/* Ingest Type Switcher */}
                <div className="inline-flex p-0.5 rounded-lg bg-muted border border-border/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setSourceType("youtube")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      sourceType === "youtube"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link2 className="size-3 text-red-500" />
                    <span>YouTube</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType("upload")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      sourceType === "upload"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Upload className="size-3 text-amber-500" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {sourceType === "youtube" ? (
                <div className="space-y-1.5">
                  <Input
                    type="url"
                    placeholder="Paste YouTube or Shorts URL (e.g. https://youtu.be/...)"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="h-10 text-xs bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    Supports public YouTube links, podcasts, interviews, and webinars.
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="clipper-file-upload"
                  />
                  <label
                    htmlFor="clipper-file-upload"
                    className="h-20 border border-dashed border-border/80 hover:border-primary/50 rounded-xl p-3 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/30 flex flex-col items-center justify-center space-y-1"
                  >
                    <Upload className="size-5 text-muted-foreground/80" />
                    <span className="text-xs font-semibold text-foreground truncate max-w-[240px]">
                      {selectedFile ? selectedFile.name : "Click to choose MP4 / MOV file"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Up to 2GB</span>
                  </label>
                </div>
              )}
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>Output Aspect Ratio</span>
                <span className="font-mono text-[10px] font-normal">{aspectRatio}</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "9:16", label: "9:16", sub: "Vertical", Icon: Smartphone },
                  { id: "1:1", label: "1:1", sub: "Square", Icon: Square },
                  { id: "16:9", label: "16:9", sub: "Landscape", Icon: Monitor },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id as any)}
                    className={cn(
                      "py-2 px-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer",
                      aspectRatio === item.id 
                        ? "bg-primary/10 border-primary text-primary shadow-xs font-bold" 
                        : "bg-background border-border/80 hover:border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.Icon className={cn("size-3.5", aspectRatio === item.id ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[10px] opacity-75">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: AI Framing & Caption Styling (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4 lg:border-x lg:border-border/60 lg:px-6">
            <div className="space-y-3.5">
              {/* Header with Switch */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Eye className="size-4" />
                  </div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    2. AI Framing &amp; Presets
                  </Label>
                </div>

                {/* YOLO Reframe Real Switch */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {enableReframe ? "Reframe On" : "Off"}
                  </span>
                  <Switch
                    checked={enableReframe}
                    onCheckedChange={setEnableReframe}
                    aria-label="Toggle YOLO AI Reframing"
                  />
                </div>
              </div>

              {/* Subtitle Presets Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground">Subtitle Style Preset</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">10 Styles</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[148px] overflow-y-auto pr-1">
                  {SUBTITLE_PRESETS.map((p) => {
                    const isSelected = subtitleStyle === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePresetSelect(p.id)}
                        className={cn(
                          "py-1.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                            : "bg-background border-border/80 hover:border-primary/40 text-foreground hover:bg-muted/30"
                        )}
                      >
                        <span
                          className={cn("size-2 rounded-full shrink-0 shadow-xs", isSelected && "ring-2 ring-white/50")}
                          style={{ backgroundColor: p.hl }}
                        />
                        <span>{p.name}</span>
                        {isSelected && <Check className="size-3 text-primary-foreground ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Font Family Selector */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Type className="size-3 text-muted-foreground" />
                <span>Creator Font</span>
              </Label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full h-9 bg-background border border-border/80 rounded-xl px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {CREATOR_FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Col 3: Strategy, Viral Toggles & Launch (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Sliders className="size-4" />
                </div>
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  3. Virality Strategy
                </Label>
              </div>

              {/* Clip Count & Duration Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Clips Count</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 3, 5, 8].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNumClips(c)}
                        className={cn(
                          "h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                          numClips === c
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-background border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Clip Length</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: "<30", label: "<30s" },
                      { id: "30-60", label: "30-60s" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDurationCategory(d.id as any)}
                        className={cn(
                          "h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                          durationCategory === d.id
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-background border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40"
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
                  className="p-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted/20 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">Hook Banner</div>
                    <div className="text-[10px] text-muted-foreground">Top retention header</div>
                  </div>
                  <Switch
                    checked={showHookBanner}
                    onCheckedChange={setShowHookBanner}
                    aria-label="Toggle Hook Banner"
                  />
                </div>

                <div
                  onClick={() => setOriginalityBoost(!originalityBoost)}
                  className="p-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted/20 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <ShieldCheck className="size-3 text-emerald-500" />
                      <span>Anti-Dupe</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Smart cut offsets</div>
                  </div>
                  <Switch
                    checked={originalityBoost}
                    onCheckedChange={setOriginalityBoost}
                    aria-label="Toggle Anti-Dupe Protection"
                  />
                </div>
              </div>
            </div>

            {/* Launch CTA Button */}
            <div className="pt-2 border-t border-border/60">
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                size="lg"
                className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin mr-2" />
                    <span>Processing on GPU...</span>
                  </>
                ) : (
                  <>
                    <Flame className="size-4 fill-white mr-2" />
                    <span>Generate Viral Clips (50 Credits)</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

