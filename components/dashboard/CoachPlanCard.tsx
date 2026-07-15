"use client";

import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { CoachGuidance } from "@/lib/utils/coachGuidance";

interface CoachPlanCardProps {
  guidance: CoachGuidance;
  onInstallPlan?: () => void;
  className?: string;
}

export function CoachPlanCard({
  guidance,
  onInstallPlan,
  className,
}: CoachPlanCardProps) {
  const isInstall = guidance.ctaHref === "#install-beginner-plan";

  return (
    <section
      className={cn(
        "rounded-[1.75rem] border border-[#f0b48a]/20 bg-gradient-to-br from-[#f0b48a]/12 via-white/[0.04] to-transparent p-4 md:rounded-3xl md:p-5",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-[#f5d4b8]">
        {guidance.mode === "empty" ? (
          <Compass className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <p className="text-[11px] font-semibold uppercase tracking-wider">
          Your plan guide
        </p>
      </div>

      <h2 className="text-lg font-bold text-white md:text-xl">
        {guidance.title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-white/70">
        {guidance.why}
      </p>
      <p className="mt-2 text-sm font-medium text-[#f5d4b8]/90">
        {guidance.nextLine}
      </p>

      {isInstall ? (
        <Button
          size="lg"
          className="mt-4 min-h-12 w-full sm:w-auto"
          onClick={onInstallPlan}
        >
          {guidance.ctaLabel}
        </Button>
      ) : (
        <Link href={guidance.ctaHref} className="mt-4 block sm:inline-block">
          <Button size="lg" className="min-h-12 w-full sm:w-auto">
            {guidance.ctaLabel}
          </Button>
        </Link>
      )}
    </section>
  );
}
