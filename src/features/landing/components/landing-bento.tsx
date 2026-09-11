"use client";

import { useState } from "react";

function TtsCard() {
  const [exaggeration, setExaggeration] = useState(0.8);
  const [pacing, setPacing] = useState(1.0);
  const bars = [0.35,0.6,0.85,1,0.7,0.5,0.9,0.65,0.45,0.75,0.95,0.55,0.8,0.4,0.7,0.6,0.85,0.5,0.9,0.65];

  return (
    <div className="bento-card p-4 sm:p-6 flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-4">
        <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#4338CA,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center" }} className="shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontWeight:700,fontSize:"0.95rem",color:"#0F172A",letterSpacing:"-0.02em" }} className="truncate">Neural TTS Studio</div>
          <div style={{ fontSize:"0.72rem",color:"#64748B" }} className="truncate">Chatterbox by Resemble AI</div>
        </div>
        <span className="section-label shrink-0" style={{ fontSize:"0.68rem" }}>Studio</span>
      </div>

      <div style={{ padding:"0.85rem",background:"rgba(248,250,252,0.95)",border:"1px solid rgba(0,0,0,0.06)",borderRadius:"12px",marginBottom:"1rem" }}>
        <div style={{ fontSize:"0.78rem",color:"#334155",lineHeight:1.65 }}>
          Introducing BrightBean Coffee - the smoothest roast you&apos;ll ever taste. Crafted from single-origin Ethiopian highlands.
        </div>
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:2,height:40,marginBottom:"1rem",overflow:"hidden" }}>
        {bars.map((h,i) => (
          <div key={i} style={{ flex:1,borderRadius:4,background:`rgba(99,102,241,${(h*0.6+0.1).toFixed(2)})`,height:`${Math.round(h*36)}px` }} />
        ))}
      </div>

      <div style={{ display:"flex",flexDirection:"column",gap:"0.65rem",marginTop:"auto" }}>
        {[
          { label:"Exaggeration", value:exaggeration, set:setExaggeration, min:0, max:2, step:0.05, color:"#6366F1" },
          { label:"Pacing", value:pacing, set:setPacing, min:0.5, max:2, step:0.05, color:"#8B5CF6" },
        ].map(({ label, value, set, min, max, step, color }) => (
          <div key={label} className="w-full">
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"0.25rem" }}>
              <span style={{ fontSize:"0.75rem",fontWeight:600,color:"#475569" }}>{label}</span>
              <span style={{ fontSize:"0.75rem",fontWeight:700,color:"#0F172A" }}>{value.toFixed(2)}x</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(parseFloat(e.target.value))}
              style={{ width:"100%",accentColor:color,height:4,cursor:"pointer",display:"block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CloningCard() {
  const inputBars  = [0.5,0.7,0.9,0.6,0.8,0.4,0.75,0.95,0.55,0.7];
  const outputBars = [0.5,0.68,0.91,0.59,0.82,0.41,0.74,0.93,0.56,0.71];

  return (
    <div className="bento-card p-4 sm:p-6 flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-4">
        <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#A855F7)",display:"flex",alignItems:"center",justifyContent:"center" }} className="shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontWeight:700,fontSize:"0.95rem",color:"#0F172A",letterSpacing:"-0.02em" }} className="truncate">Zero-Shot Cloning</div>
          <div style={{ fontSize:"0.72rem",color:"#64748B" }} className="truncate">5s reference - No fine-tuning</div>
        </div>
        <span className="section-label shrink-0" style={{ fontSize:"0.68rem",background:"rgba(124,58,237,0.08)",borderColor:"rgba(124,58,237,0.2)",color:"#7C3AED" }}>Clone</span>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"0.5rem",alignItems:"center",marginBottom:"1rem" }}>
        <div style={{ background:"rgba(248,250,252,0.9)",border:"1px solid rgba(0,0,0,0.06)",borderRadius:12,padding:"0.65rem 0.5rem" }} className="overflow-hidden">
          <div style={{ fontSize:"0.65rem",fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.4rem" }}>Input clip</div>
          <div style={{ display:"flex",alignItems:"flex-end",gap:2,height:36 }}>
            {inputBars.map((h,i) => (
              <div key={i} style={{ flex:1,borderRadius:3,background:`rgba(99,102,241,${(h*0.5+0.1).toFixed(2)})`,height:`${Math.round(h*32)}px` }} />
            ))}
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2 }} className="shrink-0 px-1">
          <div style={{ width:26,height:26,borderRadius:"9999px",background:"linear-gradient(135deg,#6366F1,#A855F7)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <span style={{ fontSize:"0.55rem",color:"#94A3B8",fontWeight:600 }}>CLONE</span>
        </div>
        <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.05),rgba(168,85,247,0.05))",border:"1px solid rgba(99,102,241,0.12)",borderRadius:12,padding:"0.65rem 0.5rem" }} className="overflow-hidden">
          <div style={{ fontSize:"0.65rem",fontWeight:600,color:"#6366F1",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.4rem" }}>Studio Clone</div>
          <div style={{ display:"flex",alignItems:"flex-end",gap:2,height:36 }}>
            {outputBars.map((h,i) => (
              <div key={i} style={{ flex:1,borderRadius:3,background:`rgba(99,102,241,${(h*0.7+0.15).toFixed(2)})`,height:`${Math.round(h*32)}px` }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"0.65rem",background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:10,marginBottom:"0.9rem" }}>
        <div style={{ display:"flex",justifyContent:"space-between",gap:"0.5rem" }}>
          {[["Pitch","+-0.3%"],["Timbre","97.4%"],["Cadence","+-0.8%"],["Match","98.1%"]].map(([k,v]) => (
            <div key={k} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"0.62rem",color:"#94A3B8",fontWeight:600 }}>{k}</div>
              <div style={{ fontSize:"0.8rem",fontWeight:700,color:k==="Match"?"#10B981":"#065F46" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize:"0.78rem",color:"#64748B",lineHeight:1.65,marginTop:"auto",marginBottom:0 }}>
        Chatterbox extracts vocal timbre, prosody, and pitch using a flow-matching diffusion backbone.
        No speaker embeddings or fine-tuning needed.
      </p>
    </div>
  );
}

function SttCard() {
  const words = ["Introducing","BrightBean","Coffee","the","smoothest","roast","you","ever","taste"];
  const [activeWord, setActiveWord] = useState(4);
  const bars = [0.3,0.55,0.8,1,0.7,0.45,0.85,0.6,0.4,0.7,0.9,0.5,0.75,0.35,0.65,0.8,0.5,0.9,0.55,0.7];

  return (
    <div className="bento-card p-4 sm:p-6 flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-4">
        <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#0EA5E9,#0284C7)",display:"flex",alignItems:"center",justifyContent:"center" }} className="shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontWeight:700,fontSize:"0.95rem",color:"#0F172A",letterSpacing:"-0.02em" }} className="truncate">Whisper STT Studio</div>
          <div style={{ fontSize:"0.72rem",color:"#64748B" }} className="truncate">OpenAI Whisper large-v3</div>
        </div>
        <span className="section-label shrink-0" style={{ fontSize:"0.68rem",background:"rgba(14,165,233,0.08)",borderColor:"rgba(14,165,233,0.2)",color:"#0EA5E9" }}>Transcribe</span>
      </div>

      <div
        style={{ display:"flex",alignItems:"center",gap:2.5,height:44,margin:"0 0 1rem",cursor:"pointer" }}
        onClick={() => setActiveWord(w => (w + 1) % words.length)}
      >
        {bars.map((h,i) => (
          <div key={i} style={{ flex:1,borderRadius:4,background:i < (activeWord/words.length)*bars.length ? "rgba(14,165,233,0.7)" : "rgba(14,165,233,0.18)",height:`${Math.round(h*40)}px`,transition:"background 0.2s" }} />
        ))}
      </div>

      <div style={{ display:"flex",flexWrap:"wrap",gap:"0.35rem",marginBottom:"1rem" }}>
        {words.map((w,i) => (
          <span key={i} onClick={() => setActiveWord(i)} style={{
            padding:"0.25rem 0.65rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:500,cursor:"pointer",
            background:i <= activeWord ? "rgba(14,165,233,0.12)" : "rgba(0,0,0,0.04)",
            color:i <= activeWord ? "#0284C7" : "#94A3B8",
            border:`1px solid ${i <= activeWord ? "rgba(14,165,233,0.22)" : "rgba(0,0,0,0.06)"}`,
            transition:"all 0.2s",
          }}>{w}</span>
        ))}
      </div>

      <div style={{ display:"flex",gap:"0.5rem",marginTop:"auto" }}>
        {[["TXT","#0F172A"],["SRT","#6366F1"],["JSON","#0EA5E9"]].map(([fmt,c]) => (
          <div key={fmt} style={{ flex:1,padding:"0.55rem",background:`${c}10`,border:`1px solid ${c}25`,borderRadius:10,textAlign:"center" }}>
            <div style={{ fontSize:"0.7rem",fontWeight:700,color:c }}>.{fmt}</div>
            <div style={{ fontSize:"0.65rem",color:"#94A3B8",marginTop:1 }}>Export</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingBento() {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#F4F6FB] overflow-hidden">
      <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:"3.5rem" }}>
          <span className="section-label" style={{ marginBottom:"1rem",display:"inline-flex" }}>Three Powerful Studios</span>
          <h2 style={{ fontSize:"clamp(1.9rem,3.5vw,2.8rem)",fontWeight:800,color:"#0F172A",letterSpacing:"-0.04em",lineHeight:1.1,marginTop:"0.75rem",marginBottom:"1rem" }}>
            Everything you need to{" "}
            <span className="text-gradient-cadence">work with voice at scale</span>
          </h2>
          <p style={{ fontSize:"1.05rem",color:"#64748B",lineHeight:1.7,maxWidth:"560px",margin:"0 auto" }}>
            Three fully self-hosted studios on Modal serverless GPU - zero vendor lock-in, complete data sovereignty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
          <TtsCard />
          <CloningCard />
          <SttCard />
        </div>
      </div>
    </section>
  );
}
