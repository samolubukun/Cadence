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
  { label: "Workflow", href: "#how-it-works" },
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
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-3.5 px-3 sm:px-4">
      <nav
        className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-[12px] transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid #e4e7ec",
          boxShadow: scrolled
            ? "rgba(28, 40, 64, 0.08) 0px 4px 16px -2px, rgba(28, 40, 64, 0.04) 0px 2px 4px 0px"
            : "rgba(28, 40, 64, 0.04) 0px 2px 8px 0px",
          maxWidth: "1080px",
          width: "100%",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 mr-3 sm:mr-8 shrink-0 group">
          <Image 
            src="/logo.svg" 
            alt="Cadence" 
            width={32} 
            height={32} 
            className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:scale-105" 
          />
          <span 
            className="font-semibold tracking-tight text-[#1c1d1f] transition-colors"
            style={{ fontSize: "1.15rem", letterSpacing: "-0.03em" }}
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
              className="px-3 py-1.5 text-[13px] font-medium text-[#6f7988] rounded-[8px] transition-all duration-150 hover:text-[#1c1d1f] hover:bg-[#f4f5f6] whitespace-nowrap"
              style={{ textDecoration: "none" }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-2 ml-auto shrink-0">
          <a
            href="https://github.com/samolubukun/Cadence"
            target="_blank"
            rel="noopener noreferrer"
            title="Cadence on GitHub"
            className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-white hover:bg-[#f4f5f6] text-[#1c1d1f] border border-[#e4e7ec] shadow-xs transition-all shrink-0"
            aria-label="GitHub repository"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
          {isLoaded && isSignedIn ? (
            <Link
              href="/dashboard"
              className="btn-dark-carbon whitespace-nowrap flex-shrink-0"
            >
              <span>Go to Studio</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="btn-ghost-cadence whitespace-nowrap">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="btn-dark-carbon whitespace-nowrap flex-shrink-0"
              >
                <span>Launch Studio</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
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
          <div className="pt-2 mt-1 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="https://github.com/samolubukun/Cadence"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-black hover:bg-neutral-900 border border-black rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
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
        </div>
      )}
    </header>
  );
}
