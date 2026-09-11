import { convexClient, api } from "@/lib/convex-server";
import { createTRPCRouter, orgProcedure } from "../init";

export const billingRouter = createTRPCRouter({
  getStatus: orgProcedure.query(async ({ ctx }) => {
    const balance = await convexClient.query(api.credits.getBalance, {
      orgId: ctx.orgId,
    });

    return {
      hasActiveSubscription: true,
      balance,
    };
  }),
});