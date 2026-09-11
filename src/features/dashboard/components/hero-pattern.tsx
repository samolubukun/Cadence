import { WavyBackground } from "@/components/ui/wavy-background";

export function HeroPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block opacity-20">
      <WavyBackground
        colors={["#2DD4BF", "#0284C7", "#38BDF8", "#6366F1"]}
        backgroundFill="#ffffff"
        blur={12}
        speed="slow"
        waveOpacity={0.15}
        waveWidth={50}
        waveYOffset={220}
        containerClassName="h-full"
        className="hidden"
      />
    </div>
  );
}