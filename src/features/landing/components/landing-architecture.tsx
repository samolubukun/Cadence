"use client";

export function LandingArchitecture() {
  const stack = [
    {
      layer: "01",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
        </svg>
      ),
      title: "Chatterbox TTS Engine",
      subtitle: "Resemble AI - Flow-Matching Diffusion",
      color: "#475569",
      badgeBg: "#F8FAFC",
      badgeBorder: "#E2E8F0",
      desc: "A 500M-parameter flow-matching model trained on 50,000+ hours of human speech. Generates 24kHz audio with controllable exaggeration (0-2x) and pacing, streamed token-by-token via server-sent events for sub-second first-chunk latency.",
      pills: ["Flow Matching", "24kHz", "Streaming SSE", "Exaggeration Control"],
    },
    {
      layer: "02",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <polyline points="9 11 12 14 15 11"/>
        </svg>
      ),
      title: "OpenAI Whisper STT",
      subtitle: "large-v3 - Word-level timestamps",
      color: "#475569",
      badgeBg: "#F8FAFC",
      badgeBorder: "#E2E8F0",
      desc: "Whisper large-v3 runs on the same Modal A10G GPU, delivering word-accurate transcription in 99+ languages with forced alignment for precise word-level timestamps. Export as TXT, SRT, or JSON.",
      pills: ["Whisper large-v3", "99+ Languages", "Word Timestamps", "SRT / JSON Export"],
    },
    {
      layer: "03",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
          <line x1="6" y1="6" x2="6.01" y2="6"/>
          <line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
      ),
      title: "Modal Serverless GPU",
      subtitle: "NVIDIA A10G - Scale-to-Zero",
      color: "#475569",
      badgeBg: "#F8FAFC",
      badgeBorder: "#E2E8F0",
      desc: "Every inference request cold-starts a fresh A10G container in ~2.5s, runs the model, and terminates. You pay only for actual GPU-seconds consumed. Idle cost is $0.00. Modal handles CUDA, PyTorch, and model weight caching automatically.",
      pills: ["NVIDIA A10G", "$0 Idle Cost", "Cold-Start ~2.5s", "PyTorch Native"],
    },
    {
      layer: "04",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      ),
      title: "Cloudflare R2 Storage",
      subtitle: "Private bucket - Signed URLs",
      color: "#475569",
      badgeBg: "#F8FAFC",
      badgeBorder: "#E2E8F0",
      desc: "All generated audio, voice reference clips, and transcription outputs live in a private Cloudflare R2 bucket. Access is gated by short-lived signed URLs generated server-side. Your audio never passes through a third-party CDN unprotected.",
      pills: ["Private R2 Bucket", "Signed URLs", "Edge-Cached", "GDPR Compliant"],
    },
    {
      layer: "05",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      title: "Convex Real-Time DB",
      subtitle: "Reactive queries - Instant sync",
      color: "#475569",
      badgeBg: "#F8FAFC",
      badgeBorder: "#E2E8F0",
      desc: "Convex handles generation records, voice metadata, credit ledgers, and org management. Its reactive query engine means the dashboard updates in real-time as generations complete - no polling or websockets to manage.",
      pills: ["Reactive Queries", "Real-Time Sync", "ACID Transactions", "Built-in Auth"],
    },
    {
      layer: "06",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: "Edge-Gated Security",
      subtitle: "Zero-Trust - Clerk Auth & Signed URLs",
      color: "#475569",
      badgeBg: "#F8FAFC",
      badgeBorder: "#E2E8F0",
      desc: "JWT-verified session tokens with automated tenant isolation. Every media asset is cryptographically validated and served via pre-signed, temporary expiring URLs to protect privacy.",
      pills: ["Tenant Isolation", "Signed Auth", "Sub-50ms Edge", "Encrypted At Rest"],
    },
  ];

  return (
    <section id="architecture" style={{ padding: "6rem 1.5rem", background: "#FAF9F6" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-label" style={{ marginBottom: "1rem", display: "inline-flex" }}>
            Under the Hood
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 3.8vw, 2.9rem)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.04em", lineHeight: 1.15, marginTop: "0.75rem", marginBottom: "1rem" }}>
            Self-hosted infrastructure, zero vendor lock-in
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#64748B", lineHeight: 1.7, maxWidth: "580px", margin: "0 auto" }}>
            Every component runs on open-source models and managed cloud primitives.
            No proprietary black boxes, transparent latency.
          </p>
        </div>

        {/* Cards arranged in rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stack.map(({ layer, icon, title, subtitle, color, badgeBg, badgeBorder, desc, pills }) => (
            <div
              key={layer}
              className="group relative flex flex-col justify-between p-7 sm:p-8 bg-white hover:bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Minimalist Rounded Icon Badge matching the reference screenshot */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: badgeBg,
                      border: `1px solid ${badgeBorder}`,
                      color: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {icon}
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-300 group-hover:text-slate-500 transition-colors">
                    {layer}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-1">
                  {title}
                </h3>
                
                {/* Subtitle */}
                <p className="text-xs font-semibold text-slate-500 mb-3 tracking-wide">
                  {subtitle}
                </p>

                {/* Body Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-normal">
                  {desc}
                </p>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100/80">
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100/70 text-slate-600 border border-slate-200/50"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
