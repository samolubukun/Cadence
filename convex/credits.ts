import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_FREE_CREDITS = 10000;

export const getBalance = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("credits")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .first();

    return record ? record.balance : DEFAULT_FREE_CREDITS;
  },
});

export const deduct = mutation({
  args: {
    orgId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("credits")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .first();

    const currentBalance = record ? record.balance : DEFAULT_FREE_CREDITS;

    if (currentBalance < args.amount) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    const newBalance = currentBalance - args.amount;

    if (record) {
      await ctx.db.patch(record._id, { balance: newBalance });
    } else {
      await ctx.db.insert("credits", {
        orgId: args.orgId,
        balance: newBalance,
      });
    }

    return newBalance;
  },
});

export const addCredits = mutation({
  args: {
    orgId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("credits")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .first();

    if (record) {
      const newBalance = record.balance + args.amount;
      await ctx.db.patch(record._id, { balance: newBalance });
      return newBalance;
    } else {
      const newBalance = DEFAULT_FREE_CREDITS + args.amount;
      await ctx.db.insert("credits", {
        orgId: args.orgId,
        balance: newBalance,
      });
      return newBalance;
    }
  },
});
