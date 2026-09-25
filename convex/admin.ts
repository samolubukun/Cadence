import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const checkIsAdmin = query({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId && !args.email) return false;

    const allAdmins = await ctx.db
      .query("adminUsers")
      .withIndex("by_isAdmin", (q) => q.eq("isAdmin", true))
      .collect();

    const targetUser = (args.userId || "").toLowerCase().trim();
    const targetEmail = (args.email || "").toLowerCase().trim();

    return allAdmins.some((rec) => {
      const uId = (rec.userId || "").toLowerCase().trim();
      const mail = (rec.email || "").toLowerCase().trim();

      if (targetUser && (uId === targetUser || targetUser.includes(uId) || uId.includes(targetUser))) {
        return true;
      }
      if (targetEmail && (mail === targetEmail || targetEmail.includes(mail) || mail.includes(targetEmail))) {
        return true;
      }
      if (targetUser && (mail === targetUser || targetUser.includes(mail) || mail.includes(targetUser))) {
        return true;
      }
      if (targetEmail && (uId === targetEmail || targetEmail.includes(uId) || uId.includes(targetEmail))) {
        return true;
      }
      return false;
    });
  },
});

export const setAdmin = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isAdmin: args.isAdmin,
        email: args.email ?? existing.email,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("adminUsers", {
        userId: args.userId,
        email: args.email,
        isAdmin: args.isAdmin,
      });
    }
  },
});export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("adminUsers").collect();
  },
});
