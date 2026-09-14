"use client";

import { useState, useRef } from "react";
import {
  Clapperboard,
  Image as ImageIcon,
  Video,
  Wand2,
  Download,
  Sparkles,
  Clock,
  Calendar,
  UploadCloud,
  Layers,
  X,
  SlidersHorizontal,
  ArrowRight,
  Zap,
  Disc3,
  CheckCircle2,
  Share2,
  Eye,
  Maximize2,
  Ratio,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type VisualMode = "image" | "edit" | "video";

interface VisualModeConfig {
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
}

const VISUAL_MODES: Record<VisualMode, VisualModeConfig> = {
  image: {
    icon: ImageIcon,
    label: "4K Artwork & Covers",
    badge: "SDXL-Turbo · SenseNova MoT",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    accentBg: "bg-cyan-50 dark:bg-cyan-950/30",
    accentText: "text-cyan-600 dark:text-cyan-400",
    accentBorder: "border-cyan-200 dark:border-cyan-900/50",
    primaryColor: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20",
    creditCost: 20,
    description: "Generate photorealistic album artwork, vinyl sleeve designs, and promotional visuals.",
    promptPlaceholder: "e.g. Cyberpunk neon vinyl album art with glowing typography CADENCE...",
  },
  edit: {
    icon: Sparkles,
    label: "AI Image Editor",
    badge: "SenseNova U1.5 · 8B MoT",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    accentBg: "bg-purple-50 dark:bg-purple-950/30",
    accentText: "text-purple-600 dark:text-purple-400",
    accentBorder: "border-purple-200 dark:border-purple-900/50",
    primaryColor: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20",
    creditCost: 50,
    description: "Transform existing artwork with natural language instructions, inpainting, and lighting reworks.",
    promptPlaceholder: "e.g. Change background to futuristic neon concert stage, add rim lighting and holograms...",
  },
  video: {
    icon: Video,
    label: "Video Visualizers",
    badge: "Wan2.1 · 1.3B Diffusion",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/30",
    accentText: "text-indigo-600 dark:text-indigo-400",
    accentBorder: "border-indigo-200 dark:border-indigo-900/50",
    primaryColor: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20",
    creditCost: 200,
    description: "Synthesize high-framerate fluid cinematic video clips and canvas visualizers for releases.",
    promptPlaceholder: "e.g. Cinematic slow motion fluid sound waves pulsing in deep cosmic space...",
  },
};

const PRESETS: Record<VisualMode, Array<{ label: string; prompt: string; extra?: string }>> = {
  image: [
    { label: "Cyberpunk Neon", prompt: "Cyberpunk neon vinyl album art with glowing typography CADENCE" },
    { label: "Minimalist Vinyl", prompt: "Minimalist geometric matte vinyl sleeve with pastel gradients" },
    { label: "80s Anime Night", prompt: "Retro 80s anime city night illustration with rain reflections" },
    { label: "Obsidian Void", prompt: "Hyperrealistic 3D metallic liquid orb floating in obsidian void" },
  ],
  edit: [
    { label: "Cyber Concert Stage", prompt: "Change background to a neon cyberpunk concert stage with crowd lasers" },
    { label: "80s Pastel Glow", prompt: "Transform into a retro 80s anime aesthetic with soft grain and pastel glow" },
    { label: "Cinematic Studio Rim", prompt: "Add cinematic studio rim lighting, volumetrics, and subtle rain droplets" },
    { label: "Chrome Sculpture", prompt: "Turn into hyperrealistic dark metallic chrome sculpture with gold accents" },
  ],
  video: [
    { label: "Cosmic Audio Waves", prompt: "Cinematic slow motion fluid sound waves pulsing in deep cosmic space" },
    { label: "Tokyo Highway", prompt: "Hyper-lapse neon Tokyo highway rain reflections with anamorphic lens flare" },
    { label: "Wireframe Horizon", prompt: "Retro 80s wireframe grid terrain flying forward into purple digital sunset" },
    { label: "Iridescent Bass", prompt: "Abstract iridescent metallic liquid ripples vibrating to bass frequencies" },
  ],
};

export default function MediaStudioPage() {
  const trpc = useTRPC();
  const [mode, setMode] = useState<VisualMode>("image");

  // Prompt states
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageModel, setImageModel] = useState<"sdxl-turbo" | "sensenova">("sdxl-turbo");

  // Image Edit State (SenseNova U1.5 MoT)
  const [sourceImageBase64, setSourceImageBase64] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState<string | null>(null);
  const [editQuality, setEditQuality] = useState<"standard" | "ultra">("standard");
  const [editImgCfgScale, setEditImgCfgScale] = useState(1.0);
  const [editedResultUrl, setEditedResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMediaUrl, setActiveMediaUrl] = useState<{ url: string; type: "image" | "video"; title?: string } | null>(null);

  const { data: mediaList, refetch } = useQuery(trpc.studio.listMediaGenerations.queryOptions());

  const imageMutation = useMutation(trpc.studio.generateImage.mutationOptions());
  const videoMutation = useMutation(trpc.studio.generateVideo.mutationOptions());
  const editMutation = useMutation(trpc.studio.editImage.mutationOptions());

  const cfg = VISUAL_MODES[mode];
  const IconComp = cfg.icon;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be under 15MB");
      return;
    }

    setSourceImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setSourceImageBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const switchMode = (next: VisualMode) => {
    setMode(next);
    setPrompt("");
  };

  const handleGenerate = async () => {
    if (mode === "edit") {
      if (!sourceImageBase64) {
        toast.error("Please upload an image to edit first!");
        return;
      }
      if (!prompt.trim()) {
        toast.error("Please describe what changes or styling to apply.");
        return;
      }

      setIsGenerating(true);
      try {
        toast.info("Transforming image via SenseNova-U1.5-8B MoT (Modal GPU)…");
        const res = await editMutation.mutateAsync({
          prompt,
          images: [sourceImageBase64],
          quality: editQuality,
          imgCfgScale: editImgCfgScale,
        });

        if (res.url) {
          setEditedResultUrl(res.url);
          setActiveMediaUrl({ url: res.url, type: "image", title: `[Edit] ${prompt}` });
        }
        refetch();
        toast.success("SenseNova AI edit complete!");
      } catch (err: any) {
        toast.error(err?.message || "Failed to edit image");
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    if (mode === "image") {
      if (!prompt.trim()) {
        toast.error("Please describe your visual prompt.");
        return;
      }
      setIsGenerating(true);
      try {
        if (imageModel === "sensenova") {
          toast.info("Rendering studio-grade artwork via SenseNova 8B MoT (Modal GPU)…");
        } else {
          toast.info("Rendering fast 1024x1024 visual on Modal GPU via SDXL-Turbo…");
        }
        const res = await imageMutation.mutateAsync({ prompt, aspectRatio, model: imageModel });
        if (res.url) setActiveMediaUrl({ url: res.url, type: "image", title: prompt });
        refetch();
        toast.success(imageModel === "sensenova" ? "SenseNova visual rendered!" : "Image generated successfully!");
      } catch (err: any) {
        toast.error(err?.message || "Failed to generate image");
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    if (mode === "video") {
      if (!prompt.trim()) {
        toast.error("Please describe your video visualizer.");
        return;
      }
      setIsGenerating(true);
      try {
        toast.info("Synthesizing cinematic video on Modal GPU via Wan2.1 1.3B…");
        const res = await videoMutation.mutateAsync({ prompt, durationSeconds: 4 });
        if (res.url) setActiveMediaUrl({ url: res.url, type: "video", title: prompt });
        refetch();
        toast.success("Video visualizer generated!");
      } catch (err: any) {
        toast.error(err?.message || "Failed to generate video");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-background">
      <PageHeader title="Visuals & Video Studio" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header Banner */}
          <div className="border-b border-border/80 pb-6 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-10 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 transition-colors",
                    cfg.accentBg,
                    cfg.accentBorder
                  )}
                >
                  <IconComp className={cn("size-5", cfg.accentText)} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      Visuals &amp; Video Studio
                    </h1>
                    <Badge variant="outline" className={cn("text-[10px] hidden sm:inline-flex", cfg.badgeColor)}>
                      {cfg.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{cfg.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selector Tabs (Mirrored from Music Studio style) */}
          <div className="overflow-x-auto pb-1 -mb-1">
            <div className="inline-flex p-1.5 rounded-2xl bg-muted/60 border border-border/80 gap-1.5">
              {(
                [
                  {
                    key: "image",
                    label: "4K Artwork & Covers",
                    icon: ImageIcon,
                    activeClass: "bg-cyan-600 text-white shadow-xs",
                  },
                  {
                    key: "edit",
                    label: "AI Image Editor",
                    icon: Sparkles,
                    activeClass: "bg-purple-600 text-white shadow-xs",
                  },
                  {
                    key: "video",
                    label: "Video Visualizers",
                    icon: Video,
                    activeClass: "bg-indigo-600 text-white shadow-xs",
                  },
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
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer",
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

          {/* Main Studio 2-Column Workstation Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Generation Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-border bg-card shadow-xs rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-muted/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                      <Wand2 className={cn("size-4", cfg.accentText)} />
                      {mode === "image"
                        ? "Artwork Synthesis & Style Canvas"
                        : mode === "edit"
                        ? "SenseNova Neural Image Inpainting & Transform"
                        : "Cinematic Motion & Video Synthesis"}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Modal Accelerated
                    </span>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {mode === "image"
                      ? "Describe your visual aesthetic or select curated album cover presets."
                      : mode === "edit"
                      ? "Upload a reference visual and provide natural language editing instructions."
                      : "Describe scene dynamics, camera movements, and audio-visual flow."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 space-y-5">
                  {/* Mode-Specific: File Upload Dropzone for Image Editor */}
                  {mode === "edit" && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <UploadCloud className="size-4 text-purple-400" />
                          Source Image to Transform
                        </label>
                        <span className="text-[11px] text-muted-foreground">PNG, JPG, WEBP (up to 15MB)</span>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {!sourceImageBase64 ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-border/80 hover:border-purple-500/50 rounded-2xl p-6 text-center bg-muted/10 hover:bg-purple-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                        >
                          <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <UploadCloud className="size-6" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground block">
                              Click to upload image or drag &amp; drop
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5 block">
                              Album art, portrait, background, or character sketch
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <img
                              src={sourceImageBase64}
                              alt="Source"
                              className="size-12 rounded-lg object-cover border border-border/60 shrink-0"
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {sourceImageName || "Uploaded Image"}
                              </p>
                              <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
                                <Sparkles className="size-3" /> Ready for SenseNova U1.5 transformation
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="h-8 text-xs cursor-pointer"
                            >
                              Change
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSourceImageBase64(null);
                                setSourceImageName(null);
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Prompt Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Wand2 className={cn("size-4", cfg.accentText)} />
                        {mode === "edit" ? "Editing Instructions" : "Prompt & Creative Direction"}
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {mode === "edit" ? "Natural language edit" : "Faint placeholder guidance"}
                      </span>
                    </div>

                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={cfg.promptPlaceholder}
                      className="bg-background h-11 text-sm rounded-xl border-border/80 focus-visible:ring-1 placeholder:text-muted-foreground/45"
                    />

                    {/* Quick Preset Chips */}
                    {PRESETS[mode]?.length > 0 && (
                      <div className="pt-1.5">
                        <div className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Sparkles className="size-3" /> Curated Style Presets:
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {PRESETS[mode].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setPrompt(preset.prompt)}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-border/70 bg-muted/20 hover:bg-muted/60 hover:border-foreground/30 text-foreground transition-all cursor-pointer active:scale-95 truncate max-w-xs"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mode 1 Controls: Engine Tier & Canvas Aspect Ratio for Artwork */}
                  {mode === "image" && (
                    <div className="space-y-4 pt-1 border-t border-border/60">
                      {/* Engine Tier Cards */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Rendering Engine Tier
                          </label>
                          <span className="text-[11px] text-cyan-500 font-medium">
                            {imageModel === "sensenova" ? "High-Resolution 8B MoT" : "Instant 1-Step Latent"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setImageModel("sdxl-turbo")}
                            className={cn(
                              "p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer",
                              imageModel === "sdxl-turbo"
                                ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                                : "border-border/70 bg-card hover:bg-muted/40"
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-foreground">Standard (SDXL-Turbo)</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                20 credits
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground mt-1">
                              Ultra-fast 1–2s generation. Perfect for rapid prototyping &amp; album covers.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setImageModel("sensenova")}
                            className={cn(
                              "p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer",
                              imageModel === "sensenova"
                                ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                                : "border-border/70 bg-card hover:bg-muted/40"
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Sparkles className="size-3.5 text-purple-400" /> Advanced (SenseNova U1.5)
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                50 credits
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground mt-1">
                              8B MoT studio-grade rendering. Precise typography, hyper-detail &amp; promo flyers.
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Aspect Ratio Canvas */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Ratio className="size-3.5" /> Canvas Aspect Ratio
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { ratio: "1:1", label: "Square (1:1)", sub: "Vinyl / Album Art" },
                            { ratio: "16:9", label: "Landscape (16:9)", sub: "YouTube / Widescreen" },
                            { ratio: "9:16", label: "Portrait (9:16)", sub: "Reels / Stories" },
                          ].map((item) => (
                            <button
                              key={item.ratio}
                              type="button"
                              onClick={() => setAspectRatio(item.ratio)}
                              className={cn(
                                "p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer",
                                aspectRatio === item.ratio
                                  ? imageModel === "sensenova"
                                    ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                                    : "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                                  : "border-border/70 bg-card hover:bg-muted/40"
                              )}
                            >
                              <span className="text-xs font-bold text-foreground">{item.label}</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2 Controls: Engine Settings for AI Image Editor */}
                  {mode === "edit" && (
                    <div className="space-y-4 pt-1 border-t border-border/60">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <SlidersHorizontal className="size-3.5 text-purple-400" /> Output Quality
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {editQuality}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditQuality("standard")}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold border text-center transition cursor-pointer",
                                editQuality === "standard"
                                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                  : "border-border/60 text-muted-foreground hover:bg-muted/40"
                              )}
                            >
                              1024 Base
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditQuality("ultra")}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold border text-center transition cursor-pointer",
                                editQuality === "ultra"
                                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                  : "border-border/60 text-muted-foreground hover:bg-muted/40"
                              )}
                            >
                              2048 Ultra
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Layers className="size-3.5 text-purple-400" /> Image Guidance Scale
                            </span>
                            <span className="text-[11px] font-mono text-purple-400 font-bold">{editImgCfgScale.toFixed(1)}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 pt-1">
                            {[
                              { val: 0.8, label: "Subtle" },
                              { val: 1.0, label: "Balanced" },
                              { val: 1.5, label: "Strong" },
                            ].map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => setEditImgCfgScale(item.val)}
                                className={cn(
                                  "py-1.5 rounded-lg text-xs font-medium border text-center transition cursor-pointer",
                                  editImgCfgScale === item.val
                                    ? "border-purple-500 bg-purple-500/10 text-purple-400 font-semibold"
                                    : "border-border/60 text-muted-foreground hover:bg-muted/40"
                                )}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 3 Controls: Video Aspect Ratio */}
                  {mode === "video" && (
                    <div className="space-y-3 pt-1 border-t border-border/60">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pt-2">
                        <Ratio className="size-3.5" /> Video Format
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { ratio: "16:9", label: "Landscape (16:9)", sub: "Widescreen / YouTube" },
                          { ratio: "9:16", label: "Portrait (9:16)", sub: "Reels / TikTok / Shorts" },
                          { ratio: "1:1", label: "Square (1:1)", sub: "Instagram / Canvas" },
                        ].map((item) => (
                          <button
                            key={item.ratio}
                            type="button"
                            onClick={() => setAspectRatio(item.ratio)}
                            className={cn(
                              "p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer",
                              aspectRatio === item.ratio
                                ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                                : "border-border/70 bg-card hover:bg-muted/40"
                            )}
                          >
                            <span className="text-xs font-bold text-foreground">{item.label}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Studio Action Button */}
                  <div className="pt-2">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || (mode === "edit" && !sourceImageBase64)}
                      className={cn(
                        "w-full h-12 text-sm sm:text-base font-bold rounded-xl transition-all shadow-md cursor-pointer",
                        cfg.primaryColor
                      )}
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <Disc3 className="size-5 animate-spin" />
                          <span>
                            {mode === "image"
                              ? imageModel === "sensenova"
                                ? "Rendering SenseNova 8B MoT..."
                                : "Rendering SDXL-Turbo Visual..."
                              : mode === "edit"
                              ? "Applying SenseNova AI Edits..."
                              : "Synthesizing Wan2.1 Video Clip..."}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <IconComp className="size-5" />
                          <span>
                            {mode === "image"
                              ? "Generate 4K Artwork"
                              : mode === "edit"
                              ? "Transform Image with SenseNova"
                              : "Generate Video Visualizer"}
                          </span>
                          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/20 text-white">
                            {mode === "image" && imageModel === "sensenova"
                              ? "50 credits"
                              : `${cfg.creditCost} credits`}
                          </span>
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Live Visual Deck & Preview Canvas (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border bg-card shadow-xs rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-muted/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                      <Eye className={cn("size-4", cfg.accentText)} />
                      Studio Visual Deck
                    </CardTitle>
                    {activeMediaUrl && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                      >
                        Live Preview
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Real-time high-fidelity preview canvas and export controls.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Canvas Viewport */}
                  <div
                    className={cn(
                      "w-full rounded-2xl bg-muted/30 border border-dashed border-border/80 flex items-center justify-center overflow-hidden shadow-inner relative group",
                      mode === "video" ? "aspect-video" : "aspect-square"
                    )}
                  >
                    {activeMediaUrl?.type === "video" ? (
                      <video
                        src={activeMediaUrl.url}
                        controls
                        autoPlay
                        loop
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : activeMediaUrl?.type === "image" ? (
                      <img
                        src={activeMediaUrl.url}
                        alt="Active Studio Preview"
                        className="w-full h-full object-cover rounded-xl shadow-sm"
                      />
                    ) : mode === "edit" && sourceImageBase64 ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={sourceImageBase64}
                          alt="Original Upload"
                          className="w-full h-full object-cover rounded-xl opacity-60"
                        />
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                          <ArrowRight className="size-8 text-purple-400 animate-pulse mb-2" />
                          <span className="text-xs font-semibold text-foreground">Source Image Staged</span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            Click &quot;Transform Image&quot; to synthesize edit
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 flex flex-col items-center text-center p-6">
                        <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/60">
                          {mode === "video" ? <Video className="size-7" /> : <ImageIcon className="size-7" />}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          Canvas ready for rendering
                        </span>
                        <span className="text-[11px] text-muted-foreground/70 max-w-xs">
                          {mode === "image"
                            ? "Generated artwork renders at 1024×1024 or 2048×2048."
                            : mode === "edit"
                            ? "Upload a reference image above to transform."
                            : "Generated MP4 video loops will play here."}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mode-Specific Before vs After Strip for AI Image Editor */}
                  {mode === "edit" && editedResultUrl && sourceImageBase64 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded-xl border border-border/60 bg-muted/20">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                          Original Reference
                        </span>
                        <img
                          src={sourceImageBase64}
                          alt="Original"
                          className="w-full aspect-video object-cover rounded-lg border border-border/60"
                        />
                      </div>
                      <div className="p-2 rounded-xl border border-purple-500/40 bg-purple-500/10">
                        <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">
                          SenseNova Edit
                        </span>
                        <img
                          src={editedResultUrl}
                          alt="Edited"
                          className="w-full aspect-video object-cover rounded-lg border border-purple-500/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions & Export Toolbar */}
                  {activeMediaUrl && (
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {activeMediaUrl.title || "Untitled Generation"}
                        </p>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {activeMediaUrl.type === "video" ? "MP4 H.264 · 24fps" : "PNG · Studio Lossless"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={activeMediaUrl.url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all",
                            cfg.primaryColor
                          )}
                        >
                          <Download className="size-3.5" />
                          Download
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Media History Gallery (Mirrored from Music Studio library) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">Studio Visuals &amp; Video Library</h2>
              </div>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border/60">
                {mediaList?.length ?? 0} media saved
              </span>
            </div>

            {!mediaList || mediaList.length === 0 ? (
              <Card className="border-dashed border-border/80 bg-card/40">
                <CardContent className="py-12 text-center space-y-2">
                  <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/60">
                    <Clapperboard className="size-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No media generated yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Create your first 4K album artwork or video visualizer above to build your studio media catalogue.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaList.map((item) => (
                  <Card
                    key={item._id}
                    className="border-border/70 bg-card/80 hover:border-primary/40 transition-all overflow-hidden group flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-muted/40 relative flex items-center justify-center overflow-hidden">
                      {item.url ? (
                        item.type === "video" ? (
                          <video src={item.url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.prompt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">Preview unavailable</span>
                      )}
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-md text-foreground border border-border/40 shadow-xs">
                        {item.type}
                      </span>
                    </div>

                    <CardContent className="p-3.5 space-y-2">
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                        {item.prompt}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/50">
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Calendar className="size-3" />
                          {formatDistanceToNow(new Date(item._creationTime), { addSuffix: true })}
                        </span>
                        {item.url && (
                          <a
                            href={item.url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline font-semibold flex items-center gap-1 text-xs"
                          >
                            <Download className="size-3" /> Download
                          </a>
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
