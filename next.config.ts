import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  experimental: {
    proxyClientMaxBodySize: "20mb",
  },
};

// Only enable Sentry build plugin if auth token or DSN is provided
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG || "cadence",
      project: process.env.SENTRY_PROJECT || "cadence-app",
      silent: true,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      webpack: {
        automaticVercelMonitors: false,
        treeshake: {
          removeDebugLogging: true,
        },
      },
    })
  : nextConfig;
