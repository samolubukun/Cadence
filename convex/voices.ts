import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    search: v.optional(v.string()),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const rawOrgId =
      args.orgId ||
      (identity
        ? ((identity as Record<string, unknown>).org_id as string | undefined) ||
          (typeof identity.orgId === "string" ? identity.orgId : undefined)
        : undefined);
    const orgId = typeof rawOrgId === "string" ? rawOrgId : undefined;

    // Fetch system voices
    const systemVoices = await ctx.db
      .query("voices")
      .withIndex("by_variant", (q) => q.eq("variant", "SYSTEM"))
      .collect();

    // Fetch custom voices for tenant
    const customVoices = orgId
      ? await ctx.db
          .query("voices")
          .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
          .collect()
      : [];

    const filterVoice = (voice: (typeof systemVoices)[number]) => {
      if (!args.search) return true;
      const term = args.search.toLowerCase();
      return (
        voice.name.toLowerCase().includes(term) ||
        (voice.description && voice.description.toLowerCase().includes(term))
      );
    };

    return {
      system: systemVoices.filter(filterVoice),
      custom: customVoices.filter(filterVoice),
    };
  },
});

export const getById = query({
  args: { id: v.id("voices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    language: v.string(),
    variant: v.union(v.literal("SYSTEM"), v.literal("CUSTOM")),
    r2ObjectKey: v.optional(v.string()),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const rawOrgId =
      args.orgId ||
      (identity
        ? ((identity as Record<string, unknown>).org_id as string | undefined) ||
          (typeof identity.orgId === "string" ? identity.orgId : undefined)
        : undefined);
    const orgId = typeof rawOrgId === "string" ? rawOrgId : undefined;

    return await ctx.db.insert("voices", {
      ...args,
      orgId,
    });
  },
});

export const updateR2Key = mutation({
  args: {
    id: v.id("voices"),
    r2ObjectKey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { r2ObjectKey: args.r2ObjectKey });
  },
});

export const deleteVoice = mutation({
  args: { id: v.id("voices") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const rawOrgId = identity
      ? ((identity as Record<string, unknown>).org_id as string | undefined) ||
        (typeof identity.orgId === "string" ? identity.orgId : undefined)
      : undefined;
    const orgId = typeof rawOrgId === "string" ? rawOrgId : undefined;

    const voice = await ctx.db.get(args.id);
    if (!voice) throw new Error("Voice not found");
    if (voice.variant === "CUSTOM" && voice.orgId !== orgId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
    return { success: true, r2ObjectKey: voice.r2ObjectKey };
  },
});
