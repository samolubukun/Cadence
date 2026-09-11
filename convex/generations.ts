import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generations")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id("generations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    orgId: v.string(),
    voiceId: v.optional(v.id("voices")),
    voiceName: v.string(),
    text: v.string(),
    r2ObjectKey: v.optional(v.string()),
    modelEngine: v.optional(v.string()),
    sampleRate: v.optional(v.number()),
    temperature: v.number(),
    topP: v.number(),
    topK: v.number(),
    repetitionPenalty: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generations", {
      ...args,
      modelEngine: args.modelEngine ?? "cadence-turbo-v1",
      sampleRate: args.sampleRate ?? 24000,
    });
  },
});

export const updateR2Key = mutation({
  args: {
    id: v.id("generations"),
    r2ObjectKey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { r2ObjectKey: args.r2ObjectKey });
  },
});

export const remove = mutation({
  args: {
    id: v.id("generations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
