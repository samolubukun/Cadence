import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { QuickAction } from "@/features/dashboard/data/quick-actions";
import { cn } from "@/lib/utils";

type QuickActionCardProps = QuickAction;

export function QuickActionCard({
  title,
  description,
  gradient,
  href,
}: QuickActionCardProps) {
  return (
    <div className="frosted-glass-card flex flex-col sm:flex-row gap-4 rounded-2xl p-3 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 border border-slate-100 bg-white/80 backdrop-blur-md shadow-xs hover:shadow-md">
      {/* Visual placeholder with gradient */}
      <div
        className={cn(
          "relative h-28 sm:h-31 w-full sm:w-40 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
          gradient,
        )}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-10 sm:size-12 rounded-full bg-white/30 backdrop-blur-xs shadow-inner" />
        </div>
        <div className="absolute inset-2 rounded-lg ring-2 ring-inset ring-white/20" />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between py-1 flex-1 gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="xs" 
          className="w-fit border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors" 
          asChild
        >
          <Link href={href} className="flex items-center gap-1.5 font-medium">
            Try now
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>
    </div>
  )
};