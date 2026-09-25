import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://judicious-eel-519.convex.cloud"
);

async function main() {
  console.log("Adding admin records for samuelolubukun / smauelolubukun...");
  
  const entries = [
    { userId: "samuelolubukun", email: "samuelolubukun@gmail.com", isAdmin: true },
    { userId: "smauelolubukun", email: "smauelolubukun@gmail.com", isAdmin: true },
    { userId: "user_samuelolubukun", email: "samuelolubukun", isAdmin: true },
  ];

  for (const entry of entries) {
    try {
      const res = await client.mutation(api.admin.setAdmin, entry);
      console.log(`Successfully added/updated admin ${entry.userId}:`, res);
    } catch (err) {
      console.error(`Failed to set admin for ${entry.userId}:`, err);
    }
  }

  console.log("Done seeding admin users!");
}

main().catch(console.error);
