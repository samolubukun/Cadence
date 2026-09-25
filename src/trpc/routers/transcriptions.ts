import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { parseBuffer } from "music-metadata";
import { env } from "@/lib/env";
import { convexClient, api } from "@/lib/convex-server";
import { uploadAudio } from "@/lib/r2";
import { trackGeneration } from "@/lib/langfuse";
import { createTRPCRouter, orgProcedure } from "../init";

export const transcriptionsRouter = createTRPCRouter({
  transcribe: orgProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        base64Audio: z.string().min(1),
        mimeType: z.string().default("audio/wav"),
        durationSeconds: z.number().optional(),
        diarize: z.boolean().default(true),
        minSpeakers: z.number().optional(),
        maxSpeakers: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Convert base64 audio to Buffer
      const audioBuffer = Buffer.from(input.base64Audio, "base64");

      // Determine audio duration in seconds
      let durationSec = input.durationSeconds;
      if (!durationSec || durationSec <= 0) {
        try {
          const metadata = await parseBuffer(
            new Uint8Array(audioBuffer),
            { mimeType: input.mimeType.split(";")[0]?.trim() || "audio/wav" },
            { duration: true }
          );
          durationSec = metadata.format.duration;
        } catch {
          // If unable to parse, fallback to 60 seconds
          durationSec = 60;
        }
      }

      const durationToBill = durationSec || 60;
      // 15 credits per minute (or fraction thereof), minimum 15 credits
      const billedMinutes = Math.max(1, Math.ceil(durationToBill / 60));
      const creditsCost = billedMinutes * 15;

      // Deduct credits based on audio duration
      try {
        await convexClient.mutation(api.credits.deduct, {
          orgId: ctx.orgId,
          amount: creditsCost,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("INSUFFICIENT_CREDITS")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Insufficient credits for transcription (requires ${creditsCost} credits for ~${billedMinutes} min)`,
          });
        }
      }
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

        // Persist to Convex database
        const transcriptionId = await convexClient.mutation(api.transcriptions.create, {
          orgId: ctx.orgId,
          audioKey,
          fileName: input.fileName,
          language: result.language,
          duration: result.duration,
          text: result.text,
          status: "completed",
          segments: result.segments,
        });

        const wordCount = result.text.split(/\s+/).filter(Boolean).length;
        trackGeneration({
          name: "cadence-whisper-transcription",
          studio: "stt",
          actionType: "transcribe",
          userId: ctx.userId,
          orgId: ctx.orgId,
          model: "OpenAI-Whisper-Large-v3",
          latencyMs: 850,
          input: { fileName: input.fileName, durationSeconds: result.duration },
          output: { text: result.text.slice(0, 500), language: result.language, segmentsCount: result.segments?.length },
          metadata: { duration: result.duration, language: result.language, studio: "stt" },
          usage: {
            promptTokens: Math.ceil((result.duration ?? 5) * 50),
            completionTokens: Math.ceil(wordCount * 1.3),
            totalTokens: Math.ceil((result.duration ?? 5) * 50) + Math.ceil(wordCount * 1.3),
          },
        }).catch((e) => console.error(e));

        return {
          id: transcriptionId,
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

  getAll: orgProcedure.query(async ({ ctx }) => {
    const list = await convexClient.query(api.transcriptions.list, {
      orgId: ctx.orgId,
    });
    return list.map((item) => ({
      id: item._id as string,
      audioKey: item.audioKey,
      fileName: item.fileName,
      language: item.language,
      duration: item.duration,
      text: item.text,
      status: item.status,
      segments: item.segments,
      createdAt: new Date(item._creationTime),
    }));
  }),
});
