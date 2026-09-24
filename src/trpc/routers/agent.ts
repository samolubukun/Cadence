import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { convexClient, api } from "@/lib/convex-server";
import { createTRPCRouter, orgProcedure } from "../init";
import { env } from "@/lib/env";

export const agentRouter = createTRPCRouter({
  // Start or configure a voice agent session & validate credits
  initSession: orgProcedure
    .input(
      z.object({
        persona: z.string().default("casual"),
        voiceMode: z.enum(["speed", "cloned"]).default("speed"),
        voiceId: z.string().optional(),
        voiceName: z.string().default("Heart (Kokoro)"),
        instructions: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check org credits: require at least 10 credits to start an interactive session
      const balance = await convexClient.query(api.credits.getBalance, { orgId: ctx.orgId });
      if ((balance ?? 0) < 10) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient credits to start a voice agent session (requires at least 10 credits).",
        });
      }


      // Pre-deduct initial 10 credits
      await convexClient.mutation(api.credits.deduct, {
        orgId: ctx.orgId,
        amount: 10,
      });

      // Insert active session record
      const sessionId = await convexClient.mutation(api.agent.createSession, {
        orgId: ctx.orgId,
        persona: input.persona,
        voiceMode: input.voiceMode,
        voiceId: input.voiceId as any,
        voiceName: input.voiceName,
      });

      // If cloned/library voice selected, retrieve its R2 audio key for Chatterbox synthesis
      let voiceKey: string | undefined = undefined;
      if (input.voiceId) {
        try {
          const voiceRecord = await convexClient.query(api.voices.getById, {
            id: input.voiceId as any,
          });
          voiceKey = voiceRecord?.r2ObjectKey;
        } catch (e) {
          // fallback if id is not a convex voice id
        }
      }

      // Default Modal WebSocket endpoint or local fallback
      const wsUrl =
        env.CADENCE_AGENT_WS_URL ||
        (env.CADENCE_AGENT_API_URL
          ? env.CADENCE_AGENT_API_URL.replace(/^http/, "ws") + "/ws/realtime"
          : "wss://samuelolubukun--cadence-agent-cadenceagentengine-serve.modal.run/ws/realtime");

      return {
        sessionId,
        wsUrl,
        orgId: ctx.orgId,
        voiceKey,
        cadenceApiUrl: env.CADENCE_API_URL,
        cadenceApiKey: env.CADENCE_API_KEY,
        token: `cadence_sess_${sessionId}_${Date.now()}`,
      };
    }),

  // Conclude voice session and finalize duration
  endSession: orgProcedure
    .input(
      z.object({
        sessionId: z.string(),
        durationSeconds: z.number().min(0),
        status: z.enum(["completed", "interrupted"]).default("completed"),
      })
    )
    .mutation(async ({ input }) => {
      await convexClient.mutation(api.agent.endSession, {
        sessionId: input.sessionId as any,
        durationSeconds: Math.round(input.durationSeconds),
        status: input.status,
      });
      return { success: true };
    }),

  // Record a conversation turn into the database for persistent history
  recordTurn: orgProcedure
    .input(
      z.object({
        sessionId: z.string(),
        role: z.enum(["user", "assistant", "system"]),
        text: z.string().min(1),
        latencyMs: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await convexClient.mutation(api.agent.appendTurn, {
        sessionId: input.sessionId as any,
        message: {
          role: input.role,
          text: input.text,
          latencyMs: input.latencyMs,
          timestamp: Date.now(),
        },
      });
      return { success: true };
    }),

  listSessions: orgProcedure.query(async ({ ctx }) => {
    const sessions = await convexClient.query(api.agent.listSessions, {
      orgId: ctx.orgId,
    });
    return sessions ?? [];
  }),

  getSession: orgProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await convexClient.query(api.agent.getSession, {
        sessionId: input.sessionId as any,
      });
      return session ?? null;
    }),
});

