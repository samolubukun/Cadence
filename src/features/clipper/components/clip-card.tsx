"use client";

import React, { useState } from "react";
import { 
  Play, Pause, Download, ExternalLink, Flame, Check, Copy, Clock, 
  Sparkles, Layers, RefreshCw 
} from "lucide-react";
import { toast } from "sonner";

interface ClipCardProps {
  clip: {
    id?: string;
    clip_id?: string;
    title: string;
    hook_title?: string;
    hookTitle?: string;
    hook_type?: string;
    hookType?: string;
    viral_score?: number;
    viralScore?: number;
    hook_score?: number;
    hookScore?: number;
    engagement_score?: number;
    engagementScore?: number;
    value_score?: number;
    valueScore?: number;
    shareability_score?: number;
    shareabilityScore?: number;
    reasoning?: string;
    start_time?: number;
    startTime?: number;
    end_time?: number;
    endTime?: number;
    duration: number;
    transcript?: string;
    transcriptText?: string;
    videoUrl?: string | null;
    aspectRatio?: string;
  };
}

export function ClipCard({ clip }: ClipCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const viralScore = clip.viral_score ?? clip.viralScore ?? 92;
  const hookScore = clip.hook_score ?? clip.hookScore ?? 23;
  const engScore = clip.engagement_score ?? clip.engagementScore ?? 23;
  const valScore = clip.value_score ?? clip.valueScore ?? 23;
  const shareScore = clip.shareability_score ?? clip.shareabilityScore ?? 23;
  const hookTitle = clip.hook_title ?? clip.hookTitle ?? "High Virality Moment";
  const transcript = clip.transcript ?? clip.transcriptText ?? "";
  const startSec = clip.start_time ?? clip.startTime ?? 0;
  const endSec = clip.end_time ?? clip.endTime ?? clip.duration;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    toast.success("Transcript copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col md:flex-row bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:border-primary/40 transition-all duration-300 group">
      {/* 9:16 Vertical Player Preview */}
      <div className="relative w-full md:w-[260px] aspect-[9/16] bg-black shrink-0 overflow-hidden flex items-center justify-center">
        {clip.videoUrl ? (
          <video
            ref={videoRef}
            src={clip.videoUrl}
            playsInline
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <Layers className="w-8 h-8 mb-2 opacity-50 animate-pulse" />
            <span className="text-xs">Preview Loading...</span>
          </div>
        )}

        {/* Floating Play/Pause Overlay */}
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
        </button>

        {/* Virality Badge in top corner */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse fill-amber-400" />
          <span className="text-xs font-black text-amber-300">{viralScore}/100</span>
        </div>

        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white/90">
          {clip.duration.toFixed(0)}s
        </div>
      </div>

      {/* Clip Metadata, 4-Pillar Virality & Actions */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div>
          {/* Header & Hook Title */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {clip.hook_type || clip.hookType || "Viral Hook"}
              </span>
              <h3 className="text-base font-bold text-foreground mt-1.5 line-clamp-1">
                {hookTitle}
              </h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground shrink-0">
              {formatTime(startSec)} - {formatTime(endSec)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground italic line-clamp-2 mb-4">
            &ldquo;{transcript}&rdquo;
          </p>

          {/* 4-Pillar Virality Scoring Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-muted/20 p-3 rounded-xl border border-border/60">
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex justify-between">
                <span>Hook</span>
                <span className="text-foreground font-mono">{hookScore}/25</span>
              </div>
              <div className="w-full bg-muted/60 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(hookScore/25)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex justify-between">
                <span>Engagement</span>
                <span className="text-foreground font-mono">{engScore}/25</span>
              </div>
              <div className="w-full bg-muted/60 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(engScore/25)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex justify-between">
                <span>Value</span>
                <span className="text-foreground font-mono">{valScore}/25</span>
              </div>
              <div className="w-full bg-muted/60 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(valScore/25)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex justify-between">
                <span>Shareability</span>
                <span className="text-foreground font-mono">{shareScore}/25</span>
              </div>
              <div className="w-full bg-muted/60 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(shareScore/25)*100}%` }} />
              </div>
            </div>
          </div>

          {clip.reasoning && (
            <p className="text-[11px] text-muted-foreground bg-muted/20 px-2.5 py-1.5 rounded-lg border border-border/60 mb-4">
              <span className="font-semibold text-foreground">AI Insight:</span> {clip.reasoning}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
          {clip.videoUrl && (
            <a
              href={clip.videoUrl}
              download={`${hookTitle.replace(/[^a-zA-Z0-9]/g, "_")}_viral_clip.mp4`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-primary text-primary-foreground font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-primary/90 active:scale-95 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Clip (MP4)
            </a>
          )}

          <button
            type="button"
            onClick={copyTranscript}
            className="px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted text-foreground border border-border/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy Clip Subtitles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Text"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
