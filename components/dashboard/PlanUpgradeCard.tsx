"use client";

import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PlanUpgradeCardProps {
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function PlanUpgradeCard({ onUpgrade, onDismiss }: PlanUpgradeCardProps) {
  return (
    <section className="relative rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-4 md:rounded-3xl md:p-5">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-white/45 hover:bg-white/10 hover:text-white"
        aria-label="Dismiss upgrade"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
        Ready for the next step?
      </p>
      <h3 className="mt-1 pr-8 text-base font-bold text-white md:text-lg">
        Switch to Push / Pull / Legs
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-white/65">
        You’ve built the habit with full-body days. A simple 3-day split lets
        each muscle recover while you keep training.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button size="md" className="min-h-11" onClick={onUpgrade}>
          Upgrade my plan
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="md" variant="secondary" className="min-h-11" onClick={onDismiss}>
          Keep full-body for now
        </Button>
      </div>
    </section>
  );
}
