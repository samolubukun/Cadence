import type { Metadata } from "next";
import { ObservabilityView } from "@/features/observability/views/observability-view";

export const metadata: Metadata = {
  title: "AI & Model Observability",
  description: "Monitor real-time traces, model latency, token costs, and generation telemetry via Langfuse.",
};

export default function ObservabilityPage() {
  return <ObservabilityView />;
}
