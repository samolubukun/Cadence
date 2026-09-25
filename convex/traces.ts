import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Insert a trace into the Native Convex Trace Engine
export const insertTrace = mutation({
  args: {
    traceId: v.string(),
    orgId: v.optional(v.string()),
    userId: v.optional(v.string()),
    studio: v.string(),
    actionType: v.string(),
    model: v.string(),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("quota_retry")),
    latencyMs: v.number(),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    inputPayload: v.optional(v.string()),
    outputPayload: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    stackTrace: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("llm_traces", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Query filtered traces with limit
export const listTraces = query({
  args: {
    timeWindow: v.optional(v.string()), // "24h" | "7d" | "30d" | "all"
    model: v.optional(v.string()),
    status: v.optional(v.string()), // "success" | "error" | "quota_retry"
    studio: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let minTime = 0;
    if (args.timeWindow === "24h") minTime = now - 24 * 60 * 60 * 1000;
    else if (args.timeWindow === "7d") minTime = now - 7 * 24 * 60 * 60 * 1000;
    else if (args.timeWindow === "30d") minTime = now - 30 * 24 * 60 * 60 * 1000;

    let traces = await ctx.db
      .query("llm_traces")
      .withIndex("by_createdAt", (q) => (minTime > 0 ? q.gte("createdAt", minTime) : q))
      .order("desc")
      .take(args.limit ?? 200);

    if (args.model && args.model !== "all") {
      traces = traces.filter((t) => t.model.toLowerCase().includes(args.model!.toLowerCase()));
    }
    if (args.status && args.status !== "all") {
      traces = traces.filter((t) => t.status === args.status);
    }
    if (args.studio && args.studio !== "all") {
      traces = traces.filter((t) => t.studio === args.studio);
    }

    return traces;
  },
});

// Aggregate real-time KPIs across time window
export const getKpis = query({
  args: {
    timeWindow: v.optional(v.string()), // "24h" | "7d" | "30d" | "all"
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let minTime = 0;
    if (args.timeWindow === "24h") minTime = now - 24 * 60 * 60 * 1000;
    else if (args.timeWindow === "7d") minTime = now - 7 * 24 * 60 * 60 * 1000;
    else if (args.timeWindow === "30d") minTime = now - 30 * 24 * 60 * 60 * 1000;

    const traces = await ctx.db
      .query("llm_traces")
      .withIndex("by_createdAt", (q) => (minTime > 0 ? q.gte("createdAt", minTime) : q))
      .collect();

    const totalRequests = traces.length;
    let totalTokens = 0;
    let totalLatency = 0;
    let errorCount = 0;
    let quotaCount = 0;

    for (const t of traces) {
      totalTokens += t.totalTokens ?? 0;
      totalLatency += t.latencyMs;
      if (t.status === "error") errorCount++;
      if (t.status === "quota_retry") quotaCount++;
    }

    const avgLatencyMs = totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0;
    const errorRate = totalRequests > 0 ? ((errorCount + quotaCount) / totalRequests) * 100 : 0;

    return {
      totalRequests,
      totalTokens,
      avgLatencyMs,
      errorCount,
      quotaCount,
      errorRate: Number(errorRate.toFixed(2)),
    };
  },
});

// Automated / on-demand pruning mutation (7-day retention)
export const pruneOldTraces = mutation({
  args: {
    retentionDays: v.optional(v.number()), // default 7
  },
  handler: async (ctx, args) => {
    const days = args.retentionDays ?? 7;
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000;

    const oldTraces = await ctx.db
      .query("llm_traces")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", threshold))
      .take(500);

    let deleted = 0;
    for (const trace of oldTraces) {
      await ctx.db.delete(trace._id);
      deleted++;
    }

    return { deletedCount: deleted, threshold };
  },
});
