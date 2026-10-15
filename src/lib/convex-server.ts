import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder-build.convex.cloud";

export const convexClient = new ConvexHttpClient(convexUrl);

export { api };
export type { Id };
