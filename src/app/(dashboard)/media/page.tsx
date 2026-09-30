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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  badge?: string;
  badgeColor?: string;
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
    label: "AI Image Generator",
    accentBg: "bg-cyan-50 dark:bg-cyan-950/30",
    accentText: "text-cyan-600 dark:text-cyan-400",
    accentBorder: "border-cyan-200 dark:border-cyan-900/50",
    primaryColor: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20",
    creditCost: 20,
    description: "Create studio-grade visuals, concept art, graphics, typography posters, and cover designs.",
    promptPlaceholder: "e.g. Cyberpunk neon vinyl album art with glowing typography CADENCE...",
  },
  edit: {
    icon: Sparkles,
    label: "AI Image Editor",
    accentBg: "bg-purple-50 dark:bg-purple-950/30",
    accentText: "text-purple-600 dark:text-purple-400",
    accentBorder: "border-purple-200 dark:border-purple-900/50",
    primaryColor: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20",
    creditCost: 50,
    description: "Transform existing artwork with natural language instructions, inpainting, multi-image references, and lighting reworks.",
    promptPlaceholder: "e.g. Change background to futuristic neon concert stage, add rim lighting and holograms...",
  },
  video: {
    icon: Video,
    label: "Video Visualizers",
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
    { label: "Festival Flyer", prompt: "A stylish music festival flyer poster in English typography. Headline text 'SOUNDWAVE 2026' in bold modern 3D lettering at the top. Subheading text 'LIVE AT HYDE PARK' and date text 'OCTOBER 15-18'. Clean graphic design layout, vivid geometric shapes, hologram gradients, professional print advertising style, 8k resolution" },
    { label: "Comic Book Panel", prompt: "A dynamic comic book panel with English speech bubbles. A superhero in glowing armor shouting into a speech bubble 'STAND BACK! I GOT THIS!' with explosive action lines, Halftone dot textures, vintage Marvel and DC comic art style, crisp ink linework, bold comic lettering" },
    { label: "Cyberpunk Vinyl", prompt: "Cyberpunk neon vinyl album art with glowing typography CADENCE, reflective acrylic surfaces and holographic foil details" },
    { label: "Transparent Sticker", prompt: "A cute futuristic robotic cat DJ mascot wearing glowing neon headphones with vinyl turntables, vector illustration, die-cut sticker design with crisp clean edges" },
  ],
  edit: [
    { label: "Add Neon Armor", prompt: "Add futuristic glowing holographic power armor to the subject with energy trails and cinematic rim lighting" },
    { label: "Cyber Concert Stage", prompt: "Change background to a neon cyberpunk concert stage with crowd lasers and stage smoke" },
    { label: "Vintage Comic Style", prompt: "Transform into a vintage 1980s superhero comic panel with halftone ink dots, yellowed paper texture, and bold action lines" },
    { label: "Transparent Cutout", prompt: "Isolate the main subject onto a clean transparent alpha background with perfect edge cutout" },
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
  const [imageModel, setImageModel] = useState<"sdxl-turbo" | "sensenova" | "qwen-image-2-1">("sdxl-turbo");
  const [imageQuality, setImageQuality] = useState<"standard" | "ultra">("standard");
  const [isTransparent, setIsTransparent] = useState(false);

  // Image Edit State (Qwen-Image-2.1 / SenseNova U1.5 MoT)
  const [editModel, setEditModel] = useState<"qwen-image-2-1" | "sensenova">("qwen-image-2-1");
  const [sourceImages, setSourceImages] = useState<Array<{ name: string; base64: string }>>([]);
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxAllowed = editModel === "sensenova" ? 4 : 1;
    const currentCount = sourceImages.length;
    const remainingSlots = maxAllowed - currentCount;

    if (remainingSlots <= 0) {
      toast.error(
        editModel === "qwen-image-2-1"
          ? "Qwen-Image-2.1 is optimized for single-image precision restyling (switch to SenseNova for up to 4 images)"
          : `Maximum of ${maxAllowed} reference images reached`
      );
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image (PNG, JPG, WEBP)`);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 15MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const b64 = event.target?.result as string;
        setSourceImages((prev) => {
          if (prev.length >= maxAllowed) return prev;
          return [...prev, { name: file.name, base64: b64 }];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSourceImage = (index: number) => {
    setSourceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const switchMode = (next: VisualMode) => {
    setMode(next);
    setPrompt("");
  };

  const handleGenerate = async () => {
    if (mode === "edit") {
      if (sourceImages.length === 0) {
        toast.error("Please upload at least one image to edit or reference!");
        return;
      }
      if (!prompt.trim()) {
        toast.error("Please describe what changes or styling to apply.");
        return;
      }

      setIsGenerating(true);
      try {
        if (editModel === "qwen-image-2-1") {
          toast.info("Transforming via Qwen-Image-2.1 with multi-image contextual editing (Modal GPU)…");
        } else {
          toast.info("Transforming image via SenseNova-U1.5-8B MoT (Modal GPU)…");
        }
        const res = await editMutation.mutateAsync({
          prompt,
          images: sourceImages.map((s) => s.base64),
          model: editModel,
          quality: editQuality,
          transparent: isTransparent,
          imgCfgScale: editImgCfgScale,
        });

        if (res.url) {
          setEditedResultUrl(res.url);
          setActiveMediaUrl({ url: res.url, type: "image", title: `[Edit] ${prompt}` });
        }
        refetch();
        toast.success(editModel === "qwen-image-2-1" ? "Qwen-Image-2.1 AI edit complete!" : "SenseNova AI edit complete!");
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
        if (imageModel === "qwen-image-2-1") {
          toast.info("Rendering studio visual on Modal GPU via Qwen-Image-2.1 (7B DiT + 8B Qwen3-VL)…");
        } else if (imageModel === "sensenova") {
          toast.info("Rendering studio-grade artwork via SenseNova 8B MoT (Modal GPU)…");
        } else {
          toast.info("Rendering fast 1024x1024 visual on Modal GPU via SDXL-Turbo…");
        }
        const res = await imageMutation.mutateAsync({
          prompt,
          aspectRatio,
          model: imageModel,
          quality: imageQuality,
          transparent: isTransparent,
        });
        if (res.url) setActiveMediaUrl({ url: res.url, type: "image", title: prompt });
        refetch();
        toast.success(
          imageModel === "qwen-image-2-1"
            ? "Qwen-Image-2.1 artwork rendered!"
            : imageModel === "sensenova"
            ? "SenseNova visual rendered!"
            : "Image generated successfully!"
        );
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
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Visuals &amp; Video Studio
                  </h1>
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
                    label: "AI Image Generator",
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
                        ? imageModel === "qwen-image-2-1"
                          ? "Qwen-Image-2.1 Typography, Flyers & RGBA Studio"
                          : imageModel === "sensenova"
                          ? "SenseNova 8B MoT Studio Canvas"
                          : "SDXL-Turbo Fast Artwork & Style Canvas"
                        : mode === "edit"
                        ? editModel === "qwen-image-2-1"
                          ? "Qwen-Image-2.1 Contextual Multi-Image Studio Editor"
                          : "SenseNova Neural Image Inpainting & Transform"
                        : "Cinematic Motion & Video Synthesis"}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Modal Accelerated
                    </span>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {mode === "image"
                      ? imageModel === "qwen-image-2-1"
                        ? "Synthesize posters, festival flyers with legible English text, comic panels, or transparent PNGs."
                        : imageModel === "sensenova"
                        ? "8B MoT studio-grade rendering with high dynamic range, hyper-detail, and rich textures."
                        : "Ultra-fast 1–2s latent diffusion for rapid prototyping and vinyl album covers."
                      : mode === "edit"
                      ? editModel === "qwen-image-2-1"
                        ? "Upload up to 10 image references for character consistency, style transfer, and background replacement."
                        : "Upload a reference visual and provide natural language editing instructions for SenseNova 8B MoT."
                      : "Describe scene dynamics, camera movements, and audio-visual flow."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 space-y-5">
                  {/* TOP-LEVEL ENGINE SELECTOR (Radio card layout inspired by clean UI pattern) */}
                  {mode === "image" && (
                    <div className="space-y-3 pb-3 border-b border-border/60">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <SlidersHorizontal className="size-3.5 text-cyan-400" /> Rendering Engine
                        </label>
                        <span className="text-[11px] font-mono text-cyan-500 font-medium">
                          {imageModel === "sdxl-turbo"
                            ? "SDXL-Turbo · 20 Credits"
                            : imageModel === "sensenova"
                            ? "SenseNova U1.5 · 50 Credits"
                            : "Qwen-Image-2.1 · 50 Credits"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. SDXL-Turbo */}
                        <div
                          role="radio"
                          aria-checked={imageModel === "sdxl-turbo"}
                          onClick={() => setImageModel("sdxl-turbo")}
                          className={cn(
                            "relative p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer group select-none h-full",
                            imageModel === "sdxl-turbo"
                              ? "border-cyan-500/80 bg-cyan-500/5 ring-1 ring-cyan-500/20 shadow-xs"
                              : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className="pt-0.5 shrink-0">
                            <div
                              className={cn(
                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                imageModel === "sdxl-turbo"
                                  ? "border-cyan-500 bg-cyan-500"
                                  : "border-muted-foreground/40 group-hover:border-muted-foreground/70"
                              )}
                            >
                              {imageModel === "sdxl-turbo" && (
                                <div className="size-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs sm:text-sm font-semibold text-foreground">
                                SDXL-Turbo
                              </span>
                              <span className="text-[10px] font-medium text-cyan-500/90">
                                20 credits
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                              Quick prompt-to-image in seconds. Great for rough drafts, cover ideas &amp; rapid iteration.
                            </p>
                          </div>
                        </div>

                        {/* 2. SenseNova U1.5 */}
                        <div
                          role="radio"
                          aria-checked={imageModel === "sensenova"}
                          onClick={() => setImageModel("sensenova")}
                          className={cn(
                            "relative p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer group select-none h-full",
                            imageModel === "sensenova"
                              ? "border-cyan-500/80 bg-cyan-500/5 ring-1 ring-cyan-500/20 shadow-xs"
                              : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className="pt-0.5 shrink-0">
                            <div
                              className={cn(
                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                imageModel === "sensenova"
                                  ? "border-cyan-500 bg-cyan-500"
                                  : "border-muted-foreground/40 group-hover:border-muted-foreground/70"
                              )}
                            >
                              {imageModel === "sensenova" && (
                                <div className="size-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs sm:text-sm font-semibold text-foreground">
                                SenseNova U1.5
                              </span>
                              <span className="text-[10px] font-medium text-cyan-500/90">
                                50 credits
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                              8B MoT diffusion with tuned CFG &amp; timestep control. Rich detail, cinematic lighting &amp; studio-grade artwork.
                            </p>
                          </div>
                        </div>

                        {/* 3. Qwen-Image-2.1 */}
                        <div
                          role="radio"
                          aria-checked={imageModel === "qwen-image-2-1"}
                          onClick={() => setImageModel("qwen-image-2-1")}
                          className={cn(
                            "relative p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer group select-none h-full",
                            imageModel === "qwen-image-2-1"
                              ? "border-cyan-500/80 bg-cyan-500/5 ring-1 ring-cyan-500/20 shadow-xs"
                              : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className="pt-0.5 shrink-0">
                            <div
                              className={cn(
                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                imageModel === "qwen-image-2-1"
                                  ? "border-cyan-500 bg-cyan-500"
                                  : "border-muted-foreground/40 group-hover:border-muted-foreground/70"
                              )}
                            >
                              {imageModel === "qwen-image-2-1" && (
                                <div className="size-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs sm:text-sm font-semibold text-foreground">
                                Qwen-Image-2.1
                              </span>
                              <span className="text-[10px] font-medium text-cyan-500/90">
                                50 credits
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                              7B DiT + Qwen3-VL with native transparency support. Precise text rendering, posters, flyers &amp; PNG exports.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {mode === "edit" && (
                    <div className="space-y-3 pb-3 border-b border-border/60">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <SlidersHorizontal className="size-3.5 text-purple-400" /> Editing Engine
                        </label>
                        <span className="text-[11px] font-mono text-purple-500 font-medium">
                          {editModel === "sensenova"
                            ? "SenseNova U1.5 · Up to 4 images"
                            : "Qwen-Image-2.1 · Up to 10 images"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 1. SenseNova U1.5 Edit */}
                        <div
                          role="radio"
                          aria-checked={editModel === "sensenova"}
                          onClick={() => setEditModel("sensenova")}
                          className={cn(
                            "relative p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer group select-none h-full",
                            editModel === "sensenova"
                              ? "border-purple-500/80 bg-purple-500/5 ring-1 ring-purple-500/20 shadow-xs"
                              : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className="pt-0.5 shrink-0">
                            <div
                              className={cn(
                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                editModel === "sensenova"
                                  ? "border-purple-500 bg-purple-500"
                                  : "border-muted-foreground/40 group-hover:border-muted-foreground/70"
                              )}
                            >
                              {editModel === "sensenova" && (
                                <div className="size-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs sm:text-sm font-semibold text-foreground">
                                SenseNova U1.5 Edit
                              </span>
                              <span className="text-[10px] font-medium text-purple-500/90">
                                50 credits · up to 4 imgs
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                              Image-to-image editing with CFG strength control. Background swaps, style transfer &amp; inpainting on 1–4 images.
                            </p>
                          </div>
                        </div>

                        {/* 2. Qwen-Image-2.1 Edit */}
                        <div
                          role="radio"
                          aria-checked={editModel === "qwen-image-2-1"}
                          onClick={() => setEditModel("qwen-image-2-1")}
                          className={cn(
                            "relative p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer group select-none h-full",
                            editModel === "qwen-image-2-1"
                              ? "border-purple-500/80 bg-purple-500/5 ring-1 ring-purple-500/20 shadow-xs"
                              : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className="pt-0.5 shrink-0">
                            <div
                              className={cn(
                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                editModel === "qwen-image-2-1"
                                  ? "border-purple-500 bg-purple-500"
                                  : "border-muted-foreground/40 group-hover:border-muted-foreground/70"
                              )}
                            >
                              {editModel === "qwen-image-2-1" && (
                                <div className="size-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs sm:text-sm font-semibold text-foreground">
                                Qwen-Image-2.1 Edit
                              </span>
                              <span className="text-[10px] font-medium text-purple-500/90">
                                50 credits · Single image precision
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                              High-fidelity single-image restyling, lighting &amp; sharp English typography. <span className="text-muted-foreground/80 italic">(Note: native multi-image cross-attention requires dedicated 80GB H100 infrastructure; use SenseNova for 1–4 image composites)</span>.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode-Specific: Multi-Image Reference & Upload Dropzone for Image Editor */}
                  {mode === "edit" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <UploadCloud className="size-4 text-purple-400" />
                          Source Images &amp; References
                        </label>
                        <span className="text-[11px] text-muted-foreground">
                          {sourceImages.length} / {editModel === "qwen-image-2-1" ? 10 : 4} images
                        </span>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {sourceImages.length === 0 ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-border/80 hover:border-purple-500/50 rounded-2xl p-6 text-center bg-muted/10 hover:bg-purple-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                        >
                          <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <UploadCloud className="size-6" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground block">
                              Click to upload image references or drag &amp; drop
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5 block">
                              {editModel === "qwen-image-2-1"
                                ? "Qwen-Image-2.1 supports up to 10 contextual images for character & scene editing"
                                : "Upload up to 4 images for SenseNova U1.5 transformation"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {sourceImages.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative group rounded-xl overflow-hidden border border-purple-500/30 bg-purple-500/5 aspect-square flex flex-col justify-end p-2"
                              >
                                <img
                                  src={img.base64}
                                  alt={img.name}
                                  className="absolute inset-0 size-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSourceImage(idx);
                                  }}
                                  className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <X className="size-3.5" />
                                </button>
                                <span className="relative z-10 text-[10px] font-mono text-white/90 truncate">
                                  #{idx + 1} {img.name}
                                </span>
                              </div>
                            ))}
                            {sourceImages.length < (editModel === "qwen-image-2-1" ? 10 : 4) && (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border/80 hover:border-purple-500/50 rounded-xl p-3 text-center bg-muted/10 hover:bg-purple-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 aspect-square"
                              >
                                <UploadCloud className="size-5 text-purple-400" />
                                <span className="text-[11px] font-semibold text-foreground">Add More</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                            <span className="flex items-center gap-1 text-purple-400 font-medium text-[11px]">
                              <Sparkles className="size-3" /> Ready for contextual multi-image editing
                            </span>
                            <button
                              type="button"
                              onClick={() => setSourceImages([])}
                              className="text-[11px] text-muted-foreground hover:text-red-400 underline cursor-pointer"
                            >
                              Clear all
                            </button>
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

                  {/* Mode 1 Secondary Settings: Canvas Aspect Ratio & Options */}
                  {mode === "image" && (
                    <div className="space-y-4 pt-1 border-t border-border/60">
                      {/* Aspect Ratio Canvas */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Ratio className="size-3.5" /> Canvas Aspect Ratio
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { ratio: "1:1", label: "Square (1:1)", sub: "Vinyl / Album" },
                            { ratio: "3:4", label: "Flyer (3:4)", sub: "Poster / Print" },
                            { ratio: "16:9", label: "Landscape (16:9)", sub: "YouTube / Deck" },
                            { ratio: "9:16", label: "Portrait (9:16)", sub: "Story / Reels" },
                          ].map((item) => (
                            <button
                              key={item.ratio}
                              type="button"
                              onClick={() => setAspectRatio(item.ratio)}
                              className={cn(
                                "p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer",
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

                      {/* Qwen Specific Features: Transparency & Resolution */}
                      {imageModel === "qwen-image-2-1" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Sparkles className="size-3.5 text-cyan-400" /> Native RGBA Transparency
                              </span>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Generate cutouts &amp; stickers with real transparent alpha channel
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsTransparent(!isTransparent)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ml-3",
                                isTransparent
                                  ? "bg-cyan-500 text-white border-cyan-400 shadow-xs"
                                  : "border-border/60 text-muted-foreground hover:bg-muted/40"
                              )}
                            >
                              {isTransparent ? "Enabled" : "Disabled"}
                            </button>
                          </div>

                          <div className="p-3 rounded-xl border border-border/70 bg-card flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <SlidersHorizontal className="size-3.5 text-cyan-400" /> Resolution Quality
                              </span>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Standard 1024 or Native Ultra 2048 high-res DiT
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 shrink-0 ml-3">
                              <button
                                type="button"
                                onClick={() => setImageQuality("standard")}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer",
                                  imageQuality === "standard"
                                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                                    : "border-border/60 text-muted-foreground hover:bg-muted/40"
                                )}
                              >
                                1024
                              </button>
                              <button
                                type="button"
                                onClick={() => setImageQuality("ultra")}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer",
                                  imageQuality === "ultra"
                                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                                    : "border-border/60 text-muted-foreground hover:bg-muted/40"
                                )}
                              >
                                2048
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 2 Secondary Settings: Fine-tuning for AI Image Editor */}
                  {mode === "edit" && (
                    <div className="space-y-4 pt-1 border-t border-border/60">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1.5">
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

                        {editModel === "qwen-image-2-1" ? (
                          <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Sparkles className="size-3.5 text-purple-400" /> RGBA Transparent Output
                              </span>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Cutout background with native alpha channel
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsTransparent(!isTransparent)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ml-3",
                                isTransparent
                                  ? "bg-purple-600 text-white border-purple-400 shadow-xs"
                                  : "border-border/60 text-muted-foreground hover:bg-muted/40"
                              )}
                            >
                              {isTransparent ? "Enabled" : "Disabled"}
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1.5">
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
                        )}
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
                      disabled={isGenerating || (mode === "edit" && sourceImages.length === 0)}
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
                              ? imageModel === "qwen-image-2-1"
                                ? "Rendering Qwen-Image-2.1 Studio Visual..."
                                : imageModel === "sensenova"
                                ? "Rendering SenseNova 8B MoT..."
                                : "Rendering SDXL-Turbo Visual..."
                              : mode === "edit"
                              ? editModel === "qwen-image-2-1"
                                ? "Transforming with Qwen-Image-2.1 Context..."
                                : "Applying SenseNova AI Edits..."
                              : "Synthesizing Wan2.1 Video Clip..."}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <IconComp className="size-5" />
                          <span>
                            {mode === "image"
                              ? imageModel === "qwen-image-2-1"
                                ? "Generate with Qwen-Image-2.1"
                                : imageModel === "sensenova"
                                ? "Generate with SenseNova"
                                : "Generate Fast Visual"
                              : mode === "edit"
                              ? editModel === "qwen-image-2-1"
                                ? "Transform with Qwen-Image-2.1"
                                : "Transform with SenseNova"
                              : "Generate Video Visualizer"}
                          </span>
                          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/20 text-white">
                            {mode === "image" && imageModel === "sdxl-turbo"
                              ? "20 credits"
                              : mode === "video"
                              ? "200 credits"
                              : "50 credits"}
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
                    {/* Canvas Viewport with Transparency Checkerboard */}
                    <div
                      className={cn(
                        "w-full rounded-2xl bg-muted/30 border border-dashed border-border/80 flex items-center justify-center overflow-hidden shadow-inner relative group",
                        mode === "video" ? "aspect-video" : "aspect-square",
                        isTransparent && "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"
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
                          className="w-full h-full object-contain rounded-xl shadow-sm"
                        />
                      ) : mode === "edit" && sourceImages.length > 0 ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={sourceImages[0].base64}
                            alt="Original Upload"
                            className="w-full h-full object-cover rounded-xl opacity-60"
                          />
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                            <ArrowRight className="size-8 text-purple-400 animate-pulse mb-2" />
                            <span className="text-xs font-semibold text-foreground">
                              {sourceImages.length} Image Reference{sourceImages.length > 1 ? "s" : ""} Staged
                            </span>
                            <span className="text-[11px] text-muted-foreground mt-0.5">
                              Click &quot;Transform Images&quot; to synthesize edit
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
                              ? "Generated artwork renders at 1024×1024 or 2048×2048 with English typography."
                              : mode === "edit"
                              ? "Upload reference images above to transform."
                              : "Generated MP4 video loops will play here."}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mode-Specific Before vs After Strip for AI Image Editor */}
                    {mode === "edit" && editedResultUrl && sourceImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded-xl border border-border/60 bg-muted/20">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                            Primary Reference
                          </span>
                          <img
                            src={sourceImages[0].base64}
                            alt="Original"
                            className="w-full aspect-video object-cover rounded-lg border border-border/60"
                          />
                        </div>
                        <div className="p-2 rounded-xl border border-purple-500/40 bg-purple-500/10">
                          <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">
                            {editModel === "qwen-image-2-1" ? "Qwen-Image-2.1 Edit" : "SenseNova Edit"}
                          </span>
                          <img
                            src={editedResultUrl}
                            alt="Edited"
                            className="w-full aspect-video object-contain rounded-lg border border-purple-500/50"
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
