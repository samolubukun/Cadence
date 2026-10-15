import Link from "next/link";
import Image from "next/image";

export function LandingFooter() {
  return (
    <footer style={{ background:"#0F172A", padding:"3.5rem 1.5rem 2rem", color:"rgba(255,255,255,0.55)" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        {/* Main Grid: On mobile (small screens), 1 clean column per group; on sm (640px+) 2 columns; on md 3 columns; on lg (1024px+) 5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-10 sm:gap-y-12 sm:gap-x-8 lg:gap-x-6 mb-12 sm:mb-16">
          {/* Brand Info Column */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1 flex flex-col items-start text-left">
            {/* Logo and Name */}
            <div className="flex items-center gap-3 mb-3.5">
              <Image 
                src="/logo.svg" 
                alt="Cadence" 
                width={40} 
                height={40} 
                className="size-10 shrink-0 drop-shadow-md" 
              />
              <span className="font-extrabold text-2xl lg:text-xl text-white tracking-tight">
                Cadence
              </span>
            </div>
            <p className="text-xs sm:text-[0.83rem] leading-relaxed max-w-sm lg:max-w-[220px] text-slate-400">
              The open platform for every layer of voice, music, and media creation powered by open-source foundation models.
            </p>
          </div>

          {/* Column 1: Studios & Tools */}
          <div className="flex flex-col items-start">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              <span>Studios &amp; Tools</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                ["Text to Speech","/text-to-speech"],
                ["Voice Cloning","/voice-clone"],
                ["Speech to Text","/transcribe"],
                ["Music & Beat Studio","/music"],
                ["Sound FX Studio","/sound-fx"],
                ["Voice Changer","/voice-changer"],
                ["Viral Video Clipper","/clipper"],
                ["Visuals & Video","/media"],
                ["Voice Agent Studio","/agent"],
                ["Voice Library","/voices"],
                ["Usage & Analytics","/usage"],
                ["Observability Traces","/observability"],
              ].map(([l,h]) => (
                <Link key={l} href={h} className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Open Source Models */}
          <div className="flex flex-col items-start">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-purple-500" />
              <span>Open Source Models</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                ["Chatterbox Turbo (TTS)","https://github.com/resemble-ai/chatterbox"],
                ["Whisper Large-v3 (STT)","https://github.com/openai/whisper"],
                ["ACE-Step 1.5 (Song Gen)","https://huggingface.co/spaces/ACE-Studio/ACE-Step"],
                ["Meta MusicGen & AudioGen","https://github.com/facebookresearch/audiocraft"],
                ["Meta Demucs v4 (Stems)","https://github.com/facebookresearch/demucs"],
                ["MyShell OpenVoice v2","https://github.com/myshell-ai/OpenVoice"],
                ["RVC v2 (Singing Voice)","https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI"],
                ["Qwen-Image-2.1 DiT","https://huggingface.co/Qwen/Qwen-Image-2.1"],
                ["SenseNova-U1.5 8B MoT","https://huggingface.co/SenseNova"],
                ["Wan2.1 (Video Diffusion)","https://github.com/Wan-Video/Wan2.1"],
                ["Kokoro-82M (Realtime TTS)","https://huggingface.co/hexgrad/Kokoro-82M"],
                ["Ultralytics YOLO11","https://github.com/ultralytics/ultralytics"],
              ].map(([l,h]) => (
                <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Stack & Infrastructure */}
          <div className="flex flex-col items-start">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-cyan-500" />
              <span>Infrastructure</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                ["GitHub Repository","https://github.com/samolubukun/Cadence"],
                ["Modal GPU Serverless","https://modal.com"],
                ["Docker Compose Microservices","https://docs.docker.com/compose/"],
                ["Cloudflare R2 Storage","https://cloudflare.com/developer-platform/r2"],
                ["Convex Realtime DB","https://convex.dev"],
                ["Langfuse Observability","https://langfuse.com"],
                ["NVIDIA Parakeet NeMo","https://github.com/NVIDIA/NeMo"],
                ["Silero VAD","https://github.com/snakers4/silero-vad"],
                ["Resemble Enhance","https://github.com/resemble-ai/resemble-enhance"],
                ["Voice Data (VCTK Corpus)","https://www.kaggle.com/datasets/pratt3000/vctk-corpus/data"],
              ].map(([l,h]) => (
                <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: Account & Access */}
          <div className="flex flex-col items-start">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Account</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <Link href="/sign-in" className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                Create Account
              </Link>
              <Link href="/dashboard" className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/billing" className="text-xs sm:text-[0.83rem] text-slate-400 hover:text-white transition-colors">
                Billing &amp; Credits
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:"1.5rem", display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", gap:"0.75rem" }}>
          <span style={{ fontSize:"0.78rem" }} className="flex items-center gap-1.5 flex-wrap">
            <span>&copy; 2026 Cadence.</span>
            <span className="text-slate-500">•</span>
            <span>
              Engineered &amp; Built with precision by{" "}
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
