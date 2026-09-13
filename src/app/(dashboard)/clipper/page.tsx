"use client";

import React, { useState } from "react";
import { 
  Scissors, Film, Sparkles, Flame, History, Trash2, Video, 
  ExternalLink, Layers, ArrowLeft, RefreshCw, AlertCircle, Play, 
  SlidersHorizontal, CheckCircle2, ChevronRight, Wand2, ShieldCheck,
  Smartphone, Square, Monitor, Clock, Zap, Target
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ClipperIngestPanel } from "@/features/clipper/components/clipper-ingest-panel";
import { ClipCard } from "@/features/clipper/components/clip-card";

export default function ClipperStudioPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"studio" | "history">("studio");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentClips, setCurrentClips] = useState<any[]>([]);
  const [currentSourceTitle, setCurrentSourceTitle] = useState<string>("");

  // Fetch Past Clipper Sessions
  const { data: pastSessions, isLoading: isSessionsLoading } = useQuery(
    trpc.studio.getClipperSessions.queryOptions()
  );

  // Clip Media Mutation
  const clipMutation = useMutation(
    trpc.studio.clipMedia.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Generated ${data.clips.length} viral clips!`);
        setCurrentClips(data.clips);
        setCurrentSourceTitle(data.sourceTitle);
        setActiveSessionId(data.sessionId);
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getClipperSessions.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to generate viral clips");
      },
    })
  );

  // Delete Session Mutation
  const deleteMutation = useMutation(
    trpc.studio.deleteClipperSession.mutationOptions({
      onSuccess: () => {
        toast.success("Session removed");
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getClipperSessions.queryKey(),
        });
        if (activeSessionId) {
          setActiveSessionId(null);
          setCurrentClips([]);
        }
      },
    })
  );

  const handleRunClipper = (params: any) => {
    clipMutation.mutate(params);
  };

  const handleSelectPastSession = (session: any) => {
    setActiveSessionId(session._id);
    setCurrentSourceTitle(session.title);
    setCurrentClips(session.clips || []);
    setActiveTab("studio");
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-background">
      <PageHeader title="Viral Clipper Studio" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl flex items-center justify-center border shadow-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shrink-0">
                  <Scissors className="size-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Viral Clipper Studio
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Turn any long-form video or podcast into viral, high-retention shorts with auto-reframing and kinetic captions.
              </p>
            </div>

            {/* Studio vs History Mode Tabs */}
            <div className="inline-flex p-1.5 rounded-2xl bg-muted/60 border border-border/80 gap-1.5 shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("studio")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                  activeTab === "studio"
                    ? "bg-background text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Sparkles className="size-4 text-amber-500" />
                <span>Clipper Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                  activeTab === "history"
                    ? "bg-background text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <History className="size-4 text-muted-foreground" />
                <span>Past Sessions</span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold">
                  {pastSessions?.length || 0}
                </Badge>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "studio" ? (
            <div className="space-y-8 w-full">
              {/* Full Width Ingest Panel Across Top */}
              <div className="w-full">
                <ClipperIngestPanel
                  onSubmit={handleRunClipper}
                  isLoading={clipMutation.isPending}
                />
              </div>

              {/* Full Width Output Panel Underneath */}
              <div className="w-full space-y-6">
                {clipMutation.isPending ? (
                  <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-xs p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                      <Flame className="w-6 h-6 text-amber-500 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-foreground">AI Engine Running on Modal GPU</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        Extracting 16kHz audio, transcribing with Whisper Large-v3, ranking viral moments with Qwen2.5-1.5B, tracking speakers with YOLO, and burning kinetic subtitles...
                      </p>
                    </div>
                  </Card>
                ) : currentClips.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Active Session</span>
                        <h2 className="text-lg font-bold text-foreground line-clamp-1">{currentSourceTitle}</h2>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1 font-semibold text-xs py-1 px-3">
                        <Flame className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                        <span>{currentClips.length} Shorts Ready</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {currentClips.map((clip, idx) => (
                        <ClipCard key={clip.id || clip.clip_id || idx} clip={clip} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="border-border/80 bg-card/50 backdrop-blur-xs p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
                    <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                      <Scissors className="size-6" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h3 className="text-base font-bold text-foreground">No Clips Generated Yet</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Paste a YouTube video or podcast URL above, pick your subtitle style and framing, and hit <span className="text-foreground font-semibold">Generate Viral Clips</span> to automatically cut high-hook vertical shorts.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground border-border/80 flex items-center gap-1.5 py-1 px-2.5">
                        <Zap className="size-3 text-amber-500" />
                        <span>Whisper Large-v3 timestamps</span>
                      </Badge>
                      <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground border-border/80 flex items-center gap-1.5 py-1 px-2.5">
                        <Target className="size-3 text-emerald-500" />
                        <span>YOLO active speaker centering</span>
                      </Badge>
                      <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground border-border/80 flex items-center gap-1.5 py-1 px-2.5">
                        <Sparkles className="size-3 text-primary" />
                        <span>Kinetic pop subtitles</span>
                      </Badge>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            /* History / Past Sessions View */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Past Clipper Sessions</h2>
                  <p className="text-xs text-muted-foreground">Previous videos and AI-generated viral shorts</p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {pastSessions?.length || 0} Total Sessions
                </Badge>
              </div>

              {isSessionsLoading ? (
                <div className="p-12 text-center text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground/60" />
                  <span className="text-xs">Loading past sessions...</span>
                </div>
              ) : pastSessions && pastSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastSessions.map((session) => (
                    <Card
                      key={session._id}
                      className="border-border/80 bg-card hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                            {session.sourceType}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold uppercase",
                              session.status === "completed" 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            )}
                          >
                            {session.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-bold text-foreground line-clamp-2">
                          {session.title}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono pt-1">
                          {session.clips?.length || 0} Clips • {session.aspectRatio} • {session.subtitleStyle}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                          <Button
                            size="sm"
                            onClick={() => handleSelectPastSession(session)}
                            className="flex-1 text-xs font-semibold gap-1.5 h-8"
                          >
                            <Video className="size-3.5" />
                            View Clips
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate({ sessionId: session._id })}
                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete Session"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-border/80 bg-muted/10 p-12 text-center text-muted-foreground">
                  <History className="size-8 opacity-40 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">No past clipping sessions found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generated clips from your YouTube links and uploads will appear here.
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
