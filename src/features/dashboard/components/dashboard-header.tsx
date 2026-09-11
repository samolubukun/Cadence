"use client";

import { useUser } from "@clerk/nextjs";
import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const { isLoaded, user } = useUser();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Studio Overview
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back, {isLoaded ? (user?.firstName ?? user?.fullName ?? "Creator") : "..."}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Neural Engine Live
        </span>
      </div>
    </div>
  );
};
