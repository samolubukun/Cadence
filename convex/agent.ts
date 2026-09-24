import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSession = mutation({
  args: {
    orgId: v.string(),
    persona: v.string(),
    voiceId: v.optional(v.id("voices")),
    voiceName: v.string(),
    voiceMode: v.union(v.literal("speed"), v.literal("cloned")),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("agentSessions", {
      orgId: args.orgId,
      persona: args.persona,
      voiceId: args.voiceId,
      voiceName: args.voiceName,
      voiceMode: args.voiceMode,
      title: args.title || `Voice Agent • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      durationSeconds: 0,
      messages: [],
      status: "active",
    });
    return sessionId;
  },
});

export const appendTurn = mutation({
  args: {
    sessionId: v.id("agentSessions"),
    message: v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      text: v.string(),
      latencyMs: v.optional(v.number()),
      timestamp: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return;

    await ctx.db.patch(args.sessionId, {
      messages: [...session.messages, args.message],
    });
  },
});

export const endSession = mutation({
  args: {
    sessionId: v.id("agentSessions"),
    durationSeconds: v.number(),
    status: v.optional(v.union(v.literal("completed"), v.literal("interrupted"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      durationSeconds: args.durationSeconds,
      status: args.status || "completed",
    });
  },
});

export const listSessions = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentSessions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .take(20);
  },
});

export const getSession = query({
  args: {
    sessionId: v.id("agentSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});
