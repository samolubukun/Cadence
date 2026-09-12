import type { Metadata } from "next";
import { UsageView } from "@/features/usage/views/usage-view";

export const metadata: Metadata = {
  title: "Usage & Analytics",
  description: "Monitor credit consumption, model usage, and transaction audit ledger.",
};

export default function UsagePage() {
  return <UsageView />;
}
