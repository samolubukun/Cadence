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
