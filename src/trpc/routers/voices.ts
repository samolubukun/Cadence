import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { convexClient, api } from "@/lib/convex-server";
import { deleteAudio } from "@/lib/r2";
import { createTRPCRouter, orgProcedure, baseProcedure } from "../init";
import type { Id } from "convex/_generated/dataModel";

export const voicesRouter = createTRPCRouter({
  getPublicSystemVoices: baseProcedure
    .query(async () => {
      const result = await convexClient.query(api.voices.list, {});
      type VoiceRecord = {
        _id: Id<"voices">;
        name: string;
        description?: string;
        category: string;
        language: string;
        variant: "SYSTEM" | "CUSTOM";
      };
      return (result.system || []).map((v: VoiceRecord) => ({
        id: v._id as string,
        name: v.name,
        description: v.description ?? null,
        category: v.category,
        language: v.language,
        variant: v.variant,
      }));
    }),

  getAll: orgProcedure
    .input(
      z
        .object({
          query: z.string().trim().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const result = await convexClient.query(api.voices.list, {
        search: input?.query,
        orgId: ctx.orgId,
      });

      type VoiceRecord = {
        _id: Id<"voices">;
        name: string;
        description?: string;
        category: string;
        language: string;
        variant: "SYSTEM" | "CUSTOM";
      };

      const mapVoice = (v: VoiceRecord) => ({
        id: v._id as string,
        name: v.name,
        description: v.description ?? null,
        category: v.category,
        language: v.language,
        variant: v.variant,
      });

      return {
        custom: (result.custom || []).map(mapVoice),
        system: (result.system || []).map(mapVoice),
      };
    }),

  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const voice = await convexClient.query(api.voices.getById, {
        id: input.id as Id<"voices">,
      });

      if (!voice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      if (voice.variant === "CUSTOM" && voice.orgId !== ctx.orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      await convexClient.mutation(api.voices.deleteVoice, {
        id: input.id as Id<"voices">,
      });

      if (voice.r2ObjectKey) {
        await deleteAudio(voice.r2ObjectKey).catch(() => {});
      }

      return { success: true };
    }),
});
