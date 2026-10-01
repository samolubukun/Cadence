"use client";

import Image from "next/image";
import Link from "next/link";
import { Mic, Music, Scissors, ArrowUpRight } from "lucide-react";

interface StoryCard {
  id: string;
  category: string;
  icon: typeof Mic;
  title: string;
  headline: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
}

const CREATIVE_STORIES: StoryCard[] = [
  {
    id: "podcasts",
    category: "Storytelling & Audio",
    icon: Mic,
    title: "Voice that Connects",
    headline: "Intimate audiobooks, weekly podcasts, and narrative media.",
    description: "Whether you're recording a serialized audio fiction or powering conversational voice agents, generate expressive speech with natural breath, emotion, and human nuance.",
    image: "/images/showcase/podcast-creator.jpg",
    tags: ["24kHz Neural TTS", "Zero-Shot Cloning", "99+ Languages"],
    link: "/text-to-speech",
  },
  {
    id: "music",
    category: "Soundscapes & Composition",
    icon: Music,
    title: "Sound Without Boundaries",
    headline: "Full vocal tracks, instrumental beats, and Foley soundscapes.",
    description: "Build complete songs from lyrics, generate backing grooves in any genre, isolate individual 4-track stems, and craft custom sound effects for your productions.",
    image: "/images/showcase/music-sanctuary.jpg",
    tags: ["Full Vocal Songs", "Instrumental Beats", "4-Track Stems"],
    link: "/music",
  },
  {
    id: "creators",
    category: "Viral Video & Shorts",
    icon: Scissors,
    title: "Viral Clips & Short-Form Video",
    headline: "Automated 9:16 shorts, active speaker tracking, and kinetic captions.",
    description: "Transform long podcasts, interviews, and recordings into viral short-form clips with automated YOLO11 speaker reframing and burned-in animated subtitles in minutes.",
    image: "/images/showcase/viral-clipper-creator.jpg",
    tags: ["YOLO11 Speaker Track", "Kinetic Subtitles", "9:16 Auto-Crop"],
    link: "/clipper",
  },
];

export function LandingCreativeShowcase() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAF9F6] border-b border-border/50 relative overflow-hidden">
      {/* Ambient background glow */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 10%, rgba(99,102,241,0.06), transparent 70%)"
        }}
      />

      <div className="max-w-6xl mx-auto space-y-14 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-xs">
            Creative Workflows
          </div>
          <h2 style={{ fontSize: "clamp(1.9rem,3.5vw,2.8rem)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: "0.75rem", marginBottom: "1rem" }}>
            Built for modern <span className="text-gradient-cadence">creators, studios &amp; storytellers</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            From solo podcasters and independent musicians to agency media teams, explore how Cadence integrates into everyday creative production.
          </p>
        </div>

        {/* 3-Card Editorial Stock Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CREATIVE_STORIES.map((story) => {
            const Icon = story.icon;
            return (
              <div
                key={story.id}
                className="group rounded-3xl border border-slate-200/90 bg-white/95 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:border-slate-300"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium shadow-sm">
                    <Icon className="size-3 text-indigo-300" />
                    <span>{story.category}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {story.headline}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {story.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-slate-100">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {story.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action link */}
                    <Link
                      href={story.link}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      <span>Explore Studio</span>
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
