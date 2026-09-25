import { z } from "zod";
import { convexClient, api } from "@/lib/convex-server";
import { createTRPCRouter, authProcedure, baseProcedure } from "../init";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  // Check if current user is admin
  getIsAdmin: authProcedure
    .input(
      z
        .object({
          email: z.string().optional(),
          username: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        let email = input?.email;
        if (!email) {
          try {
            const { currentUser } = await import("@clerk/nextjs/server");
            const clerkUser = await currentUser();
            email = clerkUser?.emailAddresses?.[0]?.emailAddress;
          } catch (err) {
            // Continue even if currentUser is unavailable
          }
        }

        const isAdmin = await convexClient.query(api.admin.checkIsAdmin, {
          userId: ctx.userId,
          email,
        });

        return {
          isAdmin: !!isAdmin,
          userId: ctx.userId,
        };
    } catch (error) {
      console.error("Error checking admin status:", error);
      return {
        isAdmin: false,
        userId: ctx.userId,
      };
    }
  }),

  // Seed or toggle admin status for the current user
  setSelfAdmin: authProcedure
    .input(z.object({ isAdmin: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await convexClient.mutation(api.admin.setAdmin, {
          userId: ctx.userId,
          isAdmin: input.isAdmin,
        });

        return { success: true, isAdmin: input.isAdmin };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update admin status",
        });
      }
    }),

  // Get real-time KPIs from Native Convex Trace Engine
  getKpis: authProcedure
    .input(z.object({ timeWindow: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const isAdmin = await convexClient.query(api.admin.checkIsAdmin, {
        userId: ctx.userId,
      });
      if (!isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      return await convexClient.query(api.traces.getKpis, {
        timeWindow: input.timeWindow,
      });
    }),

  // Get filtered traces for waterfall inspection
  listTraces: authProcedure
    .input(
      z.object({
        timeWindow: z.string().optional(),
        model: z.string().optional(),
        status: z.string().optional(),
        studio: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const isAdmin = await convexClient.query(api.admin.checkIsAdmin, {
        userId: ctx.userId,
      });
      if (!isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      return await convexClient.query(api.traces.listTraces, input);
    }),

  // Prune traces past retention threshold
  pruneTraces: authProcedure
    .input(z.object({ retentionDays: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await convexClient.query(api.admin.checkIsAdmin, {
        userId: ctx.userId,
      });
      if (!isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      return await convexClient.mutation(api.traces.pruneOldTraces, {
        retentionDays: input.retentionDays ?? 7,
      });
    }),
});
