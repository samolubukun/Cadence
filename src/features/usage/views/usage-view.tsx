"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Coins,
  Flame,
  Layers,
  Sparkles,
  TrendingUp,
  CreditCard,
  Search,
  Mic,
  Headphones,
  Music,
  Drum,
  Volume2,
  Clapperboard,
  AudioLines,
  Bot,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const CATEGORY_META = {
  tts: {
    label: "TTS Speech",
    icon: Mic,
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  },
  stt: {
    label: "Transcription",
    icon: Headphones,
    badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  },
  beats: {
    label: "Instrumental Beat",
    icon: Drum,
    badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  },
  songs: {
    label: "Full Song",
    icon: Music,
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  sfx: {
    label: "Sound Effect",
    icon: Volume2,
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  media: {
    label: "Visual / Video",
    icon: Clapperboard,
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  },
  stems: {
    label: "Stem Separation",
    icon: Layers,
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  },
  singing: {
    label: "AI Singing Cover",
    icon: AudioLines,
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
  agent: {
    label: "Voice Agent",
    icon: Bot,
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
} as const;

export function UsageView() {
  const trpc = useTRPC();
  const { data: analytics, isLoading } = useQuery(
    trpc.billing.getUsageAnalytics.queryOptions()
  );

  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const balance = analytics?.balance ?? 10000;
  const totalSpent = analytics?.totalCreditsSpent ?? 0;
  const totalGens = analytics?.totalGenerationsCount ?? 0;
  const dailyTrends = analytics?.dailyTrends ?? [];
  const categoryBreakdown = analytics?.categoryBreakdown ?? [];
  const transactions = analytics?.recentTransactions ?? [];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = selectedFilter === "all" || tx.category === selectedFilter;
    const matchesSearch =
      tx.title.toLowerCase().includes(search.toLowerCase()) ||
      tx.detail.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Usage & Analytics" />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-8 overflow-y-auto">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Activity className="size-6 text-primary" />
              Credit Usage &amp; Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track consumption metrics, generation volume, and inspect credit audit trails.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <Link href="/billing">
              <CreditCard className="size-4" />
              Manage Billing &amp; Packs
            </Link>
          </Button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Available Credits
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Coins className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">
                {isLoading ? "…" : balance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Active
                </span>
                • Organization balance
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Credits Burned
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Flame className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">
                {isLoading ? "…" : totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-muted-foreground">
                Lifetime organization usage
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Generations Created
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Layers className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">
                {isLoading ? "…" : totalGens.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across voice, music &amp; media
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Top Model Engine
              </CardTitle>
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                <Sparkles className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-black text-foreground truncate">
                {categoryBreakdown[0]?.name || "Chatterbox Turbo"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Highest share of credit activity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Burn Rate Chart (2 cols) */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Credit Consumption (Last 14 Days)
              </CardTitle>
              <CardDescription className="text-xs">
                Daily volume of credits utilized for model generations and inference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="creditsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-border/40"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border px-3 py-2 rounded-lg shadow-md text-xs">
                              <p className="font-semibold text-popover-foreground">{label}</p>
                              <p className="text-primary mt-1 font-mono">
                                {payload[0].value} credits spent
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="credits"
                      stroke="#6366F1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#creditsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Categorical Distribution (1 col) */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Spend by Feature
              </CardTitle>
              <CardDescription className="text-xs">
                Credits consumed by modality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryBreakdown.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  No generation activity recorded yet.
                </p>
              ) : (
                categoryBreakdown.map((cat) => {
                  const pct =
                    totalSpent > 0 ? Math.round((cat.credits / totalSpent) * 100) : 0;
                  return (
                    <div key={cat.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground flex items-center gap-1.5">
                          <span
                            className="size-2.5 rounded-full inline-block"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {cat.credits.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Incurred</span>
                <span className="font-bold text-foreground font-mono">
                  {totalSpent.toLocaleString()} credits
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credit Audit / Activity Ledger Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Transaction Ledger
              </h2>
              <p className="text-xs text-muted-foreground">
                Detailed audit trail of generations and corresponding credit deductions.
              </p>
            </div>

            {/* Filters and search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-48 sm:w-60">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search ledger…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>

              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Features</option>
                <option value="tts">TTS Speech</option>
                <option value="stt">Transcription</option>
                <option value="agent">Voice Agent</option>
                <option value="beats">Instrumental Beats</option>
                <option value="songs">Full Songs</option>
                <option value="sfx">Sound Effects</option>
                <option value="media">Media (Img/Vid)</option>
                <option value="stems">Stem Separation</option>
                <option value="singing">Singing Covers</option>
              </select>
            </div>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                    <th className="py-3 px-4">Feature / Action</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Credits Deducted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No transactions match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const meta = CATEGORY_META[tx.category];
                      const Icon = meta.icon;
                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`size-7 rounded-md flex items-center justify-center border ${meta.badgeColor}`}
                              >
                                <Icon className="size-3.5" />
                              </div>
                              <span className="font-semibold text-foreground">
                                {tx.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {tx.detail}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                            {format(new Date(tx.timestamp), "MMM d, yyyy · HH:mm")}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                            -{tx.credits.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
