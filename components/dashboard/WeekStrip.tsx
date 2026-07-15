"use client";

import Link from "next/link";
import type { WeeklyRoutines } from "@/lib/types";
import { DAY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface WeekStripProps {
  weeklyRoutines: WeeklyRoutines;
  today: number;
}

export function WeekStrip({ weeklyRoutines, today }: WeekStripProps) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {DAY_LABELS.map((label, dayIndex) => {
        const routine = weeklyRoutines[dayIndex];
        const hasRoutine = routine !== null && routine.exercises.length > 0;
        const isToday = dayIndex === today;

        return (
          <Link
            key={label}
            href={`/schedule/${dayIndex}`}
            className={cn(
              "dashboard-week-pill flex flex-col items-center rounded-xl px-1 py-2.5 text-center transition-all sm:py-3",
              isToday && "dashboard-week-pill--today",
              hasRoutine && !isToday && "dashboard-week-pill--scheduled"
            )}
          >
            <span className="text-[10px] font-medium uppercase tracking-wide text-white/55 sm:text-xs">
              {label}
            </span>
            <span
              className={cn(
                "mt-1.5 h-2 w-2 rounded-full",
                hasRoutine ? "bg-[#f0b48a]" : "bg-white/15",
                isToday && "ring-2 ring-[#f0b48a]/40 ring-offset-1 ring-offset-transparent"
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
