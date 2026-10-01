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
            <p className="text-xs sm:text-[0.83rem] leading-relaxed max-w-[280px] md:max-w-[260px] text-slate-400">
              Open creative studio for voice cloning, speech, music generation, and media powered by open-source foundation models.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Studios &amp; Tools</div>
            <div className="flex flex-col gap-2">
              {[
                ["Text to Speech","/text-to-speech"],
                ["Voice Cloning","/voice-clone"],
                ["Speech to Text","/transcribe"],
                ["Music & Beat Studio","/music"],
                ["Voice Changer","/voice-changer"],
                ["Viral Video Clipper","/clipper"],
                ["Visuals & Video","/media"],
                ["Voice Agent Studio","/agent"],
                ["Voice Library","/voices"],
                ["Usage & Analytics","/usage"],
                ["Billing & Credits","/billing"],
              ].map(([l,h]) => (
                <Link key={l} href={h} className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Stack &amp; Open Source</div>
            <div className="flex flex-col gap-2">
              {[
                ["GitHub Repository","https://github.com/samolubukun/Cadence"],
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
          <span style={{ fontSize:"0.78rem" }} className="flex items-center gap-1.5 flex-wrap">
            <span>&copy; 2026 Cadence.</span>
            <span className="text-slate-500">•</span>
            <span>
              Designed &amp; Built by{" "}
              <a 
                href="https://samuelolubukun.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white font-medium hover:underline hover:text-indigo-400 transition-colors"
              >
                Samuel Olubukun
              </a>
            </span>
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/samolubukun/Cadence"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
              aria-label="Cadence GitHub"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
            <div style={{ display:"flex", gap:"0.5rem" }}>
              {["#6366F1","#A855F7","#0EA5E9","#10B981"].map(c => (
                <div key={c} style={{ width:8, height:8, borderRadius:"9999px", background:c, opacity:0.65 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
