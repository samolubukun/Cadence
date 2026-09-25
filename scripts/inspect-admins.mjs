import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://judicious-eel-519.convex.cloud"
);

async function check() {
  const admins = await client.query(api.admin.listAdmins);
  console.log("Current admin records in Convex:", JSON.stringify(admins, null, 2));
}

check().catch(console.error);
