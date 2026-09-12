"use client";

import { Coins, Plus } from "lucide-react";
import { useStore } from "@tanstack/react-form";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { SettingsDrawer } from "./settings-drawer";
import { HistoryDrawer } from "./history-drawer";
import { VoiceSelectorButton } from "./voice-selector-button";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { 
  COST_PER_UNIT, 
  TEXT_MAX_LENGTH
} from "@/features/text-to-speech/data/constants";
import { ttsFormOptions } from "./text-to-speech-form";
import { GenerateButton } from "./generate-button";
import { PromptSuggestions } from "./prompt-suggestions";

export function TextInputPanel() {
  const form = useTypedAppFormContext(ttsFormOptions);
  const pathname = usePathname();

  const text = useStore(form.store, (s) => s.values.text);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const isValid = useStore(form.store, (s) => s.isValid);

  return (
    <div className="flex h-full min-h-0 flex-col flex-1 p-3 sm:p-4 lg:p-5">
      {/* Input Card Container */}
      <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card shadow-xs focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all overflow-hidden">
        {/* Text input area */}
        <div className="relative min-h-0 flex-1 flex flex-col justify-between overflow-hidden">
          <form.Field name="text">
            {(field) => (
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Start typing or paste your text here..."
                className="w-full flex-1 min-h-0 resize-none border-0 bg-transparent p-4 sm:p-5 text-base leading-relaxed placeholder:text-muted-foreground/60 shadow-none focus-visible:ring-0 focus-visible:outline-hidden overflow-y-auto"
                maxLength={TEXT_MAX_LENGTH}
                disabled={isSubmitting}
              />
            )}
          </form.Field>

          {/* Prompt Suggestions - visible when text is empty */}
          {text.length === 0 && (
            <div className="hidden lg:block px-4 sm:px-5 py-2.5 border-t border-dashed border-border/40 bg-muted/5 shrink-0">
              <PromptSuggestions
                onSelect={(prompt) => form.setFieldValue("text", prompt)}
              />
            </div>
          )}
        </div>

        {/* Action bar footer */}
        <div className="border-t border-border bg-muted/20 px-4 sm:px-5 py-3 shrink-0">
          {/* Mobile layout */}
          <div className="flex flex-col gap-3 lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SettingsDrawer>
                  <VoiceSelectorButton />
                </SettingsDrawer>
                <HistoryDrawer />
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {text.length} / {TEXT_MAX_LENGTH}
              </span>
            </div>
            <GenerateButton
              className="w-full"
              disabled={isSubmitting || text.trim().length === 0}
              isSubmitting={isSubmitting}
              onSubmit={() => form.handleSubmit()}
            />
          </div>

          {/* Desktop layout */}
          <div className="hidden items-center justify-between lg:flex">
            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <Badge variant="outline" className="gap-1.5 border-dashed text-xs bg-background/80 shadow-2xs">
                  <Coins className="size-3 text-amber-500" />
                  <span className="tabular-nums font-mono text-[11px]">
                    ${(text.length * COST_PER_UNIT).toFixed(4)}
                  </span>
                  <span className="text-muted-foreground text-[10px]">est.</span>
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                <span className={text.length > TEXT_MAX_LENGTH ? "text-destructive font-semibold" : "text-foreground font-medium"}>
                  {text.length.toLocaleString()}
                </span>
                &nbsp;/&nbsp;{TEXT_MAX_LENGTH.toLocaleString()} characters
              </span>
            </div>

            <div className="flex items-center gap-2">
              {pathname !== "/text-to-speech" && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                >
                  <Link href="/text-to-speech">
                    <Plus className="size-3" />
                    New
                  </Link>
                </Button>
              )}
              {text.length > 0 && (
                <button
                  type="button"
                  onClick={() => form.setFieldValue("text", "")}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
              <GenerateButton
                size="sm"
                disabled={isSubmitting || text.trim().length === 0 || !isValid}
                isSubmitting={isSubmitting}
                onSubmit={() => form.handleSubmit()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
