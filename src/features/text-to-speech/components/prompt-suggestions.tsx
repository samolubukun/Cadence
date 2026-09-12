"use client";

import {
  BookOpen,
  Clapperboard,
  Podcast,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PROMPT_SUGGESTIONS: {
  label: string;
  prompt: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Story narration",
    prompt:
      "In a village tucked between mist-covered mountains, there lived an old clockmaker whose clocks never told the right time - but they always told the truth. One rainy evening, a stranger walked in and asked for a clock that could show him his future.",
    icon: BookOpen,
  },
  {
    label: "Movie dialogue",
    prompt:
      "The rain hammered against the window as she turned to face him. You knew, didn't you? she whispered, her voice barely holding together. He stepped forward, jaw clenched. I did what I had to do. The silence between them was louder than the storm outside.",
    icon: Clapperboard,
  },
  {
    label: "Podcast intro",
    prompt:
      "Hey everyone, welcome back to another episode of The Curious Mind - the podcast where we dig into the stories, science, and strange ideas that shape our world. I'm your host, and today we have an incredible guest who's going to challenge everything you thought you knew.",
    icon: Podcast,
  },
];

export function PromptSuggestions({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
      <span className="text-xs font-medium text-muted-foreground shrink-0 flex items-center gap-1.5">
        <Sparkles className="size-3 text-indigo-500" />
        Examples:
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {PROMPT_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => onSelect(suggestion.prompt)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/70 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/60 transition-colors cursor-pointer shrink-0"
          >
            <suggestion.icon className="size-3 text-muted-foreground" />
            <span>{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};