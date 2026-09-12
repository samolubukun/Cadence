"use client";

import { useState } from "react";
import { Mic2, Play, Volume2, UploadCloud, RefreshCw, Clock, Download, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";
import { formatDistanceToNow } from "date-fns";

export default function VoiceChangerPage() {
  const trpc = useTRPC();
  const [pitchShift, setPitchShift] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetVoice, setTargetVoice] = useState("voices/system/jd704hxf4y0cy4xtpgep735ek98e4ng8");
  const [targetMode, setTargetMode] = useState<"custom" | "preset">("custom");
  const [targetFileName, setTargetFileName] = useState<string | null>(null);
  const [targetBase64, setTargetBase64] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [sourceBase64, setSourceBase64] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const { data: voicesData } = useQuery(trpc.voices.getAll.queryOptions());
  const { data: conversions, refetch } = useQuery(trpc.studio.listVoiceConversions.queryOptions());
  const convertMutation = useMutation(trpc.studio.convertVoice.mutationOptions());

  const allVoices = [...(voicesData?.system ?? []), ...(voicesData?.custom ?? [])];

  const handleSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceFileName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setSourceBase64(base64);
    };
  };

  const handleTargetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTargetFileName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setTargetBase64(base64);
    };
  };

  const handleConvert = async () => {
    setIsProcessing(true);
    try {
      toast.info("Morphing voice timbre on Modal GPU via OpenVoice v2…");
      const res = await convertMutation.mutateAsync({
        targetVoiceKey: targetMode === "preset" ? targetVoice : undefined,
        targetBase64Audio: targetMode === "custom" && targetBase64 ? targetBase64 : undefined,
        sourceBase64Audio: sourceBase64 || undefined,
        pitchShift,
      });
      if (res.url) setAudioUrl(res.url);
      refetch();
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-8">
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
            <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-2.5 bg-muted/10">
              <Mic2 className="h-8 w-8 text-pink-500 mx-auto" />
              <div className="text-xs font-semibold text-foreground">
                {sourceFileName ? sourceFileName : "Record or upload spoken audio"}
              </div>
              <p className="text-[11px] text-muted-foreground">Supports WAV, MP3, M4A up to 10MB</p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted cursor-pointer transition">
                <span>{sourceFileName ? "Change Source Audio" : "Browse Audio File"}</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleSourceFileChange}
                />
              </label>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-foreground">Pitch Tuning</span>
                <span className="font-mono text-muted-foreground">
                  {pitchShift === 0 ? "Original Pitch (0)" : `${pitchShift > 0 ? `+${pitchShift}` : pitchShift} st`}
                </span>
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
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border w-fit">
                <button
                  type="button"
                  onClick={() => setTargetMode("custom")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    targetMode === "custom"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload Target Reference
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode("preset")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    targetMode === "preset"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Library Voices
                </button>
              </div>

              {targetMode === "custom" ? (
                <div className="border-2 border-dashed rounded-xl p-5 text-center space-y-2 bg-muted/10">
                  <UploadCloud className="h-7 w-7 text-pink-500 mx-auto" />
                  <p className="text-xs font-semibold text-foreground">
                    {targetFileName ? targetFileName : "Upload reference voice audio"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Upload a 5–20s clean sample of the voice you want to copy.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted cursor-pointer transition">
                    <span>{targetFileName ? "Change Target Audio" : "Select Target File"}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleTargetFileChange}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Select any Cadence system voice or custom cloned voice to adopt.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {allVoices.length === 0 ? (
                      <div className="p-3 rounded-lg border bg-muted/20 text-xs text-muted-foreground col-span-2 text-center">
                        Loading voices…
                      </div>
                    ) : (
                      allVoices.map((v) => {
                        const isSelected = targetVoice === `voices/${v.variant.toLowerCase()}/${v.id}` || targetVoice === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setTargetVoice(`voices/${v.variant.toLowerCase()}/${v.id}`)}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                              isSelected
                                ? "border-pink-500 bg-pink-500/10 ring-1 ring-pink-500/30"
                                : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-semibold text-xs text-foreground truncate">{v.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-mono text-muted-foreground">
                                {v.language}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground capitalize mt-0.5">
                              {v.category.toLowerCase()}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {audioUrl && (
                <div className="p-4 rounded-xl bg-card border shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      Morphed Audio Result
                    </span>
                    <a
                      href={audioUrl}
                      download
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      <Download className="size-3" /> Save WAV
                    </a>
                  </div>
                  <audio src={audioUrl} controls className="w-full h-10" />
                </div>
              )}
            </div>

            <Button
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-6 text-base mt-6"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" /> Converting Voice…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mic2 className="h-5 w-5" /> Morph Audio
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Conversion History */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-pink-500" />
              <h2 className="text-base font-semibold text-foreground">Past Voice Conversions</h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {conversions?.length ?? 0} saved
            </span>
          </div>

          {!conversions || conversions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No previous voice conversions found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {conversions.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col justify-between p-3.5 rounded-xl border border-border/60 bg-muted/15 hover:bg-muted/30 transition gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/10 text-pink-500">
                        {item.pitchShift !== 0 ? `Pitch ${item.pitchShift > 0 ? `+${item.pitchShift}` : item.pitchShift}` : "Natural Pitch"}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item._creationTime), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate">
                      Target: {item.targetVoiceKey.split("/").pop()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {item.status}
                    </span>
                    {item.url && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-pink-500 hover:bg-pink-500/10"
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
