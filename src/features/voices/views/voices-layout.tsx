import { PageHeader } from "@/components/page-header";
import { LayoutGrid, Plus, AudioLines } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function VoicesLayout({ 
  children
}: { 
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader title="Voices" />
      {/* Header Banner */}
      <div className="border-b border-border bg-background px-4 sm:px-6 lg:px-8 py-3.5 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <LayoutGrid className="h-7 w-7 text-cyan-500" />
              Voice Library
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Explore curated studio voices and custom cloned voices ready for speech synthesis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="gap-1.5 shadow-xs">
              <Link href="/voice-clone">
                <Plus className="h-4 w-4" />
                Create Voice
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/text-to-speech">
                <AudioLines className="mr-1.5 h-4 w-4" />
                Open TTS
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}