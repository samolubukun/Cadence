import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cadence",
    template: "%s | Cadence"
  },
  description: "AI-powered text-to-speech, speech-to-text, and voice cloning platform",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

import { ConvexClientProvider } from "@/components/providers/convex-client-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <TRPCReactProvider>
          <html lang="en">
            <body
              className={`${inter.variable} ${geistMono.variable} antialiased`}
            >
              <NuqsAdapter>
                {children}
              </NuqsAdapter>
              <Toaster />
            </body>
          </html>
        </TRPCReactProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
