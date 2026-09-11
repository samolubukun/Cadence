"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { 
  COST_PER_UNIT, 
  TEXT_MAX_LENGTH
} from "@/features/text-to-speech/data/constants";

export function TextInputPanel() {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleGenerate = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    router.push(`/text-to-speech?text=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="
      rounded-[22px] bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-purple-500/20 p-0.5 shadow-[0_4px_24px_-6px_rgba(99,102,241,0.1)]
    ">
      <div className="rounded-[20px] bg-slate-50/80 backdrop-blur-sm p-1">
        <div className="space-y-4 rounded-2xl bg-white p-4 sm:p-5 drop-shadow-xs border border-slate-100">
          <Textarea
            placeholder="Start typing or paste your text here..."
            className="min-h-32 sm:min-h-36 resize-none border-0 bg-transparent p-0 text-sm sm:text-base leading-relaxed text-slate-800 placeholder:text-slate-400 shadow-none focus-visible:ring-0"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={TEXT_MAX_LENGTH}
          />

          {/* Bottom info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <Badge variant="outline" className="gap-1.5 border-dashed border-indigo-200 bg-indigo-50/40 text-indigo-950 w-fit">
              <Coins className="size-3 text-indigo-600" />
              <span className="text-xs">
                {text.length === 0 ? (
                  "Start typing to estimate"
                ) : (
                  <>
                    <span className="tabular-nums font-semibold">
                      ${(text.length * COST_PER_UNIT).toFixed(4)}
                    </span>{" "}
                    estimated
                  </>
                )}
              </span>
            </Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              {text.length.toLocaleString()} / {TEXT_MAX_LENGTH.toLocaleString()} characters
            </span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3">
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            Powered by Chatterbox High-Fidelity Neural Flow
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {text.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setText("")}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Clear
              </Button>
            )}
            <Button
              size="sm"
              disabled={!text.trim()}
              onClick={handleGenerate}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all"
            >
              Generate speech
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}