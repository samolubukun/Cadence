import Link from "next/link";
import Image from "next/image";

export function LandingFooter() {
  return (
    <footer style={{ background:"#0F172A", padding:"3.5rem 1.5rem 2rem", color:"rgba(255,255,255,0.55)" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        {/* Main Grid: On mobile, brand block is full-width centered; on md it takes 1 column of 4 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1 flex flex-col items-center text-center md:items-start md:text-left mb-2 md:mb-0">
            {/* Logo and Name: stacked vertically and centered on mobile, inline on md */}
            <div className="flex flex-col items-center md:flex-row md:items-center gap-3 mb-3">
              <Image 
                src="/logo.svg" 
                alt="Cadence" 
                width={56} 
                height={56} 
                className="w-14 h-14 md:w-10 md:h-10 shrink-0 drop-shadow-md" 
              />
              <span className="font-extrabold text-2xl md:text-xl text-white tracking-tight">
                Cadence
              </span>
            </div>
            <p className="text-xs sm:text-[0.83rem] leading-relaxed max-w-[280px] md:max-w-[240px] text-slate-400">
              Self-hosted voice AI studio. TTS, cloning, and transcription on open-source models.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Product</div>
            <div className="flex flex-col gap-2">
              {[["TTS Studio","/text-to-speech"],["Voice Cloning","/voice-clone"],["Transcription","/transcribe"],["Voice Library","/voices"]].map(([l,h]) => (
                <Link key={l} href={h} className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Stack</div>
            <div className="flex flex-col gap-2">
              {[
                ["Chatterbox TTS","https://resemble.ai"],
                ["Whisper STT","https://openai.com/research/whisper"],
                ["Modal GPU","https://modal.com"],
                ["Cloudflare R2","https://cloudflare.com/developer-platform/r2"],
                ["Convex DB","https://convex.dev"],
                ["Voice Data (VCTK Corpus)","https://www.kaggle.com/datasets/pratt3000/vctk-corpus/data"]
              ].map(([l,h]) => (
                <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex flex-col items-start">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Account</div>
            <div className="flex flex-col gap-2">
              <Link href="/sign-in" className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:"1.5rem", display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", gap:"0.75rem" }}>
          <span style={{ fontSize:"0.78rem" }}>2026 Cadence. All rights reserved.</span>
          <div style={{ display:"flex", gap:"0.5rem" }}>
            {["#6366F1","#A855F7","#0EA5E9","#10B981"].map(c => (
              <div key={c} style={{ width:8, height:8, borderRadius:"9999px", background:c, opacity:0.65 }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
