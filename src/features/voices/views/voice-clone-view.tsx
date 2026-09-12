"use client";

import { VoiceCreateForm } from "@/features/voices/components/voice-create-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Mic, Volume2, ShieldCheck, Zap, Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function VoiceCloneView() {
  const trpc = useTRPC();
  const { data: voicesData } = useQuery(trpc.voices.getAll.queryOptions());
  const customVoices = voicesData?.custom ?? [];
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlayVoice = (id: string) => {
    const audio = new Audio(`/api/voices/${encodeURIComponent(id)}`);
    setPlayingId(id);
    audio.play();
    audio.onended = () => setPlayingId(null);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Voice Cloning" />
      <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Mic className="size-7 text-amber-500" />
              Voice Cloning Studio
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Clone any speaker timbre from a 10–30 second reference sample to create permanent team personas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/voices">
                <Volume2 className="mr-1.5 h-4 w-4" />
                Explore Voice Library
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Creation Card */}
          <div className="lg:col-span-8">
            <Card className="border-border bg-card shadow-xs rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold">Voice Details &amp; Sample</CardTitle>
                <CardDescription className="text-xs">
                  Upload an audio file (at least 10s of clean speech) or record your microphone live.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceCreateForm />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info & Cloned Personas */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cloned Personas Live Widget */}
            <Card className="border-border bg-card shadow-xs rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" />
                    Your Cloned Personas
                  </CardTitle>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {customVoices.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {customVoices.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No custom voices created yet.
                  </p>
                ) : (
                  customVoices.slice(0, 4).map((v) => (
                    <div
                      key={v.id}
                      className="p-2.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between gap-2 hover:bg-muted/40 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{v.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{v.category.toLowerCase()}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-amber-500 hover:bg-amber-500/10"
                          onClick={() => handlePlayVoice(v.id)}
                        >
                          <Play className={`size-3.5 ${playingId === v.id ? "animate-pulse" : ""}`} />
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-7 text-[11px] px-2">
                          <Link href={`/text-to-speech?voiceId=${v.id}`}>Use in TTS</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quality Tips */}
            <Card className="border-border bg-muted/20 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Audio Quality Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>• <strong>Duration:</strong> 10 to 30 seconds of speech gives the cleanest pitch curve.</p>
                <p>• <strong>Clarity:</strong> Quiet room with minimal background echo, reverb, or music.</p>
                <p>• <strong>Tone:</strong> Speak naturally at consistent volume and pacing.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
