"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, Copy, ExternalLink, Terminal, ShieldAlert, Sparkles, X } from "lucide-react";

interface ShowcaseContextType {
  isOpen: boolean;
  openShowcase: () => void;
  closeShowcase: () => void;
  isLiveAuthEnabled: boolean;
  interceptAction: (callback?: () => void) => void;
}

const ShowcaseContext = createContext<ShowcaseContextType | undefined>(undefined);

// Environment variable toggle: Defaults to false (Showcase mode enabled)
const IS_LIVE_AUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_LIVE_AUTH === "true";

const CLONE_CODE = `# 1. Clone repository
git clone https://github.com/samolubukun/Cadence.git
cd Cadence

# 2. Setup your local environment
cp .env.example .env.local

# 3. Install dependencies & launch
npm install
npm run dev`;

export function ShowcaseProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const openShowcase = useCallback(() => setIsOpen(true), []);
  const closeShowcase = useCallback(() => setIsOpen(false), []);

  const interceptAction = useCallback(
    (callback?: () => void) => {
      if (!IS_LIVE_AUTH_ENABLED) {
        setIsOpen(true);
      } else if (callback) {
        callback();
      }
    },
    []
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CLONE_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  return (
    <ShowcaseContext.Provider
      value={{
        isOpen,
        openShowcase,
        closeShowcase,
        isLiveAuthEnabled: IS_LIVE_AUTH_ENABLED,
        interceptAction,
      }}
    >
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="w-[92vw] max-w-[500px] max-h-[88vh] overflow-y-auto overflow-x-hidden no-scrollbar p-0 bg-[#ffffff] border border-[#e4e7ec] rounded-[16px] shadow-[rgba(28,40,64,0.12)_0px_16px_40px_0px] text-[#1c1d1f]"
          showCloseButton={false}
        >
          {/* Custom Header Bar with dedicated close button */}
          <div className="relative flex items-center justify-between px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-[#eeeff1] max-w-full">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
              <div className="size-9 sm:size-10 rounded-[10px] bg-[#f4f5f6] border border-[#e4e7ec] flex items-center justify-center p-1.5 sm:p-2 shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Cadence"
                  width={28}
                  height={28}
                  className="size-6 sm:size-7 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <DialogTitle className="text-[15px] sm:text-[16px] font-semibold tracking-tight text-[#1c1d1f] truncate">
                    Showcase &amp; Portfolio Demo
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#266df0] animate-pulse shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-medium text-[#6f7988] uppercase tracking-wider truncate">
                    Self-Hostable Open Source
                  </span>
                </div>
              </div>
            </div>

            {/* Dedicated close button with plenty of breathing space */}
            <button
              onClick={closeShowcase}
              className="size-8 rounded-[8px] bg-[#f6f8fa] hover:bg-[#eeeff1] border border-[#e4e7ec] flex items-center justify-center text-[#6f7988] hover:text-[#1c1d1f] transition-colors shrink-0 ml-1"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-full overflow-x-hidden">
            <DialogDescription className="text-[12px] sm:text-[13px] text-[#6f7988] leading-relaxed break-words">
              This deployment is an <strong className="text-[#1c1d1f] font-medium">interactive portfolio showcase</strong>. Live serverless NVIDIA A10G inference, Clerk OAuth, and the reactive Convex database are isolated to prevent unconfigured crashes and rate limits on this public preview.
            </DialogDescription>

            {/* Notice Callout */}
            <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-[10px] bg-[#f6f8fa] border border-[#e4e7ec] text-[11px] sm:text-[12px] text-[#232529] max-w-full">
              <ShieldAlert className="size-4 text-[#266df0] shrink-0 mt-0.5" />
              <div className="leading-relaxed break-words min-w-0">
                <span className="font-semibold text-[#1c1d1f]">Want full live generation?</span> You can self-host the entire suite locally or in your private cloud with full zero-shot cloning, music synthesis, and video clipping.
              </div>
            </div>

            {/* Self-Host Instructions */}
            <div className="space-y-2 max-w-full">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8f99a8] gap-2">
                <span className="flex items-center gap-1.5 font-medium text-[#2e3238] truncate">
                  <Terminal className="size-3.5 text-[#266df0] shrink-0" />
                  <span className="truncate">Self-Host With Your Own Environment</span>
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-[5px] bg-[#f4f5f6] hover:bg-[#e4e7ec] text-[#1c1d1f] transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-600" />
                      <span className="text-[11px] font-medium text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span className="text-[11px] font-medium">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dark Code Terminal with sleek-dark-scrollbar - ONLY part allowed to horizontally scroll */}
              <div className="relative rounded-[10px] bg-[#1a1b25] border border-[#272835] p-3 sm:p-3.5 font-mono text-[11px] sm:text-[12px] text-[#cad0d9] overflow-x-auto sleek-dark-scrollbar max-w-full">
                <pre className="leading-relaxed whitespace-pre font-mono">
                  {CLONE_CODE}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 max-w-full">
              <a
                href="https://github.com/samolubukun/Cadence"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-dark-carbon flex-1 py-2.5 px-4 text-[13px] font-medium rounded-[10px] flex items-center justify-center gap-2"
              >
                <span>View on GitHub</span>
                <ExternalLink className="size-3.5" />
              </a>

              <button
                type="button"
                onClick={closeShowcase}
                className="btn-ghost-cadence py-2.5 px-4 text-[13px] font-medium rounded-[10px] flex items-center justify-center"
              >
                Close Preview
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ShowcaseContext.Provider>
  );
}

export function useShowcase() {
  const context = useContext(ShowcaseContext);
  if (!context) {
    throw new Error("useShowcase must be used within a ShowcaseProvider");
  }
  return context;
}
