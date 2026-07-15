"use client";

import { cn } from "@/lib/utils/cn";

interface TrainingProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function TrainingProgress({ current, total, className }: TrainingProgressProps) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-text-secondary">Progress</span>
        <span className="text-text-primary">
          {Math.min(current, total)} / {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--glass-hover)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#f0b48a] to-[#f5d4b8] transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
