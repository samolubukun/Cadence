import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transcriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id("transcriptions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    orgId: v.string(),
    audioKey: v.string(),
    fileName: v.string(),
    language: v.optional(v.string()),
    text: v.string(),
    modelEngine: v.optional(v.string()),
    duration: v.optional(v.number()),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    segments: v.array(
      v.object({
        start: v.number(),
        end: v.number(),
        text: v.string(),
        speaker: v.optional(v.string()),
        words: v.optional(
          v.array(
            v.object({
              word: v.string(),
              start: v.optional(v.number()),
              end: v.optional(v.number()),
              score: v.optional(v.number()),
              speaker: v.optional(v.string()),
            })
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transcriptions", {
      ...args,
      modelEngine: args.modelEngine ?? "whisper-large-v3",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("transcriptions"),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    text: v.optional(v.string()),
    duration: v.optional(v.number()),
    segments: v.optional(
      v.array(
        v.object({
          start: v.number(),
          end: v.number(),
          text: v.string(),
          speaker: v.optional(v.string()),
          words: v.optional(
            v.array(
              v.object({
                word: v.string(),
                start: v.optional(v.number()),
                end: v.optional(v.number()),
                score: v.optional(v.number()),
                speaker: v.optional(v.string()),
              })
            )
          ),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const cleanUpdates: {
      status: "processing" | "completed" | "failed";
      text?: string;
      duration?: number;
      segments?: typeof args.segments;
    } = { status: updates.status };
    if (updates.text !== undefined) cleanUpdates.text = updates.text;
    if (updates.duration !== undefined) cleanUpdates.duration = updates.duration;
    if (updates.segments !== undefined) cleanUpdates.segments = updates.segments;
    await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: {
    id: v.id("transcriptions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
