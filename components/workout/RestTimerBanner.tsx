"use client";

import { Pause, Plus, X } from "lucide-react";
import { useRestTimerStore } from "@/lib/store/restTimerStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RestTimerBanner({ className }: { className?: string }) {
  const active = useRestTimerStore((s) => s.active);
  const secondsLeft = useRestTimerStore((s) => s.secondsLeft);
  const totalSeconds = useRestTimerStore((s) => s.totalSeconds);
  const label = useRestTimerStore((s) => s.label);
  const cancel = useRestTimerStore((s) => s.cancel);
  const addTime = useRestTimerStore((s) => s.addTime);

  if (!active) return null;

  const pct =
    totalSeconds > 0
      ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100))
      : 0;

  return (
    <div
      className={cn(
        // Sit above the bottom CTA without covering it (training uses ~4rem button).
        "fixed inset-x-0 bottom-[calc(var(--nav-height)+5.5rem)] z-40 mx-auto w-[min(100%-1.5rem,28rem)] rounded-2xl border border-[#f0b48a]/35 bg-[#1a1410]/95 p-4 shadow-xl backdrop-blur-md lg:bottom-24",
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${label}: ${formatTime(secondsLeft)} remaining`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#f5d4b8]">
          <Pause className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-wider">
            {label}
          </p>
        </div>
        <button
          type="button"
          onClick={cancel}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Skip rest"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-4xl font-bold tabular-nums text-white">
        {formatTime(secondsLeft)}
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#f0b48a] transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={() => addTime(30)}
        >
          <Plus className="h-3.5 w-3.5" />
          +30s
        </Button>
        <Button size="sm" className="flex-1" onClick={cancel}>
          Skip rest
        </Button>
      </div>
    </div>
  );
}
