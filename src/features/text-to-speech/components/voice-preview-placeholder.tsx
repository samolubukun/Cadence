import Link from "next/link";
import { AudioLines, BookOpen, Sparkles, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function VoicePreviewPlaceholder() {
  return (
    <div className="hidden flex-none lg:flex py-5 flex-col items-center justify-center gap-3 border-t bg-muted/5">
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex w-24 items-center justify-center">
          <div className="absolute left-0 -rotate-30 rounded-full bg-muted p-2.5">
            <Volume2 className="size-4 text-muted-foreground" />
          </div>

          <div className="relative z-10 rounded-full bg-foreground p-3">
            <Sparkles className="size-4 text-background" />
          </div>

          <div className="absolute right-0 -rotate-30 rounded-full bg-muted p-2.5">
            <AudioLines className="size-4 text-muted-foreground" />
          </div>
        </div>

        <p className="text-base font-semibold tracking-tight text-foreground">
          Preview will appear here
        </p>
        <p className="max-w-xs text-center text-xs text-muted-foreground leading-relaxed">
          Once you generate, your high-fidelity audio waveform and playback controls will appear here.
        </p>
      </div>
    </div>
  );
};