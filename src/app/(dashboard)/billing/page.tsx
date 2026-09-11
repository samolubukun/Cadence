import type { Metadata } from "next";
import { BillingView } from "@/features/billing/views/billing-view";

export const metadata: Metadata = {
  title: "Billing & Credits",
  description: "Manage your credits and plan settings",
};

export default function BillingPage() {
  return <BillingView />;
}
