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
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMediaUrl, setActiveMediaUrl] = useState<{ url: string; type: "image" | "video" } | null>(null);

  const { data: mediaList, refetch } = useQuery(trpc.studio.listMediaGenerations.queryOptions());

  const imageMutation = useMutation(trpc.studio.generateImage.mutationOptions());
  const videoMutation = useMutation(trpc.studio.generateVideo.mutationOptions());

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);
    try {
      toast.info("Rendering 1024x1024 visual on Modal GPU via SDXL-Turbo…");
      const res = await imageMutation.mutateAsync({ prompt: imagePrompt, aspectRatio });
      if (res.url) setActiveMediaUrl({ url: res.url, type: "image" });
      refetch();
      toast.success("Image generated successfully!");
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
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Wand2 className="h-4 w-4 text-cyan-500" /> Image / Album Cover Prompt
                </label>
                <Input
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe your album cover or visual art..."
                  className="bg-background"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {["1:1", "16:9", "9:16"].map((ratio) => (
                  <Button
                    key={ratio}
                    type="button"
                    variant={aspectRatio === ratio ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspectRatio(ratio)}
                    className="text-xs"
                  >
                    Aspect {ratio}
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-6 text-base mt-4"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-spin" /> Rendering Visual...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" /> Generate Image
                  </span>
                )}
              </Button>
            </div>

            <div className="rounded-xl border bg-card p-6 flex flex-col justify-between items-center text-center">
              <div className="w-full aspect-square rounded-lg bg-muted/40 border border-dashed flex items-center justify-center p-2 overflow-hidden">
                {activeMediaUrl?.type === "image" ? (
                  <img src={activeMediaUrl.url} alt="Generated visual" className="w-full h-full object-cover rounded-md" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {activeMediaUrl?.type === "image" ? "Generated image rendered above." : "High-resolution cover art will render here."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="video" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Wand2 className="h-4 w-4 text-purple-500" /> Video Visualizer Prompt
                </label>
                <Input
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="e.g. Glowing neon waves pulsing in rhythm, aerial drone over mountain..."
                  className="bg-background"
                />
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
                  <span className="flex items-center gap-2">
                    <Video className="h-5 w-5" /> Generate Video Clip
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
