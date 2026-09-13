import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Songs
// ---------------------------------------------------------------------------
export const listSongs = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("songs")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const createSong = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
    prompt: v.string(),
    lyrics: v.optional(v.string()),
    duration: v.number(),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("songs", args);
  },
});

export const updateSongR2 = mutation({
  args: {
    id: v.id("songs"),
    r2ObjectKey: v.string(),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      r2ObjectKey: args.r2ObjectKey,
      status: args.status,
    });
  },
});

// ---------------------------------------------------------------------------
// Sound Effects
// ---------------------------------------------------------------------------
export const listSoundEffects = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soundEffects")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const createSoundEffect = mutation({
  args: {
    orgId: v.string(),
    prompt: v.string(),
    duration: v.number(),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("soundEffects", args);
  },
});

// ---------------------------------------------------------------------------
// Voice Conversions
// ---------------------------------------------------------------------------
export const listVoiceConversions = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("voiceConversions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const createVoiceConversion = mutation({
  args: {
    orgId: v.string(),
    sourceAudioKey: v.optional(v.string()),
    targetVoiceKey: v.string(),
    pitchShift: v.number(),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("voiceConversions", args);
  },
});

// ---------------------------------------------------------------------------
// Media Generations (Image & Video)
// ---------------------------------------------------------------------------
export const listMediaGenerations = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mediaGenerations")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const createMediaGeneration = mutation({
  args: {
    orgId: v.string(),
    type: v.union(v.literal("image"), v.literal("video")),
    prompt: v.string(),
    aspectRatio: v.optional(v.string()),
    duration: v.optional(v.number()),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mediaGenerations", args);
  },
});

// ---------------------------------------------------------------------------
// Stems Separation (Demucs v4)
// ---------------------------------------------------------------------------
export const listStems = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stems")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const createStem = mutation({
  args: {
    orgId: v.string(),
    sourceFileName: v.string(),
    vocalsKey: v.optional(v.string()),
    drumsKey: v.optional(v.string()),
    bassKey: v.optional(v.string()),
    otherKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stems", args);
  },
});

export const updateStemR2 = mutation({
  args: {
    id: v.id("stems"),
    vocalsKey: v.optional(v.string()),
    drumsKey: v.optional(v.string()),
    bassKey: v.optional(v.string()),
    otherKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

// ---------------------------------------------------------------------------
// AI Singing Covers (RVC v2)
// ---------------------------------------------------------------------------
export const listSingingCovers = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("singingCovers")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const createSingingCover = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
    targetVoiceKey: v.string(),
    pitchShift: v.number(),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("singingCovers", args);
  },
});

// ---------------------------------------------------------------------------
// Viral Clipper Studio (Sessions & Clips)
// ---------------------------------------------------------------------------
export const listClipperSessions = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("clipperSessions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();

    // Fetch clips for each session
    const sessionsWithClips = await Promise.all(
      sessions.map(async (session) => {
        const clips = await ctx.db
          .query("clips")
          .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
          .collect();
        return {
          ...session,
          clips,
        };
      })
    );

    return sessionsWithClips;
  },
});

export const getClipperSession = query({
  args: { sessionId: v.id("clipperSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    const clips = await ctx.db
      .query("clips")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return {
      ...session,
      clips,
    };
  },
});

export const createClipperSession = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
    sourceType: v.union(v.literal("youtube"), v.literal("upload"), v.literal("studio")),
    sourceUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
    numClipsRequested: v.number(),
    aspectRatio: v.union(v.literal("9:16"), v.literal("1:1"), v.literal("16:9")),
    subtitleStyle: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clipperSessions", args);
  },
});

export const updateClipperSessionStatus = mutation({
  args: {
    sessionId: v.id("clipperSessions"),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: args.status,
      ...(args.errorMessage !== undefined ? { errorMessage: args.errorMessage } : {}),
    });
  },
});

export const createClip = mutation({
  args: {
    sessionId: v.id("clipperSessions"),
    orgId: v.string(),
    title: v.string(),
    hookTitle: v.string(),
    hookType: v.optional(v.string()),
    sourceType: v.union(v.literal("youtube"), v.literal("upload"), v.literal("studio")),
    sourceUrl: v.optional(v.string()),
    viralScore: v.number(),
    hookScore: v.number(),
    engagementScore: v.number(),
    valueScore: v.number(),
    shareabilityScore: v.number(),
    reasoning: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    transcriptText: v.string(),
    aspectRatio: v.union(v.literal("9:16"), v.literal("1:1"), v.literal("16:9")),
    subtitleStyle: v.string(),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clips", args);
  },
});

export const deleteClipperSession = mutation({
  args: { sessionId: v.id("clipperSessions") },
  handler: async (ctx, args) => {
    const clips = await ctx.db
      .query("clips")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const clip of clips) {
      await ctx.db.delete(clip._id);
    }
    await ctx.db.delete(args.sessionId);
  },
});

