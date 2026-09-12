"use client";

import { Sparkles, Wand2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AudioPreprocessorToggleProps {
  variant: "isolate-vocals" | "studio-enhance";
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

export function AudioPreprocessorToggle({
  variant,
  enabled,
  onChange,
  className = "",
}: AudioPreprocessorToggleProps) {
  const isVocalIsolation = variant === "isolate-vocals";

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        enabled
          ? isVocalIsolation
            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
            : "bg-purple-500/10 border-purple-500/30 text-purple-400"
          : "bg-muted/40 border-border/60 text-muted-foreground"
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`p-1.5 rounded-lg ${
            enabled
              ? isVocalIsolation
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-purple-500/20 text-purple-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isVocalIsolation ? <Wand2 className="size-4" /> : <Sparkles className="size-4" />}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            {isVocalIsolation ? "Isolate Clean Vocals" : "AI Studio Polish & Denoise"}
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                isVocalIsolation
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {isVocalIsolation ? "Demucs v4" : "44.1kHz"}
            </span>
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            {isVocalIsolation
              ? "Strips background music and beats automatically before processing."
              : "Removes mic hiss, room echo, and super-resolves to studio broadcast audio."}
          </span>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}
