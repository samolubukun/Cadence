export function LandingPricing() {
  const rows = [
    { feature:"Storage",       cadence:"Private Cloudflare R2 - your bucket, your keys", others:"Vendor-managed; terms can change" },
    { feature:"Compute",       cadence:"Scale-to-zero serverless NVIDIA A10G",            others:"24/7 dedicated inference servers" },
    { feature:"Pricing model", cadence:"1 credit per character - pay-as-you-go",          others:"Opaque subscriptions + overage penalties" },
    { feature:"Voice cloning", cadence:"Zero-shot from 5s clip - no fine-tuning",         others:"Hours of data + expensive training jobs" },
    { feature:"Transcription", cadence:"Whisper large-v3 - word timestamps + SRT",        others:"Proprietary model - JSON only" },
    { feature:"Data privacy",  cadence:"Audio never leaves your R2 bucket",               others:"Sent to vendor APIs for inference" },
    { feature:"Idle cost",     cadence:"$0.00 when not in use",                           others:"Full monthly fee regardless of usage" },
  ];

  return (
    <section id="pricing" style={{ padding:"6rem 1.5rem", background:"#FAF9F6" }}>
      <div style={{ maxWidth:"960px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
          <span className="section-label" style={{ marginBottom:"1rem", display:"inline-flex" }}>Transparent Pricing</span>
          <h2 style={{ fontSize:"clamp(1.9rem,3.5vw,2.8rem)", fontWeight:800, color:"#0F172A", letterSpacing:"-0.04em", lineHeight:1.1, marginTop:"0.75rem", marginBottom:"1rem" }}>
            Cadence vs. Legacy Cloud APIs
          </h2>
          <p style={{ fontSize:"1.05rem", color:"#64748B", lineHeight:1.7, maxWidth:"540px", margin:"0 auto" }}>
            No mystery pricing. No locked-in subscriptions. Just pay for what you use.
          </p>
        </div>

        <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div style={{ minWidth:"560px", background:"rgba(255,255,255,0.92)", backdropFilter:"blur(16px)", border:"1px solid rgba(0,0,0,0.08)", borderRadius:"20px", overflow:"hidden", boxShadow:"0 4px 24px -6px rgba(15,23,42,0.08)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1.6fr 1.4fr", background:"rgba(248,250,252,0.95)", borderBottom:"1px solid rgba(0,0,0,0.06)", padding:"0.85rem 1.25rem" }}>
              <div style={{ fontWeight:700, fontSize:"0.8rem", color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Feature</div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <span style={{ width:18, height:18, borderRadius:5, background:"linear-gradient(135deg,#6366F1,#A855F7)", display:"inline-block" }} />
                <span style={{ fontWeight:700, fontSize:"0.88rem", color:"#0F172A" }}>Cadence</span>
              </div>
              <div style={{ fontWeight:600, fontSize:"0.88rem", color:"#94A3B8" }}>Legacy Cloud APIs</div>
            </div>

            {rows.map(({ feature, cadence, others }, i) => (
              <div key={feature} style={{ display:"grid", gridTemplateColumns:"1.2fr 1.6fr 1.4fr", padding:"1.1rem 1.25rem", borderBottom:i < rows.length-1 ? "1px solid rgba(0,0,0,0.05)" : "none", background:i%2===0?"transparent":"rgba(248,250,252,0.45)", alignItems:"center" }}>
                <div style={{ fontWeight:600, fontSize:"0.88rem", color:"#1E293B" }}>{feature}</div>
                <div style={{ display:"flex", alignItems:"flex-start", gap:"0.6rem" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "9999px", background: "#ECFDF5", border: "1px solid #A7F3D0", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span style={{ fontSize:"0.85rem", color:"#0F172A", fontWeight: 500, lineHeight:1.5 }}>{cadence}</span>
                </div>
                <div style={{ display:"flex", alignItems:"flex-start", gap:"0.6rem" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "9999px", background: "#F1F5F9", border: "1px solid #E2E8F0", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </span>
                  <span style={{ fontSize:"0.84rem", color:"#64748B", lineHeight:1.5 }}>{others}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:"2rem", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1rem" }}>
          {[
            { label:"Free credits on signup", value:"10,000", sub:"No credit card required", color:"#10B981" },
            { label:"Per character rate",     value:"1 credit", sub:"Flat, predictable pricing", color:"#6366F1" },
            { label:"Idle compute cost",      value:"$0.00",  sub:"Scale-to-zero GPU",        color:"#0EA5E9" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ textAlign:"center", padding:"1.5rem", background:"rgba(255,255,255,0.85)", backdropFilter:"blur(12px)", border:"1px solid rgba(0,0,0,0.07)", borderRadius:"16px", boxShadow:"0 2px 12px -4px rgba(15,23,42,0.06)" }}>
              <div style={{ fontSize:"2rem", fontWeight:800, color, letterSpacing:"-0.04em", lineHeight:1 }}>{value}</div>
              <div style={{ fontWeight:600, fontSize:"0.85rem", color:"#0F172A", marginTop:"0.4rem" }}>{label}</div>
              <div style={{ fontSize:"0.75rem", color:"#94A3B8", marginTop:"0.2rem" }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
