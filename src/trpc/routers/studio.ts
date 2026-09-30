import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { cadence, cadenceMedia, cadenceSenseNova, cadenceQwenImage, cadenceSong, cadenceSound, cadenceStudioClient, cadenceClipper } from "@/lib/cadence-client";
import { convexClient, api } from "@/lib/convex-server";
import { uploadAudio, getSignedAudioUrl } from "@/lib/r2";
import { trackGeneration } from "@/lib/langfuse";
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
      // Deduct 50 credits for instrumental beat generation
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
            message: "Insufficient credits for instrumental beat generation (requires 50 credits)",
          });
        }
      }

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

      trackGeneration({
        name: "cadence-beats-generation",
        studio: "music",
        actionType: "generate-beats",
        userId: ctx.userId,
        orgId: ctx.orgId,
        model: "Meta-MusicGen-Melody",
        latencyMs: 1400,
        input: { prompt: input.prompt, duration: input.duration },
        output: { songId, r2Key },
        metadata: { duration: input.duration, studio: "music" },
        usage: {
          promptTokens: Math.ceil(input.prompt.length / 4),
          completionTokens: Math.ceil((input.duration ?? 10) * 15),
          totalTokens: Math.ceil(input.prompt.length / 4) + Math.ceil((input.duration ?? 10) * 15),
        },
      }).catch((e) => console.error(e));

      const signedUrl = await getSignedAudioUrl(r2Key);
      return { id: songId, r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 1b. Full Song Generation with Vocals (ACE-Step 1.5 Turbo)
  // ---------------------------------------------------------------------------
  listSongs: orgProcedure.query(async ({ ctx }) => {
    const songs = await convexClient.query(api.studio.listSongs, { orgId: ctx.orgId });
    return await Promise.all(
      songs.map(async (song) => ({
        ...song,
        url: song.r2ObjectKey ? await getSignedAudioUrl(song.r2ObjectKey) : null,
      }))
    );
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
      // Deduct 150 credits for full vocal song composition
      try {
        await convexClient.mutation(api.credits.deduct, {
          orgId: ctx.orgId,
          amount: 150,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("INSUFFICIENT_CREDITS")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient credits for song generation (requires 150 credits)",
          });
        }
      }

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

      trackGeneration({
        name: "cadence-song-composition",
        studio: "music",
        actionType: "generate-song",
        userId: ctx.userId,
        orgId: ctx.orgId,
        model: "ACE-Step-1.5-Turbo",
        latencyMs: 2200,
        input: { prompt: input.prompt, lyrics: input.lyrics, duration: input.duration },
        output: { songId, r2Key },
        metadata: { duration: input.duration, studio: "music" },
        usage: {
          promptTokens: Math.ceil((input.prompt.length + (input.lyrics?.length || 0)) / 4),
          completionTokens: Math.ceil((input.duration ?? 30) * 20),
          totalTokens: Math.ceil((input.prompt.length + (input.lyrics?.length || 0)) / 4) + Math.ceil((input.duration ?? 30) * 20),
        },
      }).catch((e) => console.error(e));

      const signedUrl = await getSignedAudioUrl(r2Key);
      return { id: songId, r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 2. Sound Effects (SFX)
  // ---------------------------------------------------------------------------
  listSoundEffects: orgProcedure.query(async ({ ctx }) => {
    const sfxList = await convexClient.query(api.studio.listSoundEffects, { orgId: ctx.orgId });
    return await Promise.all(
      sfxList.map(async (sfx) => ({
        ...sfx,
        url: sfx.r2ObjectKey ? await getSignedAudioUrl(sfx.r2ObjectKey) : null,
      }))
    );
  }),

  generateSound: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(1000),
        duration: z.number().min(1).max(30).default(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Deduct 25 credits for sound effect generation
      try {
        await convexClient.mutation(api.credits.deduct, {
          orgId: ctx.orgId,
          amount: 25,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("INSUFFICIENT_CREDITS")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient credits for sound effect generation (requires 25 credits)",
          });
        }
      }

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

      trackGeneration({
        name: "cadence-sfx-generation",
        studio: "sound-fx",
        actionType: "generate-sound",
        userId: ctx.userId,
        orgId: ctx.orgId,
        model: "Meta-AudioGen",
        latencyMs: 950,
        input: { prompt: input.prompt, duration: input.duration },
        output: { sfxId, r2Key },
        metadata: { duration: input.duration, studio: "sound-fx" },
        usage: {
          promptTokens: Math.ceil(input.prompt.length / 4),
          completionTokens: Math.ceil((input.duration ?? 5) * 12),
          totalTokens: Math.ceil(input.prompt.length / 4) + Math.ceil((input.duration ?? 5) * 12),
        },
      }).catch((e) => console.error(e));

      return { id: sfxId, r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 3. Speech-to-Speech & Voice Changer
  // ---------------------------------------------------------------------------
  listVoiceConversions: orgProcedure.query(async ({ ctx }) => {
    const list = await convexClient.query(api.studio.listVoiceConversions, { orgId: ctx.orgId });
    return await Promise.all(
      list.map(async (item) => ({
        ...item,
        url: item.r2ObjectKey ? await getSignedAudioUrl(item.r2ObjectKey) : null,
      }))
    );
  }),

  convertVoice: orgProcedure
    .input(
      z.object({
        sourceAudioKey: z.string().optional(),
        sourceBase64Audio: z.string().optional(),
        targetVoiceKey: z.string().optional(),
        targetBase64Audio: z.string().optional(),
        pitchShift: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Deduct 50 credits for voice conversion
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
            message: "Insufficient credits for voice conversion (requires 50 credits)",
          });
        }
      }

      let sourceKey = input.sourceAudioKey;
      if (input.sourceBase64Audio) {
        const buffer = Buffer.from(input.sourceBase64Audio, "base64");
        sourceKey = `voice-conversions/source/${ctx.orgId}/${Date.now()}.wav`;
        await uploadAudio({
          key: sourceKey,
          buffer,
          contentType: "audio/wav",
        });
      }

      let targetKey = input.targetVoiceKey || "voices/system/jd704hxf4y0cy4xtpgep735ek98e4ng8";
      if (input.targetBase64Audio) {
        const buffer = Buffer.from(input.targetBase64Audio, "base64");
        targetKey = `voice-conversions/target-ref/${ctx.orgId}/${Date.now()}.wav`;
        await uploadAudio({
          key: targetKey,
          buffer,
          contentType: "audio/wav",
        });
      }

      const { data, error } = await cadence.POST("/voice-change" as any, {
        body: {
          source_audio_key: sourceKey,
          target_voice_key: targetKey,
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
        targetVoiceKey: input.targetVoiceKey || "",
        pitchShift: input.pitchShift,
        status: "completed",
      });

      const r2Key = `voice-conversions/orgs/${ctx.orgId}/${conversionId}.wav`;
      await uploadAudio({
        key: r2Key,
        buffer: Buffer.from(data),
        contentType: "audio/wav",
      });

      const signedUrl = await getSignedAudioUrl(r2Key);
      return { id: conversionId, r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 4. Media (Images & Videos)
  // ---------------------------------------------------------------------------
  listMediaGenerations: orgProcedure.query(async ({ ctx }) => {
    const list = await convexClient.query(api.studio.listMediaGenerations, { orgId: ctx.orgId });
    return await Promise.all(
      list.map(async (item) => ({
        ...item,
        url: item.r2ObjectKey ? await getSignedAudioUrl(item.r2ObjectKey) : null,
      }))
    );
  }),

  generateImage: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(2000),
        aspectRatio: z.string().default("1:1"),
        model: z.enum(["sdxl-turbo", "sensenova", "qwen-image-2-1"]).default("qwen-image-2-1"),
        transparent: z.boolean().default(false),
        quality: z.enum(["standard", "ultra"]).default("standard"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const isQwen = input.model === "qwen-image-2-1";
      const isSenseNova = input.model === "sensenova";
      const creditCost = isQwen ? 50 : isSenseNova ? 50 : 20;

      // Deduct credits based on selected model tier
      try {
        await convexClient.mutation(api.credits.deduct, {
          orgId: ctx.orgId,
          amount: creditCost,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("INSUFFICIENT_CREDITS")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Insufficient credits for ${isQwen ? "Qwen-Image-2.1 Engine (requires 50 credits)" : isSenseNova ? "SenseNova Studio Quality (requires 50 credits)" : "image generation (requires 20 credits)"}`,
          });
        }
      }

      let imageBuffer: Buffer;

      if (isQwen) {
        // Qwen-Image-2.1 Standalone Engine (7B DiT + 8B Qwen3-VL)
        const res = await cadenceQwenImage.POST("/generate", {
          body: {
            action: "generate",
            prompt: input.prompt,
            aspect_ratio: input.aspectRatio,
            quality: input.quality,
            transparent: input.transparent,
            num_steps: 30,
          },
        });

        if (res.error || !res.data || !res.data.image_base64) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate image via Qwen-Image-2.1 engine",
          });
        }

        imageBuffer = Buffer.from(res.data.image_base64, "base64");
      } else if (isSenseNova) {
        // SenseNova-U1.5-8B MoT Advanced Studio Engine
        const res = await cadenceSenseNova.POST("/generate", {
          body: {
            action: "generate",
            prompt: input.prompt,
            aspect_ratio: input.aspectRatio,
            quality: "standard",
            num_steps: 28,
            cfg_scale: 4.0,
            timestep_shift: 3.0,
          },
        });

        if (res.error || !res.data || !res.data.image_base64) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate image via SenseNova U1.5 engine",
          });
        }

        imageBuffer = Buffer.from(res.data.image_base64, "base64");
      } else {
        // Standard SDXL-Turbo Fast Engine
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
            message: "Failed to generate image via SDXL-Turbo",
          });
        }

        imageBuffer = Buffer.from(data);
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
        buffer: imageBuffer,
        contentType: "image/png",
      });

      const signedUrl = await getSignedAudioUrl(r2Key);

      trackGeneration({
        name: "cadence-image-generation",
        studio: "visuals",
        actionType: "generate-image",
        userId: ctx.userId,
        orgId: ctx.orgId,
        model: isQwen ? "Qwen-Image-2.1" : isSenseNova ? "SenseNova-U1.5-8B-MoT" : "SDXL-Turbo",
        latencyMs: isQwen ? 1800 : 750,
        input: { prompt: input.prompt, aspectRatio: input.aspectRatio, model: input.model },
        output: { mediaId, r2Key },
        metadata: { aspectRatio: input.aspectRatio, studio: "visuals" },
        usage: {
          promptTokens: Math.ceil(input.prompt.length / 4),
          completionTokens: 1024,
          totalTokens: Math.ceil(input.prompt.length / 4) + 1024,
        },
      }).catch((e) => console.error(e));

      return { id: mediaId, r2Key, url: signedUrl };
    }),

  editImage: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(2000),
        images: z.array(z.string()).min(1).max(10), // base64 strings (Qwen supports up to 10 contextual images)
        model: z.enum(["qwen-image-2-1", "sensenova"]).default("qwen-image-2-1"),
        quality: z.enum(["standard", "ultra"]).default("standard"),
        transparent: z.boolean().default(false),
        numSteps: z.number().min(10).max(50).default(30),
        cfgScale: z.number().min(1).max(15).default(4.0),
        imgCfgScale: z.number().min(0.1).max(5).default(1.0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const isQwen = input.model === "qwen-image-2-1";

      // Deduct 50 credits for AI image editing
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
            message: `Insufficient credits for ${isQwen ? "Qwen-Image-2.1" : "SenseNova"} Image Editing (requires 50 credits)`,
          });
        }
      }

      // Strip data URI prefix if present (e.g., "data:image/png;base64,")
      const cleanBase64Images = input.images.map((b64) => {
        const match = b64.match(/^data:image\/[a-zA-Z0-9+]+;base64,(.+)$/);
        return match ? match[1] : b64;
      });

      let imageBuffer: Buffer;

      if (isQwen) {
        // Qwen-Image-2.1 Standalone Engine: Optimized for high-precision single-image restyling & sharp typography on A10G (24GB).
        // (Note: Native multi-image cross-attention requires dedicated 80GB H100 infrastructure; use SenseNova for multi-image composites).
        const res = await cadenceQwenImage.POST("/generate", {
          body: {
            action: "edit",
            prompt: input.prompt,
            images: cleanBase64Images.slice(0, 1), // Pass primary reference image
            quality: input.quality,
            transparent: input.transparent,
            num_steps: input.numSteps,
          },
        });

        if (res.error || !res.data || !res.data.image_base64) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to edit image via Qwen-Image-2.1 engine",
          });
        }

        imageBuffer = Buffer.from(res.data.image_base64, "base64");
      } else {
        // SenseNova-U1.5-8B MoT Image-to-Image / Multi-Image Editing
        const res = await cadenceSenseNova.POST("/generate", {
          body: {
            action: "edit",
            prompt: input.prompt,
            images: cleanBase64Images.slice(0, 4),
            quality: input.quality,
            num_steps: input.numSteps,
            cfg_scale: input.cfgScale,
            img_cfg_scale: input.imgCfgScale,
            timestep_shift: 3.0,
          },
        });

        if (res.error || !res.data || !res.data.image_base64) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to edit image via SenseNova U1.5 engine",
          });
        }

        imageBuffer = Buffer.from(res.data.image_base64, "base64");
      }

      const mediaId = await convexClient.mutation(api.studio.createMediaGeneration, {
        orgId: ctx.orgId,
        type: "image",
        prompt: `[Edit] ${input.prompt}`,
        aspectRatio: "edited",
        status: "completed",
      });

      const r2Key = `media/orgs/${ctx.orgId}/${mediaId}.png`;
      await uploadAudio({
        key: r2Key,
        buffer: imageBuffer,
        contentType: "image/png",
      });

      const signedUrl = await getSignedAudioUrl(r2Key);

      trackGeneration({
        name: "cadence-image-edit",
        studio: "visuals",
        actionType: "edit-image",
        userId: ctx.userId,
        orgId: ctx.orgId,
        model: isQwen ? "Qwen-Image-2.1" : "SenseNova-U1.5-8B-MoT",
        latencyMs: 1950,
        input: { prompt: input.prompt, imageCount: input.images.length, model: input.model },
        output: { mediaId, r2Key },
        metadata: { quality: input.quality, transparent: input.transparent, studio: "visuals" },
        usage: {
          promptTokens: Math.ceil(input.prompt.length / 4) + input.images.length * 256,
          completionTokens: 1024,
          totalTokens: Math.ceil(input.prompt.length / 4) + input.images.length * 256 + 1024,
        },
      }).catch((e) => console.error(e));

      return { id: mediaId, r2Key, url: signedUrl };
    }),

  generateVideo: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(2000),
        durationSeconds: z.number().default(4),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Deduct 200 credits for video generation
      try {
        await convexClient.mutation(api.credits.deduct, {
          orgId: ctx.orgId,
          amount: 200,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("INSUFFICIENT_CREDITS")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient credits for video generation (requires 200 credits)",
          });
        }
      }

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

      const signedUrl = await getSignedAudioUrl(r2Key);

      trackGeneration({
        name: "cadence-video-generation",
        studio: "video",
        actionType: "generate-video",
        userId: ctx.userId,
        orgId: ctx.orgId,
        model: "Wan2.1-1.3B-Video",
        latencyMs: 3800,
        input: { prompt: input.prompt, duration: input.durationSeconds },
        output: { mediaId, r2Key },
        metadata: { duration: input.durationSeconds, studio: "video" },
        usage: {
          promptTokens: Math.ceil(input.prompt.length / 4),
          completionTokens: (input.durationSeconds ?? 4) * 512,
          totalTokens: Math.ceil(input.prompt.length / 4) + (input.durationSeconds ?? 4) * 512,
        },
      }).catch((e) => console.error(e));

      return { id: mediaId, r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 5. Neural Stem Separation (Meta Demucs v4)
  // ---------------------------------------------------------------------------
  listStems: orgProcedure.query(async ({ ctx }) => {
    const list = await convexClient.query(api.studio.listStems, { orgId: ctx.orgId });
    return await Promise.all(
      list.map(async (item) => ({
        ...item,
        vocalsUrl: item.vocalsKey ? await getSignedAudioUrl(item.vocalsKey) : null,
        drumsUrl: item.drumsKey ? await getSignedAudioUrl(item.drumsKey) : null,
        bassUrl: item.bassKey ? await getSignedAudioUrl(item.bassKey) : null,
        otherUrl: item.otherKey ? await getSignedAudioUrl(item.otherKey) : null,
      }))
    );
  }),

  separateStems: orgProcedure
    .input(
      z.object({
        fileName: z.string().default("track.mp3"),
        base64Audio: z.string().optional(),
        audioKey: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Deduct 30 credits for full 4-track stem separation
      try {
        await convexClient.mutation(api.credits.deduct, {
          orgId: ctx.orgId,
          amount: 30,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("INSUFFICIENT_CREDITS")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient credits for stem separation (requires 30 credits)",
          });
        }
      }

      // Call Modal CadenceStudioEngine /separate-stems endpoint
      const res = await cadenceStudioClient.POST("/separate-stems", {
        body: {
          audio_base64: input.base64Audio,
          audio_key: input.audioKey,
          model: "htdemucs",
        },
      });

      if (res.error || !res.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to separate audio stems via Demucs v4 engine",
        });
      }

      const stemId = await convexClient.mutation(api.studio.createStem, {
        orgId: ctx.orgId,
        sourceFileName: input.fileName,
        status: "completed",
      });

      // Upload individual stems to R2 if base64 buffers are returned
      const vocalsKey = `stems/orgs/${ctx.orgId}/${stemId}_vocals.wav`;
      const drumsKey = `stems/orgs/${ctx.orgId}/${stemId}_drums.wav`;
      const bassKey = `stems/orgs/${ctx.orgId}/${stemId}_bass.wav`;
      const otherKey = `stems/orgs/${ctx.orgId}/${stemId}_other.wav`;

      if (res.data.vocals_base64) {
        await uploadAudio({ key: vocalsKey, buffer: Buffer.from(res.data.vocals_base64, "base64"), contentType: "audio/wav" });
      }
      if (res.data.drums_base64) {
        await uploadAudio({ key: drumsKey, buffer: Buffer.from(res.data.drums_base64, "base64"), contentType: "audio/wav" });
      }
      if (res.data.bass_base64) {
        await uploadAudio({ key: bassKey, buffer: Buffer.from(res.data.bass_base64, "base64"), contentType: "audio/wav" });
      }
      if (res.data.other_base64) {
        await uploadAudio({ key: otherKey, buffer: Buffer.from(res.data.other_base64, "base64"), contentType: "audio/wav" });
      }

      await convexClient.mutation(api.studio.updateStemR2, {
        id: stemId,
        vocalsKey,
        drumsKey,
        bassKey,
        otherKey,
        status: "completed",
      });

      return {
        id: stemId,
        vocalsUrl: await getSignedAudioUrl(vocalsKey),
        drumsUrl: await getSignedAudioUrl(drumsKey),
        bassUrl: await getSignedAudioUrl(bassKey),
        otherUrl: await getSignedAudioUrl(otherKey),
      };
    }),

  // ---------------------------------------------------------------------------
  // 6. AI Singing Voice Conversion (RVC v2)
  // ---------------------------------------------------------------------------
  listSingingCovers: orgProcedure.query(async ({ ctx }) => {
    const list = await convexClient.query(api.studio.listSingingCovers, { orgId: ctx.orgId });
    return await Promise.all(
      list.map(async (item) => ({
        ...item,
        url: item.r2ObjectKey ? await getSignedAudioUrl(item.r2ObjectKey) : null,
      }))
    );
  }),

  createSingingCover: orgProcedure
    .input(
      z.object({
        title: z.string().default("AI Singing Cover"),
        targetVoiceKey: z.string().optional(),
        targetBase64Audio: z.string().optional(),
        pitchShift: z.number().min(-12).max(12).default(0),
        base64Audio: z.string().optional(),
        audioKey: z.string().optional(),
        remixInstrumental: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Deduct 50 credits for AI singing conversion and mix
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
            message: "Insufficient credits for singing voice cover (requires 50 credits)",
          });
        }
      }

      const res = await cadenceStudioClient.POST("/convert-singing", {
        body: {
          audio_base64: input.base64Audio,
          audio_key: input.audioKey,
          target_voice_key: input.targetVoiceKey || "",
          target_base64_audio: input.targetBase64Audio,
          pitch_shift: input.pitchShift,
          remix_instrumental: input.remixInstrumental,
        },
      });

      if (res.error || !res.data || !res.data.audio_base64) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to render singing voice cover via RVC v2",
        });
      }

      const coverId = await convexClient.mutation(api.studio.createSingingCover, {
        orgId: ctx.orgId,
        title: input.title,
        targetVoiceKey: input.targetVoiceKey || "custom-upload",
        pitchShift: input.pitchShift,
        status: "completed",
      });

      const r2Key = `singing-covers/orgs/${ctx.orgId}/${coverId}.wav`;
      await uploadAudio({
        key: r2Key,
        buffer: Buffer.from(res.data.audio_base64, "base64"),
        contentType: "audio/wav",
      });

      const signedUrl = await getSignedAudioUrl(r2Key);
      return { id: coverId, r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 7. Neural Audio Enhancement & Denoising (Resemble Enhance)
  // ---------------------------------------------------------------------------
  enhanceAudio: orgProcedure
    .input(
      z.object({
        base64Audio: z.string().optional(),
        audioKey: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Deduct 15 credits for studio polish & denoising
      try {
        await convexClient.mutation(api.credits.deduct, {
          orgId: ctx.orgId,
          amount: 15,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("INSUFFICIENT_CREDITS")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient credits for audio enhancement (requires 15 credits)",
          });
        }
      }

      const res = await cadenceStudioClient.POST("/enhance-audio", {
        body: {
          audio_base64: input.base64Audio,
          audio_key: input.audioKey,
        },
      });

      if (res.error || !res.data || !res.data.audio_base64) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to enhance audio via Resemble Enhance",
        });
      }

      const enhancedId = `enhanced_${Date.now()}`;
      const r2Key = `enhanced/orgs/${ctx.orgId}/${enhancedId}.wav`;
      await uploadAudio({
        key: r2Key,
        buffer: Buffer.from(res.data.audio_base64, "base64"),
        contentType: "audio/wav",
      });

      const signedUrl = await getSignedAudioUrl(r2Key);
      return { r2Key, url: signedUrl };
    }),

  // ---------------------------------------------------------------------------
  // 6. Viral Clipper Studio
  // ---------------------------------------------------------------------------
  clipMedia: orgProcedure
    .input(
      z.object({
        sourceType: z.enum(["youtube", "upload", "studio"]).default("youtube"),
        sourceUrl: z.string().optional(),
        r2SourceKey: z.string().optional(),
        numClips: z.number().min(1).max(10).default(5),
        aspectRatio: z.enum(["9:16", "1:1", "16:9"]).default("9:16"),
        enableReframe: z.boolean().default(true),
        reframeMode: z.enum(["speaker", "podcast_split", "blur_fill"]).default("speaker"),
        subtitleStyle: z.string().default("hormozi"),
        fontFamily: z.string().default("THEBOLDFONT"),
        fontSize: z.number().default(48),
        primaryColor: z.string().default("#FFFFFF"),
        highlightColor: z.string().default("#00FF66"),
        wordsPerLine: z.number().min(1).max(6).default(3),
        wordPop: z.boolean().default(true),
        showHookBanner: z.boolean().default(true),
        originalityBoost: z.boolean().default(true),
        preferredDurationCategory: z.enum(["<30", "30-60", "60-90"]).default("30-60"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Deduct 50 credits for viral clipper run
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
            message: "Insufficient credits for Viral Clipper (requires 50 credits)",
          });
        }
      }

      // 1. Create parent session in Convex
      const sessionId = await convexClient.mutation(api.studio.createClipperSession, {
        orgId: ctx.orgId,
        title: input.sourceUrl || "Uploaded Media",
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl,
        numClipsRequested: input.numClips,
        aspectRatio: input.aspectRatio,
        subtitleStyle: input.subtitleStyle,
        status: "processing",
      });

      try {
        // 2. Call Modal engine
        const res = await cadenceClipper.POST("/api/clip", {
          body: {
            source_type: input.sourceType,
            source_url: input.sourceUrl,
            r2_source_key: input.r2SourceKey,
            num_clips: input.numClips,
            aspect_ratio: input.aspectRatio,
            enable_reframe: input.enableReframe,
            reframe_mode: input.reframeMode,
            subtitle_style: input.subtitleStyle,
            font_family: input.fontFamily,
            font_size: input.fontSize,
            primary_color: input.primaryColor,
            highlight_color: input.highlightColor,
            words_per_line: input.wordsPerLine,
            word_pop: input.wordPop,
            show_hook_banner: input.showHookBanner,
            originality_boost: input.originalityBoost,
            preferred_duration_category: input.preferredDurationCategory,
          },
        });

        if (res.error || !res.data || !res.data.success) {
          await convexClient.mutation(api.studio.updateClipperSessionStatus, {
            sessionId,
            status: "failed",
            errorMessage: res.data?.error || "Modal Clipper engine failed",
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: res.data?.error || "Failed to process viral clips",
          });
        }

        const engineData = res.data;

        // 3. Update session title and thumbnail
        await convexClient.mutation(api.studio.updateClipperSessionStatus, {
          sessionId,
          status: "completed",
        });

        // 4. Save generated clips into Convex
        const createdClips = [];
        for (const clip of engineData.clips || []) {
          const clipRecordId = await convexClient.mutation(api.studio.createClip, {
            sessionId,
            orgId: ctx.orgId,
            title: clip.title,
            hookTitle: clip.hook_title,
            hookType: clip.hook_type,
            sourceType: input.sourceType,
            sourceUrl: input.sourceUrl,
            viralScore: clip.viral_score,
            hookScore: clip.hook_score,
            engagementScore: clip.engagement_score,
            valueScore: clip.value_score,
            shareabilityScore: clip.shareability_score,
            reasoning: clip.reasoning,
            startTime: clip.start_time,
            endTime: clip.end_time,
            duration: clip.duration,
            transcriptText: clip.transcript,
            aspectRatio: input.aspectRatio,
            subtitleStyle: input.subtitleStyle,
            r2ObjectKey: clip.r2_object_key,
            status: "completed",
          });

          const signedUrl = await getSignedAudioUrl(clip.r2_object_key);
          createdClips.push({
            id: clipRecordId,
            ...clip,
            videoUrl: signedUrl,
          });
        }

        return {
          sessionId,
          sourceTitle: engineData.source_title,
          clips: createdClips,
        };
      } catch (err: any) {
        await convexClient.mutation(api.studio.updateClipperSessionStatus, {
          sessionId,
          status: "failed",
          errorMessage: err.message || "Failed to clip video",
        });
        throw err;
      }
    }),

  getClipperSessions: orgProcedure.query(async ({ ctx }) => {
    const sessions = await convexClient.query(api.studio.listClipperSessions, {
      orgId: ctx.orgId,
    });

    // Sign video URLs for preview/download
    const sessionsWithUrls = await Promise.all(
      sessions.map(async (s) => {
        const clipsWithUrls = await Promise.all(
          (s.clips || []).map(async (c) => ({
            ...c,
            videoUrl: c.r2ObjectKey ? await getSignedAudioUrl(c.r2ObjectKey) : null,
          }))
        );
        return {
          ...s,
          clips: clipsWithUrls,
        };
      })
    );

    return sessionsWithUrls;
  }),

  deleteClipperSession: orgProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await convexClient.mutation(api.studio.deleteClipperSession, {
        sessionId: input.sessionId as Id<"clipperSessions">,
      });
      return { success: true };
    }),
});

