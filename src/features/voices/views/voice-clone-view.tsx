"use client";

import { VoiceCreateForm } from "@/features/voices/components/voice-create-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Mic, Volume2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/page-header";

export function VoiceCloneView() {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Voice Cloning" />
      <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto overflow-y-auto">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Create Custom Voice
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Clone any voice from a short audio sample or record directly from your microphone.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/voices">
                <Volume2 className="mr-1.5 h-4 w-4" />
                Explore Voices
              </Link>
            </Button>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Creation Card */}
        <div className="lg:col-span-8">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg">Voice Details & Sample</CardTitle>
              <CardDescription>
                Upload an audio file (at least 10 seconds of clear speech) or record your voice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceCreateForm />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info & Best Practices */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Audio Quality Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
              <p>
                • <strong>Duration:</strong> At least 10 to 30 seconds of speech produces the most accurate results.
              </p>
              <p>
                • <strong>Clarity:</strong> Speak into a quiet room without background noise, echo, or music.
              </p>
              <p>
                • <strong>Tone:</strong> Natural, conversational pacing gives the zero-shot model the cleanest pitch data.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Credits & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                Cloning a custom voice costs <strong>500 credits</strong> once.
              </p>
              <p>
                Once cloned, your custom voice is permanently available to your entire team across all Text-to-Speech generations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
