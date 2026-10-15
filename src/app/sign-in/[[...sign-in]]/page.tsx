import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Info, Github, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  const isLiveAuth = process.env.NEXT_PUBLIC_ENABLE_LIVE_AUTH === "true";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-luminous-canvas p-4 curtain-glow">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white p-2 shadow-md border border-cyan-100">
          <Image
            src="/logo.svg"
            alt="Cadence"
            width={38}
            height={38}
            className="size-9.5 object-contain"
          />
        </div>
        <span className="text-3xl font-bold tracking-tight text-foreground">
          Cadence
        </span>
      </div>

      {!isLiveAuth && (
        <div className="mb-6 w-full max-w-md rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Info className="size-4" />
            </div>
            <div className="flex-1 text-xs leading-relaxed text-amber-950">
              <p className="font-semibold text-amber-900">Showcase / Demo Mode</p>
              <p className="mt-1 text-amber-800/90">
                This public preview deployment operates in showcase mode. Live Clerk authentication and production databases are disabled here. To run Cadence with full cloud GPU synthesis and your own credentials, clone and self-host the repository.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href="https://github.com/samolubukun/Cadence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-950 shadow-2xs hover:bg-amber-100 transition-colors"
                >
                  <Github className="size-3.5" />
                  View on GitHub
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-amber-900 hover:text-amber-950 transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to Showcase
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border border-black/5 bg-white/90 backdrop-blur-md rounded-2xl",
          },
        }}
      />
    </div>
  );
}

