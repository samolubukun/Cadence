import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { cadence } from "@/lib/cadence-client";
import { convexClient, api } from "@/lib/convex-server";
import { uploadAudio } from "@/lib/r2";
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";
import { createTRPCRouter, orgProcedure } from "../init";
import type { Id } from "convex/_generated/dataModel";

export const generationsRouter = createTRPCRouter({
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const generation = await convexClient.query(api.generations.getById, {
        id: input.id as Id<"generations">,
      });

      if (!generation || generation.orgId !== ctx.orgId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        id: generation._id as string,
        text: generation.text,
        voiceName: generation.voiceName,
        voiceId: generation.voiceId ? (generation.voiceId as string) : null,
        temperature: generation.temperature,
        topP: generation.topP,
        topK: generation.topK,
        repetitionPenalty: generation.repetitionPenalty,
        createdAt: new Date(generation._creationTime),
        updatedAt: new Date(generation._creationTime),
        audioUrl: `/api/audio/${generation._id}`,
      };
    }),
  
  getAll: orgProcedure.query(async ({ ctx }) => {
    const generations = await convexClient.query(api.generations.list, {
      orgId: ctx.orgId,
    });

    return generations.map((generation) => ({
      id: generation._id as string,
      text: generation.text,
      voiceName: generation.voiceName,
      voiceId: generation.voiceId ? (generation.voiceId as string) : null,
      temperature: generation.temperature,
      topP: generation.topP,
      topK: generation.topK,
      repetitionPenalty: generation.repetitionPenalty,
      createdAt: new Date(generation._creationTime),
      updatedAt: new Date(generation._creationTime),
      audioUrl: `/api/audio/${generation._id}`,
    }));
  }),

  create: orgProcedure
    .input(
      z.object({
        text: z.string().min(1).max(TEXT_MAX_LENGTH),
        voiceId: z.string().min(1),
        temperature: z.number().min(0).max(2).default(0.8),
        topP: z.number().min(0).max(1).default(0.95),
        topK: z.number().min(1).max(10000).default(1000),
        repetitionPenalty: z.number().min(1).max(2).default(1.2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check and deduct credits based on text length
      try {
        await convexClient.mutation(api.credits.deduct, {
          orgId: ctx.orgId,
          amount: input.text.length,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("INSUFFICIENT_CREDITS")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient credits for this generation",
          });
        }
      }

      const voice = await convexClient.query(api.voices.getById, {
        id: input.voiceId as Id<"voices">,
      });

      if (!voice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      if (voice.variant === "CUSTOM" && voice.orgId !== ctx.orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      if (!voice.r2ObjectKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voice audio not available",
        });
      }

      const { data, error } = await cadence.POST("/generate", {
        body: {
          prompt: input.text,
          voice_key: voice.r2ObjectKey,
          temperature: input.temperature,
          top_p: input.topP,
          top_k: input.topK,
          repetition_penalty: input.repetitionPenalty,
          norm_loudness: true,
        },
        parseAs: "arrayBuffer",
      });

      Sentry.logger.info("Generation started", {
        orgId: ctx.orgId,
        voiceId: input.voiceId,
        textLength: input.text.length,
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate audio",
        });
      }

      if (!(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid audio response",
        });
      }

      const buffer = Buffer.from(data);
      let generationId: Id<"generations"> | null = null;
      let r2ObjectKey: string | null = null;

      try {
        generationId = await convexClient.mutation(api.generations.create, {
          orgId: ctx.orgId,
          text: input.text,
          voiceName: voice.name,
          voiceId: voice._id,
          temperature: input.temperature,
          topP: input.topP,
          topK: input.topK,
          repetitionPenalty: input.repetitionPenalty,
        });

        r2ObjectKey = `generations/orgs/${ctx.orgId}/${generationId}`;

        await uploadAudio({ buffer, key: r2ObjectKey });

        await convexClient.mutation(api.generations.updateR2Key, {
          id: generationId,
          r2ObjectKey,
        });

        Sentry.logger.info("Audio generated", {
          orgId: ctx.orgId,
          generationId,
        });
      } catch {
        if (generationId) {
          await convexClient.mutation(api.generations.remove, {
            id: generationId,
          }).catch(() => {});
        }

        console.error("Generation failed", {
          orgId: ctx.orgId,
          voiceId: input.voiceId,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      if (!generationId || !r2ObjectKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      return {
        id: generationId as string,
      };
    }),
});
