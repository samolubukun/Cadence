"use client";

import { useState } from "react";
import { Clapperboard, Image as ImageIcon, Video, Wand2, Download, Sparkles, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";
import { formatDistanceToNow } from "date-fns";

export default function MediaStudioPage() {
  const trpc = useTRPC();
  const [imagePrompt, setImagePrompt] = useState("Cyberpunk neon vinyl album art with glowing typography CADENCE");
  const [videoPrompt, setVideoPrompt] = useState("Cinematic slow motion fluid sound waves pulsing in deep cosmic space");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageModel, setImageModel] = useState<"sdxl-turbo" | "sensenova">("sdxl-turbo");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMediaUrl, setActiveMediaUrl] = useState<{ url: string; type: "image" | "video" } | null>(null);

  const { data: mediaList, refetch } = useQuery(trpc.studio.listMediaGenerations.queryOptions());

  const imageMutation = useMutation(trpc.studio.generateImage.mutationOptions());
  const videoMutation = useMutation(trpc.studio.generateVideo.mutationOptions());

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);
    try {
      if (imageModel === "sensenova") {
        toast.info("Rendering studio-quality visual via SenseNova-U1.5-8B MoT (Modal GPU)…");
      } else {
        toast.info("Rendering 1024x1024 visual on Modal GPU via SDXL-Turbo…");
      }
      const res = await imageMutation.mutateAsync({ prompt: imagePrompt, aspectRatio, model: imageModel });
      if (res.url) setActiveMediaUrl({ url: res.url, type: "image" });
      refetch();
      toast.success(imageModel === "sensenova" ? "SenseNova visual rendered!" : "Image generated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setIsGenerating(true);
    try {
      toast.info("Generating video clip on Modal GPU via Wan2.1 1.3B…");
      const res = await videoMutation.mutateAsync({ prompt: videoPrompt, durationSeconds: 4 });
      if (res.url) setActiveMediaUrl({ url: res.url, type: "video" });
      refetch();
      toast.success("Video visualizer generated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Visuals & Video" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Clapperboard className="h-7 w-7 text-cyan-500" />
              Visuals &amp; Video Studio
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate photorealistic album artwork with SDXL-Turbo and cinematic video visualizers with Wan2.1.
            </p>
          </div>
        </div>

        <Tabs defaultValue="image" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> 4K Images &amp; Album Art
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" /> Video Visualizers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold flex items-center gap-1.5">
                    <Wand2 className="h-4 w-4 text-cyan-500" /> Image / Album Cover Prompt
                  </label>
                  <span className="text-[11px] text-muted-foreground font-medium">Click a preset below or enter custom</span>
                </div>
                <Input
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe your album cover or visual art..."
                  className="bg-background h-11 text-sm rounded-xl"
                />

                {/* Style preset chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[
                    "Cyberpunk neon vinyl album art with glowing typography CADENCE",
                    "Minimalist geometric matte vinyl sleeve with pastel gradients",
                    "Retro 80s anime city night illustration with rain reflections",
                    "Hyperrealistic 3D metallic liquid orb floating in obsidian void",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setImagePrompt(preset)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border/80 bg-background hover:bg-muted/60 hover:border-primary/40 text-foreground transition-all cursor-pointer active:scale-95 truncate max-w-xs"
                    >
                      {preset.slice(0, 32)}…
                    </button>
                  ))}
                </div>
              </div>

              {/* Engine Tier Selection */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rendering Engine Tier
                  </label>
                  <span className="text-[11px] text-cyan-500 font-medium">
                    {imageModel === "sensenova" ? "High-Resolution 8B MoT" : "Instant 1-Step Latent"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setImageModel("sdxl-turbo")}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      imageModel === "sdxl-turbo"
                        ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                        : "border-border/70 bg-card hover:bg-muted/40"
                    }`}
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
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      imageModel === "sensenova"
                        ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                        : "border-border/70 bg-card hover:bg-muted/40"
                    }`}
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

              {/* Visual Aspect Ratio Cards */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Aspect Ratio Canvas
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
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        aspectRatio === item.ratio
                          ? imageModel === "sensenova"
                            ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                            : "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                          : "border-border/70 bg-card hover:bg-muted/40"
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className={`w-full text-white font-semibold py-6 text-base mt-4 transition-all ${
                  imageModel === "sensenova"
                    ? "bg-purple-600 hover:bg-purple-500"
                    : "bg-cyan-600 hover:bg-cyan-500"
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-spin" />
                    {imageModel === "sensenova" ? "Rendering SenseNova 8B..." : "Rendering Visual..."}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ImageIcon className="h-5 w-5" /> Generate Image
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white/90">
                      {imageModel === "sensenova" ? "50 credits" : "20 credits"}
                    </span>
                  </span>
                )}
              </Button>
            </div>

            <div className="rounded-xl border bg-card p-6 flex flex-col justify-between items-center text-center">
              <div className="w-full aspect-square rounded-xl bg-muted/30 border border-dashed flex items-center justify-center p-2 overflow-hidden shadow-inner">
                {activeMediaUrl?.type === "image" ? (
                  <img src={activeMediaUrl.url} alt="Generated visual" className="w-full h-full object-cover rounded-lg shadow-sm" />
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground font-medium">Ready for rendering</span>
                  </div>
                )}
              </div>
              {activeMediaUrl?.type === "image" && (
                <div className="w-full pt-4 flex items-center justify-between border-t border-border/40 text-xs">
                  <span className="font-mono text-muted-foreground">1024 × 1024</span>
                  <a
                    href={activeMediaUrl.url}
                    download
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <Download className="size-3" /> Download PNG
                  </a>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="video" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold flex items-center gap-1.5">
                    <Wand2 className="h-4 w-4 text-purple-500" /> Video Visualizer Prompt
                  </label>
                  <span className="text-[11px] text-muted-foreground font-medium">Click a preset below or enter custom</span>
                </div>
                <Input
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Describe your video visualizer or scene..."
                  className="bg-background h-11 text-sm rounded-xl"
                />

                {/* Video Style suggestions chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[
                    "Cinematic slow motion fluid sound waves pulsing in deep cosmic space",
                    "Hyper-lapse neon Tokyo highway rain reflections with anamorphic lens flare",
                    "Retro 80s wireframe grid terrain flying forward into purple digital sunset",
                    "Abstract iridescent metallic liquid ripples vibrating to bass frequencies",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setVideoPrompt(preset)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border/80 bg-background hover:bg-muted/60 hover:border-primary/40 text-foreground transition-all cursor-pointer active:scale-95 truncate max-w-xs"
                    >
                      {preset.slice(0, 32)}…
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Aspect Ratio Tiles */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Video Canvas
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
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        aspectRatio === item.ratio
                          ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                          : "border-border/70 bg-card hover:bg-muted/40"
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateVideo}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-6 text-base mt-4"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-spin" /> Generating Video Clip...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Video className="h-5 w-5" /> Generate Video Clip
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white/90">
                      200 credits
                    </span>
                  </span>
                )}
              </Button>
            </div>

            <div className="rounded-xl border bg-card p-6 flex flex-col justify-between items-center text-center">
              <div className="w-full aspect-video rounded-lg bg-muted/40 border border-dashed flex items-center justify-center p-2 overflow-hidden">
                {activeMediaUrl?.type === "video" ? (
                  <video src={activeMediaUrl.url} controls autoPlay loop className="w-full h-full object-cover rounded-md" />
                ) : (
                  <Video className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {activeMediaUrl?.type === "video" ? "Generated video playing above." : "Generated MP4 video clips will play here."}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Media History Gallery */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-500" />
              <h2 className="text-base font-semibold text-foreground">Past Visuals &amp; Videos</h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {mediaList?.length ?? 0} saved
            </span>
          </div>

          {!mediaList || mediaList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No previous images or video visualizers found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaList.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/15 overflow-hidden hover:border-border transition group"
                >
                  <div className="aspect-video bg-muted/40 relative flex items-center justify-center overflow-hidden">
                    {item.url ? (
                      item.type === "video" ? (
                        <video src={item.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">Preview unavailable</span>
                    )}
                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-background/80 backdrop-blur-xs text-foreground shadow-xs">
                      {item.type}
                    </span>
                  </div>

                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-foreground line-clamp-2">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item._creationTime), { addSuffix: true })}
                      </span>
                      {item.url && (
                        <a
                          href={item.url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground text-primary flex items-center gap-0.5 text-xs font-medium"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
                      )}
                    </div>
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
