"use client";

import { useState } from "react";

const VOICES = [
  { name:"Sienna", accent:"American", gender:"F", tag:"Narrative", bars:[0.4,0.75,1,0.6,0.85,0.5,0.7,0.45,0.8,0.95,0.55,0.7] },
  { name:"Julian", accent:"British",  gender:"M", tag:"Broadcast", bars:[0.55,0.8,0.65,1,0.5,0.75,0.9,0.6,0.4,0.7,0.85,0.5] },
  { name:"Claire", accent:"American", gender:"F", tag:"Warm",      bars:[0.6,0.45,0.8,0.55,0.9,0.7,0.5,0.85,0.65,0.4,0.75,0.9] },
  { name:"Marcus", accent:"British",  gender:"M", tag:"Cinematic", bars:[0.7,0.5,0.9,0.65,0.45,0.8,0.6,0.95,0.55,0.75,0.4,0.85] },
  { name:"Elara",  accent:"Irish",    gender:"F", tag:"Editorial", bars:[0.45,0.85,0.6,0.75,1,0.5,0.65,0.8,0.45,0.7,0.9,0.55] },
  { name:"Silas",  accent:"Scottish", gender:"M", tag:"Storytell", bars:[0.5,0.7,0.45,0.85,0.6,0.9,0.55,0.75,0.4,0.8,0.65,0.95] },
];

export function LandingVoices() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="voices" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#F4F6FB] overflow-hidden">
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <span className="section-label" style={{ marginBottom:"1rem", display:"inline-flex" }}>Voice Library</span>
          <h2 style={{ fontSize:"clamp(1.9rem,3.5vw,2.8rem)", fontWeight:800, color:"#0F172A", letterSpacing:"-0.04em", lineHeight:1.1, marginTop:"0.75rem", marginBottom:"1rem" }}>
            30 hand-curated voices, ready out of the box
          </h2>
          <p style={{ fontSize:"1.05rem", color:"#64748B", lineHeight:1.7, maxWidth:"540px", margin:"0 auto" }}>
            Every voice is sourced from the VCTK corpus, labelled with accent and gender metadata,
            and stored as a WAV reference for zero-shot cloning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mb-8">
          {VOICES.map((v, i) => (
            <button
              key={v.name}
              onClick={() => setActive(active === i ? null : i)}
              style={{
                textAlign:"left", padding:"1.25rem",
                background:active === i ? "rgba(241,245,249,0.9)" : "rgba(255,255,255,0.9)",
                backdropFilter:"blur(12px)",
                border:`1px solid ${active === i ? "rgba(15,23,42,0.2)" : "rgba(0,0,0,0.07)"}`,
                borderRadius:"16px", cursor:"pointer",
                transition:"all 0.2s ease",
                boxShadow:active === i ? "0 4px 16px -4px rgba(15,23,42,0.08)" : "0 2px 8px -2px rgba(15,23,42,0.03)",
              }}
            >
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.65rem" }}>
                  <div style={{
                    width:36, height:36, borderRadius:"9999px",
                    background: "#0F172A",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:"white", fontWeight:700, fontSize:"0.85rem",
                  }}>
                    {v.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:"#0F172A", fontSize:"0.9rem", letterSpacing:"-0.02em" }}>{v.name}</div>
                    <div style={{ fontSize:"0.72rem", color:"#94A3B8" }}>{v.accent} - {v.gender === "F" ? "Female" : "Male"}</div>
                  </div>
                </div>
                <span style={{ padding:"0.2rem 0.6rem", background:"#F1F5F9", border:"1px solid #E2E8F0", borderRadius:"9999px", fontSize:"0.68rem", fontWeight:600, color:"#475569" }}>
                  {v.tag}
                </span>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:32 }}>
                {v.bars.map((h, bi) => (
                  <div key={bi} style={{
                    flex:1, borderRadius:3,
                    background:active === i ? `rgba(99,102,241,${(h*0.7+0.1).toFixed(2)})` : `rgba(99,102,241,${(h*0.3+0.05).toFixed(2)})`,
                    height:`${Math.round(h*28)}px`, transition:"background 0.3s ease",
                  }} />
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 sm:p-5 sm:px-7 bg-white/90 backdrop-blur-xl border border-black/5 rounded-2xl shadow-sm text-center sm:text-left max-w-full">
            <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Showing 6 of <strong className="text-slate-900 font-bold">30 voices</strong> - American, British, Irish, Scottish, Australian
            </span>
            <a href="/sign-up" className="btn-dark-carbon whitespace-nowrap flex-shrink-0 text-xs px-4 py-2 mt-1 sm:mt-0">
              <span>Explore all voices</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
