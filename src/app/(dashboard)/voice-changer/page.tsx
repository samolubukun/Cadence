"use client";

import { useState } from "react";
import { Mic2, Play, Volume2, UploadCloud, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";

export default function VoiceChangerPage() {
  const trpc = useTRPC();
  const [pitchShift, setPitchShift] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetVoice, setTargetVoice] = useState("voices/system/jd704hxf4y0cy4xtpgep735ek98e4ng8");

  const convertMutation = useMutation(trpc.studio.convertVoice.mutationOptions());

  const handleConvert = async () => {
    setIsProcessing(true);
    try {
      toast.info("Morphing voice timbre on Modal GPU...");
      await convertMutation.mutateAsync({
        targetVoiceKey: targetVoice,
        pitchShift,
      });
      toast.success("Voice conversion complete!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to convert voice");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Voice Changer" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Mic2 className="h-7 w-7 text-pink-500" />
              Speech-to-Speech &amp; Voice Changer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Zero-shot voice conversion: preserve your exact emotion, pitch dynamics, and rhythm while morphing timbre.
            </p>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-pink-500" /> 1. Input Audio / Recording
          </h3>
          <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-3 bg-muted/20">
            <Mic2 className="h-10 w-10 text-muted-foreground mx-auto" />
            <div className="text-sm font-medium">Record or drop an audio file</div>
            <p className="text-xs text-muted-foreground">Supports WAV, MP3, M4A up to 10MB</p>
            <Button variant="outline" size="sm" className="mt-2">
              Browse Audio File
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pitch Transposition: {pitchShift > 0 ? `+${pitchShift}` : pitchShift} semitones</span>
              <span>(-12 = Male, +12 = Female)</span>
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

        <div className="space-y-4 rounded-xl border bg-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-pink-500" /> 2. Target Voice Timbre
            </h3>
            <p className="text-xs text-muted-foreground">
              Select any Cadence system voice or custom cloned voice to adopt.
            </p>
            <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-medium">Default Studio Voice</span>
              <span className="text-xs text-muted-foreground">English (US)</span>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-6 text-base mt-6"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" /> Converting Voice...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mic2 className="h-5 w-5" /> Morph Audio
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
}
