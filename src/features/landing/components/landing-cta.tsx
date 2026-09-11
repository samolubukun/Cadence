"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const CURTAINS = [5,12,19,26,33,40,47,54,61,68,75,82,89,96];

export function LandingCta() {
  const { isSignedIn, isLoaded } = useAuth();
  const studioHref = isLoaded && isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <section style={{ padding:"7rem 1.5rem", background:"#FAF9F6", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {CURTAINS.map((pct, i) => (
          <div key={i} style={{
            position:"absolute", top:"-30%", bottom:0, left:`${pct}%`, width:1,
            background:`linear-gradient(to bottom, rgba(99,102,241,${(0.1 + (i%3)*0.05).toFixed(2)}) 0%, rgba(99,102,241,0.02) 65%, transparent 100%)`,
            animation:`curtain-shimmer ${3.8 + (i%4)*0.5}s ease-in-out infinite`,
            animationDelay:`${(i*0.29).toFixed(2)}s`,
          }} />
        ))}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.03) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:"740px", margin:"0 auto", textAlign:"center" }}>
        <div style={{ marginBottom:"2rem", display:"flex", justifyContent:"center" }}>
          <div style={{ width:64, height:64, borderRadius:20, background:"#0F172A", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 10px 30px -8px rgba(15,23,42,0.25)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" width="38" height="38">
              <path d="M390 112C348 78 299 60 247 60C143 60 60 144 60 247C60 350 143 434 247 434C299 434 348 416 390 382L341 319C314 340 282 351 247 351C189 351 142 305 142 247C142 189 189 143 247 143C282 143 314 154 341 175Z" fill="white" fillOpacity="0.95"/>
              <rect x="222" y="191" width="22" height="112" rx="11" fill="white" fillOpacity="0.75"/>
              <rect x="258" y="168" width="22" height="158" rx="11" fill="white" fillOpacity="0.95"/>
              <rect x="294" y="190" width="22" height="114" rx="11" fill="white" fillOpacity="0.75"/>
              <rect x="330" y="214" width="22" height="66" rx="11" fill="white" fillOpacity="0.6"/>
            </svg>
          </div>
        </div>

        <div className="section-label" style={{ marginBottom:"1.5rem", display:"inline-flex" }}>
          10,000 Free Credits Granted Upon Signup
        </div>

        <h2 style={{ fontSize:"clamp(2.2rem,4.5vw,3.5rem)", fontWeight:800, color:"#0F172A", letterSpacing:"-0.04em", lineHeight:1.07, marginBottom:"1.25rem" }}>
          Start Creating With Cadence Today.
        </h2>

        <p style={{ fontSize:"1.1rem", color:"#475569", lineHeight:1.75, maxWidth:"520px", margin:"0 auto 2.5rem" }}>
          Fully self-hosted voice AI - text-to-speech, voice cloning, and transcription in one studio.
          No subscriptions. No vendor APIs. Just your voice, your data.
        </p>

        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"0.85rem" }}>
          <Link href={studioHref} className="btn-dark-carbon whitespace-nowrap flex-shrink-0" style={{ fontSize:"0.95rem", padding:"0.8rem 1.8rem" }}>
            <span className="whitespace-nowrap">{isLoaded && isSignedIn ? "Go to Studio" : "Launch Studio Free"}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          {(!isLoaded || !isSignedIn) && (
            <Link href="/sign-in" className="btn-ghost-cadence whitespace-nowrap flex-shrink-0" style={{ fontSize:"0.95rem", padding:"0.75rem 1.5rem" }}>
              <span className="whitespace-nowrap">Sign In</span>
            </Link>
          )}
        </div>

        <div style={{ marginTop:"3rem", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"1.25rem" }}>
          {["No credit card required","10,000 free credits","Cancel anytime","Self-hosted infrastructure"].map(item => (
            <span key={item} style={{ display:"inline-flex", alignItems:"center", gap:"0.35rem", fontSize:"0.83rem", color:"#64748B", fontWeight:500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
