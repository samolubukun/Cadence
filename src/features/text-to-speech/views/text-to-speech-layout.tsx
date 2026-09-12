"use client";

import { PageHeader } from "@/components/page-header";
import { AudioLines, Volume2, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function TextToSpeechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDetailPage = pathname !== "/text-to-speech";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader title="Text to speech" />
      {/* Header Banner */}
      <div className="border-b border-border bg-background px-4 sm:px-6 lg:px-8 py-3 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <AudioLines className="h-7 w-7 text-indigo-500" />
              Text to Speech
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Convert written text into lifelike speech with natural intonation, pacing, and emotion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isDetailPage && (
              <Button size="sm" asChild className="gap-1.5 shadow-xs">
                <Link href="/text-to-speech">
                  <Plus className="h-4 w-4" />
                  New generation
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/voices">
                <Volume2 className="mr-1.5 h-4 w-4" />
                Explore Voices
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
