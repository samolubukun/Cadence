"use client";

import { useState } from "react";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AudioLines, AudioWaveform, Clock, Search, Play, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

export function SettingsPanelHistory() {
  const trpc = useTRPC();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const activeId = pathname.startsWith("/text-to-speech/")
    ? pathname.replace("/text-to-speech/", "")
    : null;

  const { data: generations } = useSuspenseQuery(
    trpc.generations.getAll.queryOptions(),
  );

  const filteredGenerations = generations.filter((gen) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      gen.text.toLowerCase().includes(q) ||
      (gen.voiceName && gen.voiceName.toLowerCase().includes(q))
    );
  });

  if (!generations.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8">
        <div className="relative flex w-25 items-center justify-center">
          <div className="absolute left-0 -rotate-30 rounded-full bg-muted p-3">
            <AudioLines className="size-4 text-muted-foreground" />
          </div>

          <div className="relative z-10 rounded-full bg-foreground p-3">
            <AudioWaveform className="size-4 text-background" />
          </div>

          <div className="absolute right-0 rotate-30 rounded-full bg-muted p-3">
            <Clock className="size-4 text-muted-foreground" />
          </div>
        </div>
        <p className="font-semibold tracking-tight text-foreground">
          No generations yet
        </p>
        <p className="max-w-48 text-center text-xs text-muted-foreground">
          Generate some audio and it will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Search Header */}
      <div className="p-3 border-b border-border/80 sticky top-0 bg-background/95 backdrop-blur-xs z-10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            Generation History
          </span>
          <span className="font-mono text-[11px] text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted">
            {generations.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search audio by text or voice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-card"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex flex-col gap-1.5 p-2 overflow-y-auto">
        {filteredGenerations.map((generation) => {
          const isActive = generation.id === activeId;

          return (
            <Link
              href={`/text-to-speech/${generation.id}`}
              key={generation.id}
              className={`group flex flex-col gap-2 rounded-xl p-3 text-left transition-all border ${
                isActive
                  ? "bg-primary/10 border-primary/40 shadow-2xs ring-1 ring-primary/20"
                  : "bg-card border-border/60 hover:border-border hover:bg-accent/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <VoiceAvatar
                    seed={generation.voiceId ?? generation.voiceName}
                    name={generation.voiceName}
                    className="size-5 shrink-0"
                  />
                  <span className="truncate text-xs font-semibold text-foreground">
                    {generation.voiceName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isActive && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                      Playing
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(generation.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              <p className="line-clamp-2 text-xs text-muted-foreground group-hover:text-foreground/90 transition-colors leading-relaxed">
                {generation.text}
              </p>
            </Link>
          );
        })}

        {filteredGenerations.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No results matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};