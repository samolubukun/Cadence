"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Models", href: "#models" },
  { label: "Voices", href: "#voices" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Architecture", href: "#architecture" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-3 sm:pt-4 px-3 sm:px-4">
      <nav
        className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-full transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: scrolled
            ? "0 10px 30px -10px rgba(15,23,42,0.12), 0 0 0 1px rgba(255,255,255,0.8) inset"
            : "0 4px 16px -4px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset",
          maxWidth: "980px",
          width: "100%",
        }}
      >
        <Link href="/" className="flex items-center gap-3 mr-2 sm:mr-6 shrink-0 group">
          <Image 
            src="/logo.svg" 
            alt="Cadence" 
            width={40} 
            height={40} 
            className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-105" 
          />
          <span 
            className="font-extrabold tracking-tight text-slate-900 transition-colors"
            style={{ fontSize: "1.35rem", letterSpacing: "-0.035em" }}
          >
            Cadence
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 rounded-full transition-all duration-150 hover:text-indigo-600 hover:bg-indigo-50/70"
              style={{ textDecoration: "none" }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop Action Buttons (Hidden on mobile, moved inside hamburger drawer) */}
        <div className="hidden md:flex items-center gap-2 ml-auto shrink-0">
          {isLoaded && isSignedIn ? (
            <Link
              href="/dashboard"
              className="btn-dark-carbon whitespace-nowrap flex-shrink-0 text-sm px-4 py-2"
            >
              <span>Go to Studio</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="btn-ghost-cadence whitespace-nowrap text-sm py-1.5 px-3.5">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="btn-dark-carbon whitespace-nowrap flex-shrink-0 text-sm px-4 py-2"
              >
                <span>Launch Studio</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="md:hidden ml-auto">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden w-full max-w-[960px] mt-2 p-4 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-xl flex flex-col gap-2 animate-fade-up"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              {label}
            </a>
          ))}
          <div className="pt-2 mt-1 border-t border-slate-100 flex flex-col sm:flex-row items-stretch gap-2">
            {!isSignedIn && (
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link
              href={isLoaded && isSignedIn ? "/dashboard" : "/sign-up"}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-center text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{isLoaded && isSignedIn ? "Go to Studio" : "Launch Studio Free"}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
