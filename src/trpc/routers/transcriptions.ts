import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/lib/env";
import { convexClient, api } from "@/lib/convex-server";
import { uploadAudio } from "@/lib/r2";
import { createTRPCRouter, orgProcedure } from "../init";

export const transcriptionsRouter = createTRPCRouter({
  transcribe: orgProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        base64Audio: z.string().min(1),
        mimeType: z.string().default("audio/wav"),
        diarize: z.boolean().default(true),
        minSpeakers: z.number().optional(),
        maxSpeakers: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Deduct standard credits for transcription (e.g. 50 credits per transcription)
      try {
        await convexClient.mutation(api.credits.deduct, {
          orgId: ctx.orgId,
          amount: 50,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("INSUFFICIENT_CREDITS")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient credits for transcription",
          });
        }
      }

      // Convert base64 audio to Buffer
      const audioBuffer = Buffer.from(input.base64Audio, "base64");
      const timestamp = Date.now();
      const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const audioKey = `transcriptions/orgs/${ctx.orgId}/${timestamp}_${sanitizedName}`;

      // Upload to Cloudflare R2
      try {
        await uploadAudio({
          buffer: audioBuffer,
          key: audioKey,
          contentType: input.mimeType,
        });
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload audio to storage",
        });
      }

      // Call Cadence Modal Engine /transcribe endpoint
      try {
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: input.mimeType });
        formData.append("file", blob, sanitizedName);
        formData.append("audio_key", audioKey);
        formData.append("diarize", String(input.diarize));
        if (input.minSpeakers !== undefined) {
          formData.append("min_speakers", String(input.minSpeakers));
        }
        if (input.maxSpeakers !== undefined) {
          formData.append("max_speakers", String(input.maxSpeakers));
        }

        const modalResponse = await fetch(`${env.CADENCE_API_URL}/transcribe`, {
          method: "POST",
          headers: {
            "x-api-key": env.CADENCE_API_KEY,
          },
          body: formData,
        });

        if (!modalResponse.ok) {
          const errorText = await modalResponse.text();
          throw new Error(`Modal transcribe failed: ${errorText}`);
        }

        const result = (await modalResponse.json()) as {
          language?: string;
          duration?: number;
          text: string;
          segments: Array<{
            start: number;
            end: number;
            text: string;
            speaker?: string;
            words?: Array<{
              word: string;
              start?: number;
              end?: number;
              score?: number;
              speaker?: string;
            }>;
          }>;
        };

        return {
          audioKey,
          fileName: input.fileName,
          language: result.language,
          duration: result.duration,
          text: result.text,
          segments: result.segments,
        };
      } catch (sttError: unknown) {
        const errorMsg =
          sttError instanceof Error ? sttError.message : "Failed to transcribe audio";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMsg,
        });
      }
    }),
});
