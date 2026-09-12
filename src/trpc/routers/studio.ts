import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { cadence, cadenceMedia, cadenceSong, cadenceSound } from "@/lib/cadence-client";
import { convexClient, api } from "@/lib/convex-server";
import { uploadAudio, getSignedAudioUrl } from "@/lib/r2";
import { createTRPCRouter, orgProcedure } from "../init";
import type { Id } from "convex/_generated/dataModel";

export const studioRouter = createTRPCRouter({
  // ---------------------------------------------------------------------------
  // 1a. Beat / Instrumental Generation (MusicGen – no vocals)
  // ---------------------------------------------------------------------------
  generateBeats: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(2000),
        duration: z.number().min(10).max(120).default(30),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await cadenceSound.POST("/generate-beats" as any, {
        body: {
          prompt: input.prompt,
          duration: input.duration,
        },
        parseAs: "arrayBuffer",
      });

      if (error || !(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate beats",
        });
      }

      const songId = await convexClient.mutation(api.studio.createSong, {
        orgId: ctx.orgId,
        title: `[Beat] ${input.prompt.slice(0, 44)}`,
        prompt: input.prompt,
        duration: input.duration,
        status: "completed",
      });

      const r2Key = `beats/orgs/${ctx.orgId}/${songId}.wav`;
      await uploadAudio({
        key: r2Key,
        buffer: Buffer.from(data),
        contentType: "audio/wav",
      });
      await convexClient.mutation(api.studio.updateSongR2, {
        id: songId,
        r2ObjectKey: r2Key,
        status: "completed",
      });

      const signedUrl = await getSignedAudioUrl(r2Key);
      return { id: songId, r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 1b. Full Song Generation with Vocals (ACE-Step 1.5 Turbo)
  // ---------------------------------------------------------------------------
  listSongs: orgProcedure.query(async ({ ctx }) => {
    return await convexClient.query(api.studio.listSongs, { orgId: ctx.orgId });
  }),

  generateSong: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(2000),
        lyrics: z.string().optional(),
        duration: z.number().min(10).max(240).default(60),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await cadenceSong.POST("/generate-song", {
        body: {
          prompt: input.prompt,
          lyrics: input.lyrics || "",
          duration: input.duration,
        },
        parseAs: "arrayBuffer",
      });

      if (error || !(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate song",
        });
      }

      const songId = await convexClient.mutation(api.studio.createSong, {
        orgId: ctx.orgId,
        title: input.prompt.slice(0, 50),
        prompt: input.prompt,
        lyrics: input.lyrics,
        duration: input.duration,
        status: "completed",
      });

      const r2Key = `songs/orgs/${ctx.orgId}/${songId}.wav`;
      await uploadAudio({
        key: r2Key,
        buffer: Buffer.from(data),
        contentType: "audio/wav",
      });
      await convexClient.mutation(api.studio.updateSongR2, {
        id: songId,
        r2ObjectKey: r2Key,
        status: "completed",
      });

      const signedUrl = await getSignedAudioUrl(r2Key);
      return { id: songId, r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 2. Sound Effects (SFX)
  // ---------------------------------------------------------------------------
  listSoundEffects: orgProcedure.query(async ({ ctx }) => {
    return await convexClient.query(api.studio.listSoundEffects, { orgId: ctx.orgId });
  }),

  generateSound: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(1000),
        duration: z.number().min(1).max(30).default(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await cadenceSound.POST("/generate-sound" as any, {
        body: {
          prompt: input.prompt,
          duration: input.duration,
        },
        parseAs: "arrayBuffer",
      });

      if (error || !(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate sound effect",
        });
      }

      const sfxId = await convexClient.mutation(api.studio.createSoundEffect, {
        orgId: ctx.orgId,
        prompt: input.prompt,
        duration: input.duration,
        status: "completed",
      });

      const r2Key = `sfx/orgs/${ctx.orgId}/${sfxId}.wav`;
      await uploadAudio({
        key: r2Key,
        buffer: Buffer.from(data),
        contentType: "audio/wav",
      });

      const signedUrl = await getSignedAudioUrl(r2Key);
      return { id: sfxId, r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 3. Speech-to-Speech & Voice Changer
  // ---------------------------------------------------------------------------
  listVoiceConversions: orgProcedure.query(async ({ ctx }) => {
    return await convexClient.query(api.studio.listVoiceConversions, { orgId: ctx.orgId });
  }),

  convertVoice: orgProcedure
    .input(
      z.object({
        sourceAudioKey: z.string().optional(),
        targetVoiceKey: z.string(),
        pitchShift: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await cadence.POST("/voice-change" as any, {
        body: {
          source_audio_key: input.sourceAudioKey,
          target_voice_key: input.targetVoiceKey,
          pitch_shift: input.pitchShift,
        },
        parseAs: "arrayBuffer",
      });

      if (error || !(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to convert voice",
        });
      }

      const conversionId = await convexClient.mutation(api.studio.createVoiceConversion, {
        orgId: ctx.orgId,
        sourceAudioKey: input.sourceAudioKey,
        targetVoiceKey: input.targetVoiceKey,
        pitchShift: input.pitchShift,
        status: "completed",
      });

      const r2Key = `voice-conversions/orgs/${ctx.orgId}/${conversionId}.wav`;
      await uploadAudio({
        key: r2Key,
        buffer: Buffer.from(data),
        contentType: "audio/wav",
      });

      return { id: conversionId, r2Key };
    }),

  // ---------------------------------------------------------------------------
  // 4. Media (Images & Videos)
  // ---------------------------------------------------------------------------
  listMediaGenerations: orgProcedure.query(async ({ ctx }) => {
    return await convexClient.query(api.studio.listMediaGenerations, { orgId: ctx.orgId });
  }),

  generateImage: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(2000),
        aspectRatio: z.string().default("1:1"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await cadenceMedia.POST("/generate-image", {
        body: {
          prompt: input.prompt,
          aspect_ratio: input.aspectRatio,
        },
        parseAs: "arrayBuffer",
      });

      if (error || !(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate image",
        });
      }

      const mediaId = await convexClient.mutation(api.studio.createMediaGeneration, {
        orgId: ctx.orgId,
        type: "image",
        prompt: input.prompt,
        aspectRatio: input.aspectRatio,
        status: "completed",
      });

      const r2Key = `media/orgs/${ctx.orgId}/${mediaId}.png`;
      await uploadAudio({
        key: r2Key,
        buffer: Buffer.from(data),
        contentType: "image/png",
      });

      return { id: mediaId, r2Key };
    }),

  generateVideo: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(2000),
        durationSeconds: z.number().default(4),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await cadenceMedia.POST("/generate-video", {
        body: {
          prompt: input.prompt,
          duration_seconds: input.durationSeconds,
        },
        parseAs: "arrayBuffer",
      });

      if (error || !(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate video",
        });
      }

      const mediaId = await convexClient.mutation(api.studio.createMediaGeneration, {
        orgId: ctx.orgId,
        type: "video",
        prompt: input.prompt,
        duration: input.durationSeconds,
        status: "completed",
      });

      const r2Key = `media/orgs/${ctx.orgId}/${mediaId}.mp4`;
      await uploadAudio({
        key: r2Key,
        buffer: Buffer.from(data),
        contentType: "video/mp4",
      });

      return { id: mediaId, r2Key };
    }),
});
