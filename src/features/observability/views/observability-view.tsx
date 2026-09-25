"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  ShieldCheck,
  Download,
  Trash2,
  Copy,
  Check,
  Cpu,
  Sparkles,
  Lock,
  Terminal,
  Radio,
  Clock,
  Layers,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Zap,
  BarChart3,
  Flame,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function ObservabilityView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Filter states
  const [timeWindow, setTimeWindow] = useState<string>("24h");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [studioFilter, setStudioFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Inspect modal state
  const [selectedTrace, setSelectedTrace] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { user, isLoaded: isUserLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  // Queries
  const { data: adminData, isLoading: isLoadingAdminQuery } = useQuery(
    trpc.admin.getIsAdmin.queryOptions(
      { email: userEmail, username: user?.username ?? undefined },
      { enabled: !!user }
    )
  );

  const isLoadingAdmin = !isUserLoaded || (!!user && isLoadingAdminQuery);
  const isAdmin = adminData?.isAdmin ?? false;

  const { data: kpis, isLoading: isLoadingKpis, refetch: refetchKpis } = useQuery(
    trpc.admin.getKpis.queryOptions(
      { timeWindow },
      { enabled: isAdmin, refetchInterval: 5000 }
    )
  );

  const {
    data: tracesData,
    isLoading: isLoadingTraces,
    refetch: refetchTraces,
  } = useQuery(
    trpc.admin.listTraces.queryOptions(
      {
        timeWindow,
        model: modelFilter,
        status: statusFilter,
        studio: studioFilter,
        limit: 200,
      },
      { enabled: isAdmin, refetchInterval: 5000 }
    )
  );

  // Mutations
  const setAdminMutation = useMutation(
    trpc.admin.setSelfAdmin.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.admin.getIsAdmin.queryFilter());
        toast.success("Admin status updated");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update admin status");
      },
    })
  );

  const pruneMutation = useMutation(
    trpc.admin.pruneTraces.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.admin.listTraces.queryFilter());
        queryClient.invalidateQueries(trpc.admin.getKpis.queryFilter());
        toast.success(`Retention policy applied: pruned ${data.deletedCount} old traces`);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to prune traces");
      },
    })
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Filtered in-memory search for trace ID or action
  const filteredTraces = useMemo(() => {
    if (!tracesData) return [];
    if (!searchFilter.trim()) return tracesData;
    const q = searchFilter.toLowerCase();
    return tracesData.filter(
      (t) =>
        t.traceId.toLowerCase().includes(q) ||
        t.actionType.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q)
    );
  }, [tracesData, searchFilter]);

  // Export handlers
  const exportJson = () => {
    if (!filteredTraces.length) {
      toast.error("No traces to export");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTraces, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `cadence_traces_${timeWindow}_${Date.now()}.json`);
    dlAnchor.click();
    toast.success(`Exported ${filteredTraces.length} traces as JSON`);
  };

  const exportCsv = () => {
    if (!filteredTraces.length) {
      toast.error("No traces to export");
      return;
    }
    const headers = ["Trace ID", "Timestamp", "Studio", "Action", "Model", "Status", "Latency (ms)", "Total Tokens"];
    const rows = filteredTraces.map((t) => [
      t.traceId,
      new Date(t.createdAt).toISOString(),
      t.studio,
      t.actionType,
      t.model,
      t.status,
      t.latencyMs,
      t.totalTokens ?? 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cadence_traces_${timeWindow}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredTraces.length} traces as CSV`);
  };

  if (isLoadingAdmin) {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <PageHeader title="AI & Model Observability" />
        <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto overflow-y-auto">
          <div className="h-64 rounded-xl border border-border/40 bg-card/40 flex items-center justify-center text-muted-foreground animate-pulse">
            Verifying administrator permissions...
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <PageHeader title="AI & Model Observability" />
        <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-5xl w-full mx-auto space-y-6 overflow-y-auto">
          <Card className="border-amber-500/20 bg-amber-500/5 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <Lock className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Admin Access Required</CardTitle>
                  <CardDescription>
                    This portal is reserved for organization administrators.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your account is currently not flagged as an admin in the database.
                If you are testing or setting up the deployment, you can elevate
                your current account:
              </p>
              <Button
                onClick={() => setAdminMutation.mutate({ isAdmin: true })}
                disabled={setAdminMutation.isPending}
                className="gap-2"
              >
                <ShieldCheck className="size-4" />
                {setAdminMutation.isPending
                  ? "Elevating Account..."
                  : "Grant Self Admin Privileges"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Global Page Header */}
      <PageHeader title="AI & Model Observability" />

      {/* Scrollable Dashboard Body */}
      <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-8 overflow-y-auto">
        {/* Hero Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Activity className="size-6 text-primary" />
              AI &amp; Model Observability
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dual-stream telemetry, distributed trace waterfalls, model latencies, and token burn analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium text-xs"
            >
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Dual-Stream Active
            </Badge>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                refetchKpis();
                refetchTraces();
                toast.success("Telemetry refreshed");
              }}
              className="gap-1.5 h-8 text-xs"
            >
              <RotateCcw className="size-3.5" />
              <span>Sync</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => pruneMutation.mutate({ retentionDays: 7 })}
              disabled={pruneMutation.isPending}
              className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-3.5" />
              <span>7-Day Prune</span>
            </Button>
          </div>
        </div>

      {/* Real-Time KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/70 backdrop-blur-xs shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Requests
            </CardTitle>
            <Radio className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoadingKpis ? "..." : (kpis?.totalRequests ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Window: {timeWindow} · Live stream
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70 backdrop-blur-xs shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Token Burn
            </CardTitle>
            <Flame className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoadingKpis ? "..." : (kpis?.totalTokens ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Prompt & completion tokens
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70 backdrop-blur-xs shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Generation Latency
            </CardTitle>
            <Clock className="size-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoadingKpis ? "..." : `${kpis?.avgLatencyMs ?? 0} ms`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              End-to-end execution speed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70 backdrop-blur-xs shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Error / Quota Failure Rate
            </CardTitle>
            <AlertCircle className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoadingKpis ? "..." : `${kpis?.errorRate ?? 0}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis?.errorCount ?? 0} errors · {kpis?.quotaCount ?? 0} quota retries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Dimension Filters & Controls */}
      <Card className="border-border/70 bg-card/60">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Time Window */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Window:</span>
                <Select value={timeWindow} onValueChange={setTimeWindow}>
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24h</SelectItem>
                    <SelectItem value="7d">7d</SelectItem>
                    <SelectItem value="30d">30d</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Model */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Model:</span>
                <Select value={modelFilter} onValueChange={setModelFilter}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    <SelectItem value="chatterbox">Chatterbox-Turbo</SelectItem>
                    <SelectItem value="whisper">Whisper Large-v3</SelectItem>
                    <SelectItem value="qwen">Qwen2.5 / Kokoro</SelectItem>
                    <SelectItem value="musicgen">MusicGen</SelectItem>
                    <SelectItem value="audiogen">Meta AudioGen</SelectItem>
                    <SelectItem value="wan">Wan2.1 Video</SelectItem>
                    <SelectItem value="sdxl">SDXL-Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="quota_retry">Quota Retry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Studio */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Studio:</span>
                <Select value={studioFilter} onValueChange={setStudioFilter}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Studios</SelectItem>
                    <SelectItem value="tts">TTS</SelectItem>
                    <SelectItem value="stt">STT</SelectItem>
                    <SelectItem value="voice-agent">Voice Agent</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="sound-fx">Sound FX</SelectItem>
                    <SelectItem value="visuals">Visuals</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions: Search & Export */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter trace ID or action..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                className="gap-1.5 h-8 text-xs"
                title="Export as CSV"
              >
                <FileSpreadsheet className="size-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={exportJson}
                className="gap-1.5 h-8 text-xs"
                title="Export as JSON"
              >
                <FileJson className="size-3.5" />
                <span className="hidden sm:inline">JSON</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Trace Waterfall Table */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Interactive Trace Waterfall</CardTitle>
            <CardDescription>
              Step-by-step telemetry spans, token accounting, and complete JSON payloads stored in Native Convex.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {filteredTraces.length} Traces Loaded
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-y border-border/80 bg-muted/30 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Trace ID</th>
                  <th className="py-3 px-4">Studio & Action</th>
                  <th className="py-3 px-4">Model Identifier</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Tokens</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {isLoadingTraces ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground animate-pulse font-sans">
                      Streaming traces from Native Convex Trace Engine...
                    </td>
                  </tr>
                ) : filteredTraces.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground font-sans">
                      No traces recorded matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTraces.map((trace) => {
                    const isSuccess = trace.status === "success";
                    const isRetry = trace.status === "quota_retry";
                    return (
                      <tr
                        key={trace._id}
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                        onClick={() => setSelectedTrace(trace)}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              isSuccess
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : isRetry
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                isSuccess
                                  ? "bg-emerald-500"
                                  : isRetry
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {trace.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-foreground">
                          <span className="truncate max-w-[130px] block">{trace.traceId}</span>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-foreground capitalize">
                            {trace.studio}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                            {trace.actionType}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono text-[11px] max-w-[180px] truncate block">
                            {trace.model}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground">{trace.latencyMs}</span>
                          <span className="text-muted-foreground text-[10px]"> ms</span>
                        </td>
                        <td className="py-3 px-4">
                          {trace.totalTokens ? (
                            <span className="text-foreground">{trace.totalTokens.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-sans text-[11px] whitespace-nowrap">
                          {formatDistanceToNow(trace.createdAt, { addSuffix: true })}
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrace(trace);
                            }}
                            className="h-7 px-2 text-xs text-primary hover:text-primary"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trace Waterfall Modal */}
      <Dialog open={!!selectedTrace} onOpenChange={(open) => !open && setSelectedTrace(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="size-4 text-indigo-500" />
                <span>Trace Telemetry Span</span>
              </DialogTitle>
              <Badge
                variant="outline"
                className={`font-mono text-xs uppercase ${
                  selectedTrace?.status === "success"
                    ? "text-emerald-500 border-emerald-500/30"
                    : "text-rose-500 border-rose-500/30"
                }`}
              >
                {selectedTrace?.status}
              </Badge>
            </div>
            <DialogDescription className="font-mono text-xs text-muted-foreground">
              Trace ID: {selectedTrace?.traceId}
            </DialogDescription>
          </DialogHeader>

          {selectedTrace && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Quick Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Studio
                  </span>
                  <span className="font-semibold capitalize text-foreground">
                    {selectedTrace.studio}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Action Type
                  </span>
                  <span className="font-semibold text-foreground truncate block">
                    {selectedTrace.actionType}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Latency
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedTrace.latencyMs} ms
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Total Tokens
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedTrace.totalTokens?.toLocaleString() ?? "N/A"}
                  </span>
                </div>
              </div>

              {/* Model & Trace IDs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">Model Identifier</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={() => copyToClipboard(selectedTrace.model, "Model")}
                  >
                    {copiedField === "Model" ? <Check className="size-3" /> : <Copy className="size-3" />}
                    Copy
                  </Button>
                </div>
                <div className="p-2 bg-muted/40 rounded-lg font-mono text-xs border border-border/70">
                  {selectedTrace.model}
                </div>
              </div>

              {/* Error & Stack Trace */}
              {selectedTrace.errorMessage && (
                <div className="space-y-1">
                  <span className="font-semibold text-rose-500">Error Message</span>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg font-mono text-xs whitespace-pre-wrap">
                    {selectedTrace.errorMessage}
                  </div>
                </div>
              )}

              {selectedTrace.stackTrace && (
                <div className="space-y-1">
                  <span className="font-semibold text-rose-500">Stack Trace</span>
                  <pre className="p-3 bg-rose-500/5 border border-rose-500/20 text-rose-600 rounded-lg font-mono text-[11px] overflow-x-auto">
                    {selectedTrace.stackTrace}
                  </pre>
                </div>
              )}

              {/* Input Payload */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">Input Payload</span>
                  {selectedTrace.inputPayload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1"
                      onClick={() => copyToClipboard(selectedTrace.inputPayload!, "Input Payload")}
                    >
                      {copiedField === "Input Payload" ? <Check className="size-3" /> : <Copy className="size-3" />}
                      Copy
                    </Button>
                  )}
                </div>
                <pre className="p-3 bg-muted/30 border border-border/60 rounded-lg font-mono text-[11px] max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedTrace.inputPayload || "No input payload recorded"}
                </pre>
              </div>

              {/* Output Payload */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">Output Payload</span>
                  {selectedTrace.outputPayload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1"
                      onClick={() => copyToClipboard(selectedTrace.outputPayload!, "Output Payload")}
                    >
                      {copiedField === "Output Payload" ? <Check className="size-3" /> : <Copy className="size-3" />}
                      Copy
                    </Button>
                  )}
                </div>
                <pre className="p-3 bg-muted/30 border border-border/60 rounded-lg font-mono text-[11px] max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedTrace.outputPayload || "No output payload recorded"}
                </pre>
              </div>

              {/* Metadata */}
              {selectedTrace.metadata && (
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Trace Metadata</span>
                  <pre className="p-3 bg-muted/30 border border-border/60 rounded-lg font-mono text-[11px] max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {selectedTrace.metadata}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
