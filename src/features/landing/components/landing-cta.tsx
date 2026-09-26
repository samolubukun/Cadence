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
    <section className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#FAF9F6] border-t border-slate-200/80 overflow-hidden">
      {/* Background Animated Light Shimmers */}
      <div className="absolute inset-0 pointer-events-none">
        {CURTAINS.map((pct, i) => (
          <div
            key={i}
            className="absolute -top-[40%] bottom-0 w-px"
            style={{
              left: `${pct}%`,
              background: `linear-gradient(to bottom, rgba(99,102,241,${(0.04 + (i % 4) * 0.02).toFixed(2)}) 0%, rgba(99,102,241,0.005) 60%, transparent 100%)`,
              animation: `curtain-shimmer ${4.2 + (i % 4) * 0.6}s ease-in-out infinite`,
              animationDelay: `${(i * 0.26).toFixed(2)}s`,
            }}
          />
        ))}

        {/* Faint Subtle Chromatic Ambient Bloom Aura */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 75% 55% at 50% 50%, rgba(99,102,241,0.045) 0%, rgba(236,72,153,0.02) 35%, rgba(14,165,233,0.015) 65%, transparent 100%)"
          }}
        />
      </div>

      {/* Faint Subdued Audio Waveform Horizon Running Across the Center */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-[3px] sm:gap-[4px] opacity-15 sm:opacity-20 overflow-hidden h-44 sm:h-56 px-4"
        style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}
      >
        {BIG_HORIZON_BARS.map((height, i) => {
          const t = i / BIG_HORIZON_BARS.length;
          const barColor =
            t < 0.25
              ? "linear-gradient(to top, #0284C7, #38BDF8)"
              : t < 0.5
              ? "linear-gradient(to top, #4F46E5, #818CF8)"
              : t < 0.75
              ? "linear-gradient(to top, #9333EA, #C084FC)"
              : "linear-gradient(to top, #E11D48, #FB7185)";

          return (
            <div
              key={i}
              className="relative z-10 w-[2.5px] sm:w-[3.5px] rounded-full transition-all duration-300"
              style={{
                height: `${height}%`,
                background: barColor,
                boxShadow: "0 0 4px rgba(99,102,241,0.12)",
                animation: `wave-dance 2.2s ease-in-out infinite`,
                animationDelay: `${(i * 0.05).toFixed(2)}s`,
              }}
            />
          );
        })}
      </div>

      {/* Main Content Container with Glass Backdrop */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-9">
        {/* Top Logo Badge Emblem */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 rounded-3xl blur-2xl opacity-75" />
            <div className="relative size-24 sm:size-28 rounded-3xl bg-white border border-slate-200/90 flex items-center justify-center shadow-xl shadow-indigo-500/10 p-2.5 sm:p-3 transition-transform duration-300 hover:scale-105">
              <Image
                src="/logo.svg"
                alt="Cadence Logo"
                width={92}
                height={92}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Luminous Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-indigo-200/80 shadow-md text-xs font-semibold uppercase tracking-wider text-indigo-950">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          10,000 Free Credits Granted Upon Signup
        </div>

        {/* Big Bold Headline */}
        <div className="space-y-5 max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold text-slate-900 tracking-tight leading-[1.08]">
            Start Creating With Cadence Today.
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Zero-shot voice cloning, expressive neural speech, multi-track music, stem separation, and visual media in one studio.
            No recurring subscriptions, no vendor lock-in. Just pure creative freedom.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href={studioHref}
            className="btn-dark-carbon shadow-xl hover:shadow-2xl transition-all px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-bold rounded-2xl flex items-center gap-2.5"
          >
            <span>{isLoaded && isSignedIn ? "Go to Studio" : "Launch Studio Free"}</span>
            <ArrowRight className="size-4.5" />
          </Link>

          {(!isLoaded || !isSignedIn) && (
            <Link
              href="/sign-in"
              className="btn-ghost-cadence px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white border border-slate-200 shadow-sm"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Trust Badges Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs sm:text-sm text-slate-600 font-medium">
          {[
            "No credit card required",
            "10,000 free credits",
            "Cancel anytime",
            "Self-hosted serverless GPUs",
          ].map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

