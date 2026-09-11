"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Sparkles,
  AudioLines,
  Headphones,
  Volume2,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  X,
  BellOff,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { UserButton, useUser, useOrganization } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────────────────────────────

type NotifCategory = "generation" | "system" | "billing" | "voice" | "alert";

interface Notification {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  meta: string;
  read: boolean;
}

const CATEGORY_CONFIG = {
  generation: {
    icon: AudioLines,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  billing: {
    icon: CreditCard,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  voice: {
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  system: {
    icon: CheckCircle2,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
} satisfies Record<NotifCategory, { icon: React.ElementType; color: string; bg: string; border: string }>;

// ── Helper ────────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, className, children }: PageHeaderProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const trpc = useTRPC();

  const [openCommand, setOpenCommand] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // ── Live data queries ──────────────────────────────────────────────────────
  const { data: billingData } = useQuery(trpc.billing.getStatus.queryOptions());
  const { data: voicesData } = useQuery(trpc.voices.getAll.queryOptions({ query: searchQuery }));
  const { data: generationsData } = useQuery(trpc.generations.getAll.queryOptions());

  // Separate query for voices without filter (for notifications)
  const { data: allVoicesData } = useQuery(trpc.voices.getAll.queryOptions());

  // ── Build real notifications from live data ────────────────────────────────
  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];

    // 1. Credit balance alert
    if (billingData !== undefined) {
      const balance = billingData.balance ?? 0;
      const isLow = balance < 3000;
      const isCritical = balance < 500;
      items.push({
        id: "billing-balance",
        category: isCritical ? "alert" : isLow ? "alert" : "billing",
        title: isCritical
          ? "Credits Critically Low"
          : isLow
          ? "Credits Running Low"
          : "Credits Available",
        body: isCritical
          ? `Only ${balance.toLocaleString()} characters left. Top up now to keep generating.`
          : isLow
          ? `${balance.toLocaleString()} characters remaining. Consider topping up soon.`
          : `You have ${balance.toLocaleString()} characters ready to use in this workspace.`,
        meta: "Billing · live",
        read: false,
      });
    }

    // 2. Voice library stats
    if (allVoicesData !== undefined) {
      const customCount = allVoicesData.custom?.length ?? 0;
      const systemCount = allVoicesData.system?.length ?? 0;
      if (customCount > 0) {
        items.push({
          id: "voices-custom",
          category: "voice",
          title: `${customCount} Custom Voice${customCount > 1 ? "s" : ""} in Library`,
          body: `Your team has ${customCount} cloned voice${customCount > 1 ? "s" : ""} ready. ${systemCount} built-in voices also available.`,
          meta: "Voice Library · synced",
          read: true,
        });
      } else {
        items.push({
          id: "voices-system",
          category: "voice",
          title: `${systemCount} Built-in Voices Available`,
          body: `${systemCount} studio voices ready. Clone your own voice to personalise generations.`,
          meta: "Voice Library · synced",
          read: true,
        });
      }
    }

    // 3. Latest generation activity
    if (generationsData && generationsData.length > 0) {
      const latest = generationsData[0];
      const charCount = latest.text?.length ?? 0;
      const ago = timeAgo(new Date(latest.createdAt));
      items.push({
        id: `gen-${latest.id}`,
        category: "generation",
        title: "Last Generation Complete",
        body: `"${latest.voiceName}" · ${charCount.toLocaleString()} chars · ${ago}`,
        meta: `TTS · ${ago}`,
        read: true,
      });
    } else if (generationsData !== undefined) {
      items.push({
        id: "gen-none",
        category: "generation",
        title: "No Generations Yet",
        body: "Head to Text to Speech to create your first audio generation.",
        meta: "TTS · ready",
        read: true,
      });
    }

    // 4. System status — always show engine readiness
    items.push({
      id: "system-engine",
      category: "system",
      title: "Neural Engine Online",
      body: "NVIDIA A10G serverless containers active. Whisper v3 diarization ready.",
      meta: "Modal · active",
      read: true,
    });

    return items.filter((n) => !dismissed.has(n.id));
  }, [billingData, allVoicesData, generationsData, dismissed]);

  const unreadCount = notifications.filter((n) => !n.read && !readIds.has(n.id)).length;

  // ── Keyboard shortcut ──────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpenCommand(false);
    setSearchQuery("");
    command();
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => new Set([...prev, ...notifications.map((n) => n.id)]));
  }, [notifications]);

  const dismissNotification = useCallback((id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  }, []);

  const handleNotifOpen = useCallback((open: boolean) => {
    setNotifOpen(open);
    if (open) {
      setReadIds((prev) => new Set([...prev, ...notifications.map((n) => n.id)]));
    }
  }, [notifications]);

  const clearAll = useCallback(() => {
    setDismissed(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  const isLoadingNotifs = billingData === undefined || allVoicesData === undefined || generationsData === undefined;

  return (
    <>
      <header
        className={cn(
          "flex items-center justify-between gap-3 border-b border-border/70 bg-background/85 backdrop-blur-xl px-4 py-2.5 shrink-0 sticky top-0 z-30 transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]",
          className
        )}
      >
        {/* Left */}
        <div className="flex items-center gap-3 shrink-0">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg hover:bg-muted/60 transition-colors" />
          {title && (
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
              {title}
            </h1>
          )}
        </div>

        {/* Middle: Search */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <button
            type="button"
            onClick={() => setOpenCommand(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-full border border-border/80 bg-muted/30 hover:bg-muted/50 text-xs text-muted-foreground transition-all hover:border-border shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Search className="size-3.5 group-hover:text-foreground transition-colors" />
              <span className="group-hover:text-foreground transition-colors">
                Search voices, pages, actions...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border/80 text-[10px] font-mono shadow-2xs">
              <span className="text-[9px]">Ctrl</span>K
            </kbd>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {children}

          {/* Mobile search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenCommand(true)}
            className="md:hidden size-8 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>

          {/* Notifications */}
          <Popover open={notifOpen} onOpenChange={handleNotifOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative size-8 rounded-full border border-border/60 bg-background hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-indigo-600" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 sm:w-96 p-0 shadow-2xl rounded-2xl border border-border/80 bg-background/98 backdrop-blur-xl"
            >
              {/* Notif header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Bell className="size-3.5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Studio Alerts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isLoadingNotifs ? (
                    <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-semibold">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </div>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-2"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>

              {/* Notif body */}
              {isLoadingNotifs ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-2.5 animate-pulse">
                      <div className="size-7 rounded-xl bg-muted shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2.5 bg-muted rounded w-full" />
                        <div className="h-2 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                  <BellOff className="size-6 opacity-40" />
                  <p className="text-xs font-medium">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40 max-h-[360px] overflow-y-auto">
                  {notifications.map((notif) => {
                    const cfg = CATEGORY_CONFIG[notif.category];
                    const Icon = cfg.icon;
                    const isRead = notif.read || readIds.has(notif.id);
                    return (
                      <div
                        key={notif.id}
                        className={cn(
                          "group relative p-3.5 hover:bg-muted/30 transition-colors",
                          !isRead && "bg-primary/[0.03]"
                        )}
                      >
                        {!isRead && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-indigo-500" />
                        )}
                        <div className="flex items-start gap-2.5">
                          <div
                            className={cn(
                              "size-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border",
                              cfg.bg,
                              cfg.border
                            )}
                          >
                            <Icon className={cn("size-3.5", cfg.color)} />
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground leading-snug">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {notif.body}
                            </p>
                            <span className="text-[10px] text-muted-foreground/60 block pt-0.5 font-mono">
                              {notif.meta}
                            </span>
                          </div>
                          <button
                            onClick={() => dismissNotification(notif.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 p-0.5 rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                            aria-label="Dismiss"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              {!isLoadingNotifs && notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border/60 bg-muted/10">
                  <button
                    onClick={clearAll}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors w-full text-center hover:underline underline-offset-2"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Profile */}
          <div className="flex items-center pl-1 sm:pl-2 border-l border-border/60">
            {isLoaded ? (
              <div className="flex items-center gap-2.5 py-0.5 px-1.5 rounded-full hover:bg-muted/40 transition-colors">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "size-7 sm:size-8 ring-1 ring-border/80 shadow-2xs",
                    },
                  }}
                />
                <div className="hidden xl:flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-bold text-foreground whitespace-nowrap">
                    {user?.fullName ?? user?.firstName ?? "Creator"}
                  </span>
                  <span
                    className="text-[10px] text-muted-foreground max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis block"
                    title={user?.primaryEmailAddress?.emailAddress ?? ""}
                  >
                    {user?.primaryEmailAddress?.emailAddress ?? organization?.name ?? "Studio"}
                  </span>
                </div>
              </div>
            ) : (
              <Skeleton className="size-8 rounded-full" />
            )}
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput
          placeholder="Search voices, pages, actions..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
              <Info className="size-4 opacity-50" />
              <span className="text-xs">No results found.</span>
            </div>
          </CommandEmpty>

          {(voicesData?.custom?.length ?? 0) > 0 && (
            <CommandGroup heading="Your Voices">
              {voicesData!.custom.slice(0, 4).map((voice) => (
                <CommandItem
                  key={voice.id}
                  value={`custom-${voice.name}`}
                  onSelect={() => runCommand(() => router.push(`/voices`))}
                >
                  <Sparkles className="mr-2 size-4 text-amber-500 shrink-0" />
                  <span className="truncate">{voice.name}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground shrink-0 pl-2">Custom</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {(voicesData?.system?.length ?? 0) > 0 && (
            <CommandGroup heading="Built-in Voices">
              {voicesData!.system.slice(0, 5).map((voice) => (
                <CommandItem
                  key={voice.id}
                  value={`system-${voice.name}`}
                  onSelect={() => runCommand(() => router.push(`/text-to-speech?voiceId=${voice.id}`))}
                >
                  <Volume2 className="mr-2 size-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{voice.name}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground shrink-0 pl-2">Built-in</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {((voicesData?.custom?.length ?? 0) > 0 || (voicesData?.system?.length ?? 0) > 0) && (
            <CommandSeparator />
          )}

          <CommandGroup heading="Pages">
            <CommandItem value="studio overview dashboard" onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <LayoutDashboard className="mr-2 size-4" />
              Studio Overview
            </CommandItem>
            <CommandItem value="text to speech studio generate audio" onSelect={() => runCommand(() => router.push("/text-to-speech"))}>
              <AudioLines className="mr-2 size-4" />
              Text to Speech Studio
            </CommandItem>
            <CommandItem value="voice library browse all voices" onSelect={() => runCommand(() => router.push("/voices"))}>
              <Volume2 className="mr-2 size-4" />
              Voice Library
            </CommandItem>
            <CommandItem value="clone voice zero-shot persona" onSelect={() => runCommand(() => router.push("/voice-clone"))}>
              <Sparkles className="mr-2 size-4" />
              Clone Voice
            </CommandItem>
            <CommandItem value="speech to text transcribe diarization" onSelect={() => runCommand(() => router.push("/transcribe"))}>
              <Headphones className="mr-2 size-4" />
              Speech to Text
            </CommandItem>
            <CommandItem value="billing credits top-up usage" onSelect={() => runCommand(() => router.push("/billing"))}>
              <CreditCard className="mr-2 size-4" />
              Billing & Credits
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem value="generate new speech audio tts" onSelect={() => runCommand(() => router.push("/text-to-speech"))}>
              <Zap className="mr-2 size-4 text-indigo-500" />
              Generate New Speech
            </CommandItem>
            <CommandItem value="create new voice persona clone" onSelect={() => runCommand(() => router.push("/voice-clone"))}>
              <Sparkles className="mr-2 size-4 text-amber-500" />
              Create New Voice Persona
            </CommandItem>
            <CommandItem value="transcribe audio file upload" onSelect={() => runCommand(() => router.push("/transcribe"))}>
              <Headphones className="mr-2 size-4 text-sky-500" />
              Transcribe Audio File
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
