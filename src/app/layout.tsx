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
    default: "Cadence - Open Platform for Voice, Music & Media",
    template: "%s | Cadence"
  },
  description: "The open platform for every layer of voice, music, and media creation.",
  icons: {
    icon: "/cadence-logo-white.svg",
    shortcut: "/cadence-logo-white.svg",
    apple: "/cadence-logo-white.svg",
  },
};

import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { ShowcaseProvider } from "@/components/providers/showcase-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPubKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexClientProvider>
        <TRPCReactProvider>
          <html lang="en">
            <body
              className={`${inter.variable} ${geistMono.variable} antialiased`}
            >
              <NuqsAdapter>
                <ShowcaseProvider>
                  {children}
                </ShowcaseProvider>
              </NuqsAdapter>
              <Toaster />
            </body>
          </html>
        </TRPCReactProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
