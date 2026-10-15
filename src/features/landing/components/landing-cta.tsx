"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Sparkles, ArrowRight, Zap, Shield, Waves } from "lucide-react";

const CURTAINS = [4, 12, 20, 28, 36, 44, 52, 60, 68, 76, 84, 92, 98];

// 56-bar flowing horizon soundwave with cinematic chromatic distribution
const BIG_HORIZON_BARS = [
  14, 22, 38, 20, 52, 32, 68, 48, 88, 58, 100, 72, 92, 60, 82, 45,
  65, 35, 52, 28, 74, 46, 92, 64, 100, 78, 96, 52, 70, 42, 58, 30,
  72, 48, 88, 62, 98, 70, 84, 40, 60, 32, 48, 22, 38, 18, 28, 14,
  24, 12, 18, 10, 16, 8, 14, 8
];

export function LandingCta() {
  const { isSignedIn, isLoaded } = useAuth();
  const studioHref = isLoaded && isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-[#ffffff] border-t border-[#e4e7ec] overflow-hidden">
      {/* Main Content Container */}
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        {/* Top Logo Glyph */}
        <div className="flex justify-center mb-2">
          <div className="size-16 sm:size-18 rounded-[14px] bg-[#ffffff] border border-[#e4e7ec] shadow-[rgba(28,40,64,0.06)_0px_8px_20px_0px] flex items-center justify-center p-3">
            <Image
              src="/logo.svg"
              alt="Cadence Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[7px] bg-[#ffffff] border border-[#e4e7ec] text-[12px] font-medium text-[#6f7988] shadow-[0_1px_2px_rgba(28,40,64,0.04)]">
          <span className="size-1.5 rounded-full bg-[#266df0]" />
          10,000 Free Credits Granted Upon Signup
        </div>

        {/* Big Bold Headline */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1c1d1f] tracking-tight leading-[1.12]">
            Start Creating With Cadence Today.
          </h2>

          <p className="text-[15px] sm:text-[17px] text-[#6f7988] leading-relaxed max-w-xl mx-auto font-normal">
            Zero-shot voice cloning, expressive neural speech, multi-track music, stem separation, and visual media in one studio.
            No recurring subscriptions, no vendor lock-in.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            href={studioHref}
            className="btn-dark-carbon px-6 py-3 text-[14px] font-medium rounded-[10px] flex items-center gap-2"
          >
            <span>{isLoaded && isSignedIn ? "Go to Studio" : "Launch Studio Free"}</span>
            <ArrowRight className="size-4" />
          </Link>

          {(!isLoaded || !isSignedIn) && (
            <Link
              href="/sign-in"
              className="btn-ghost-cadence px-5 py-3 text-[14px] font-medium rounded-[10px]"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Trust Badges Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[12px] text-[#6f7988] font-medium font-mono">
          {[
            "No credit card required",
            "10,000 free credits",
            "Cancel anytime",
            "Self-hosted serverless GPUs",
          ].map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#266df0] shrink-0" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

