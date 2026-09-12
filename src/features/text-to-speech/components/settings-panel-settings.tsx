"use client";

import { useStore } from "@tanstack/react-form";
import { RotateCcw, SlidersHorizontal, Sparkles, Zap, ShieldCheck } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { sliders } from "@/features/text-to-speech/data/sliders";
import { ttsFormOptions } from "@/features/text-to-speech/components/text-to-speech-form";
import { VoiceSelector } from "@/features/text-to-speech/components/voice-selector";

const PRESETS = [
  {
    name: "Balanced",
    icon: Sparkles,
    values: { temperature: 0.8, topP: 0.95, topK: 1000, repetitionPenalty: 1.2 },
  },
  {
    name: "Expressive",
    icon: Zap,
    values: { temperature: 1.2, topP: 0.98, topK: 2500, repetitionPenalty: 1.1 },
  },
  {
    name: "Steady",
    icon: ShieldCheck,
    values: { temperature: 0.4, topP: 0.85, topK: 500, repetitionPenalty: 1.3 },
  },
];

function formatSliderValue(id: string, val: number): string {
  switch (id) {
    case "temperature":
      return val.toFixed(1);
    case "topP":
      return `${Math.round(val * 100)}%`;
    case "topK":
      return val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : val.toString();
    case "repetitionPenalty":
      return `${val.toFixed(1)}x`;
    default:
      return val.toString();
  }
}

export function SettingsPanelSettings() {
  const form = useTypedAppFormContext(ttsFormOptions);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const currentTemp = useStore(form.store, (s) => s.values.temperature);
  const currentTopP = useStore(form.store, (s) => s.values.topP);

  const applyPreset = (preset: typeof PRESETS[number]) => {
    form.setFieldValue("temperature", preset.values.temperature);
    form.setFieldValue("topP", preset.values.topP);
    form.setFieldValue("topK", preset.values.topK);
    form.setFieldValue("repetitionPenalty", preset.values.repetitionPenalty);
  };

  const handleReset = () => {
    form.setFieldValue("temperature", 0.8);
    form.setFieldValue("topP", 0.95);
    form.setFieldValue("topK", 1000);
    form.setFieldValue("repetitionPenalty", 1.2);
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5">
      {/* Voice Style Dropdown Section */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
        <VoiceSelector />
      </div>

      {/* Quick Presets Section */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Style Presets
        </span>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => {
            const isActive =
              Math.abs(currentTemp - preset.values.temperature) < 0.05 &&
              Math.abs(currentTopP - preset.values.topP) < 0.05;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary/30 font-semibold shadow-2xs"
                    : "bg-card text-foreground/80 hover:text-foreground border-border hover:bg-accent/40"
                }`}
              >
                <preset.icon className="size-3 shrink-0" />
                <span className="truncate">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Adjustments Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="size-3 text-indigo-500" />
            Voice Dynamics
          </span>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            Reset defaults
          </Button>
        </div>

        <div className="space-y-3">
          {sliders.map((slider) => (
            <form.Field key={slider.id} name={slider.id}>
              {(field) => (
                <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-2.5 shadow-2xs hover:border-border transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground tracking-tight">
                      {slider.label}
                    </span>
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60">
                      {formatSliderValue(slider.id, field.state.value)}
                    </span>
                  </div>

                  <Slider
                    value={[field.state.value]}
                    onValueChange={(value) => field.handleChange(value[0])}
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    disabled={isSubmitting}
                    className="py-1 cursor-pointer **:data-[slot=slider-thumb]:size-3.5 **:data-[slot=slider-thumb]:bg-primary **:data-[slot=slider-track]:h-1.5"
                  />

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{slider.leftLabel}</span>
                    <span>{slider.rightLabel}</span>
                  </div>
                </div>
              )}
            </form.Field>
          ))}
        </div>
      </div>
    </div>
  );
};