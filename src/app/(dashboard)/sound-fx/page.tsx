"use client";

import { useState } from "react";
import { Sparkles, Play, Volume2, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";

export default function SoundEffectsPage() {
  const trpc = useTRPC();
  const [prompt, setPrompt] = useState("Footsteps in wet gravel with distant rolling thunder");
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateMutation = useMutation(trpc.studio.generateSound.mutationOptions());

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a sound description");
      return;
    }
    setIsGenerating(true);
    try {
      toast.info("Generating Foley effect via AudioGen...");
      const res = await generateMutation.mutateAsync({ prompt, duration });
      if (res.url) setAudioUrl(res.url);
      toast.success("Sound effect generated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate sound effect");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Sound FX Studio" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Sparkles className="h-7 w-7 text-amber-500" />
              Sound Effects Studio
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate lifelike sound effects, environmental ambience, and cinematic Foley powered by Meta AudioGen.
            </p>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-1.5">
              <Wand2 className="h-4 w-4 text-amber-500" /> Sound Description Prompt
            </label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Laser blast in empty corridor, coffee brewing in cozy diner, spaceship engine hum..."
              className="bg-background"
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Duration: {duration} seconds</span>
              <span>Max: 30s</span>
            </div>
            <Slider
              value={[duration]}
              min={1}
              max={30}
              step={1}
              onValueChange={([val]) => setDuration(val)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-6 text-base"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-spin" /> Synthesizing Foley...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" /> Generate Sound FX
              </span>
            )}
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 flex flex-col justify-between">
          <div className="space-y-4 text-center">
            <div className="mx-auto w-24 h-24 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Volume2 className="h-12 w-12 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Audio Preview</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Generated Foley and environmental sound clips will appear here.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-4 border border-dashed text-xs text-muted-foreground text-center">
            {audioUrl ? (
              <audio src={audioUrl} controls className="w-full" />
            ) : (
              "Player ready for your sound prompt."
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
