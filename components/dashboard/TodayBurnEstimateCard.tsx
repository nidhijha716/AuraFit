"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useUserStore } from "@/lib/store/userStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import {
  estimateWorkoutCaloriesBurned,
  sumCaloriesBurnedToday,
  type ExerciseBurnInput,
} from "@/lib/utils/calories";
import { cn } from "@/lib/utils/cn";
import { resolveCalorieProfile } from "@/lib/utils/resolveCalorieProfile";

interface TodayBurnEstimateCardProps {
  exerciseItems: ExerciseBurnInput[];
  durationMinutes: number;
  workoutComplete?: boolean;
  className?: string;
}

export function TodayBurnEstimateCard({
  exerciseItems,
  durationMinutes,
  workoutComplete = false,
  className,
}: TodayBurnEstimateCardProps) {
  const user = useUserStore((s) => s.user);
  const isGuest = useUserStore((s) => s.isGuest);
  const sessions = useWorkoutStore((s) => s.sessions);

  const calorieProfile = useMemo(
    () => resolveCalorieProfile(user, isGuest),
    [user, isGuest]
  );

  const estimatedIfFinished = useMemo(() => {
    if (!calorieProfile || exerciseItems.length === 0) return null;
    return estimateWorkoutCaloriesBurned({
      durationMinutes: Math.max(1, durationMinutes),
      exerciseIds: exerciseItems.map((e) => e.exerciseId),
      exercises: exerciseItems,
      weightKg: calorieProfile.weightKg,
    });
  }, [calorieProfile, exerciseItems, durationMinutes]);

  const burnedToday = useMemo(
    () => sumCaloriesBurnedToday(sessions),
    [sessions]
  );

  if (!calorieProfile || estimatedIfFinished == null) return null;

  const remaining = Math.max(0, estimatedIfFinished - burnedToday);
  const showFinished = workoutComplete || remaining === 0;

  return (
    <GlassCard
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-[#f0b48a]/20 bg-gradient-to-br from-[#f0b48a]/10 via-white/[0.03] to-transparent",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f0b48a]/15 ring-1 ring-[#f0b48a]/25">
          <Flame className="h-5 w-5 text-[#f5d4b8]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#f5d4b8]">
            Today&apos;s burn estimate
          </p>
          {showFinished ? (
            <>
              <p className="mt-1 text-2xl font-bold text-white">
                ~{burnedToday > 0 ? burnedToday : estimatedIfFinished}{" "}
                <span className="text-base font-semibold text-white/60">
                  kcal
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                {burnedToday > 0
                  ? "Estimated calories burned from today's logged workout."
                  : "Workout done — estimate if you finished today's plan."}
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold text-white">
                ~{estimatedIfFinished}{" "}
                <span className="text-base font-semibold text-white/60">
                  kcal
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                Estimated if you finish today
                {burnedToday > 0
                  ? ` · ~${burnedToday} already logged`
                  : ""}
                . Adjusts after you log sets, reps, and weight.
              </p>
            </>
          )}

          <Link
            href="/progress"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#f5d4b8] transition-opacity hover:opacity-80"
          >
            <Zap className="h-3.5 w-3.5" aria-hidden />
            View on Progress
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
