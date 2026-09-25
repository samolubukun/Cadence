import { Langfuse } from "langfuse";
import { convexClient, api } from "@/lib/convex-server";
import { randomUUID } from "node:crypto";

// Server-side Langfuse client instance
export const langfuse = new Langfuse({
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
});

export interface TraceGenerationParams {
  name: string;
  userId?: string;
  orgId?: string;
  studio?: string; // "tts" | "agent" | "stt" | "sfx" | "music" | "visuals" | "video"
  actionType?: string;
  model: string;
  input: any;
  output?: any;
  status?: "success" | "error" | "quota_retry";
  latencyMs?: number;
  errorMessage?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    unit?: string;
    count?: number;
  };
}

/**
 * Dual-Stream Tracing Architecture:
 * Every interaction streams telemetry concurrently to:
 * 1. Langfuse Cloud: Distributed execution spans, input prompts, full completions, token accounting & latency percentiles.
 * 2. Native Convex Trace Engine (llm_traces): Real-time reactive storage for instant querying, filtering, audits, and waterfall inspections inside the app.
 */
export async function trackGeneration(params: TraceGenerationParams) {
  const traceId = `trc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const status = params.status ?? "success";
  const latency = params.latencyMs ?? (params.metadata?.latencyMs as number) ?? 120;
  const studio = params.studio ?? (params.metadata?.studio as string) ?? "tts";
  const actionType = params.actionType ?? params.name;

  // Stream 1: Langfuse Cloud
  const langfusePromise = (async () => {
    try {
      const trace = langfuse.trace({
        id: traceId,
        name: params.name,
        userId: params.userId,
        metadata: {
          orgId: params.orgId,
          studio,
          status,
          ...params.metadata,
        },
      });

      const generation = trace.generation({
        name: `${params.name}-generation`,
        model: params.model,
        input: params.input,
        output: params.output,
        metadata: params.metadata,
        usage: params.usage,
      });

      generation.end();
      await langfuse.flushAsync();
    } catch (err) {
      console.warn("Langfuse Cloud tracing skipped or errored:", err);
    }
  })();

  // Stream 2: Native Convex Trace Engine (llm_traces)
  const convexPromise = (async () => {
    try {
      await convexClient.mutation(api.traces.insertTrace, {
        traceId,
        orgId: params.orgId,
        userId: params.userId,
        studio,
        actionType,
        model: params.model,
        status,
        latencyMs: latency,
        promptTokens: params.usage?.promptTokens,
        completionTokens: params.usage?.completionTokens,
        totalTokens: params.usage?.totalTokens,
        inputPayload: params.input ? JSON.stringify(params.input).slice(0, 5000) : undefined,
        outputPayload: params.output ? JSON.stringify(params.output).slice(0, 5000) : undefined,
        errorMessage: params.errorMessage,
        stackTrace: params.stackTrace,
        metadata: params.metadata ? JSON.stringify(params.metadata).slice(0, 3000) : undefined,
      });
    } catch (err) {
      console.warn("Convex Trace Engine insertion error:", err);
    }
  })();

  // Execute concurrently without blocking caller
  await Promise.allSettled([langfusePromise, convexPromise]);
}
