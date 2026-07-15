"use client";

import type { Exercise } from "@/lib/types";
import { getWorkoutCoverage } from "@/lib/utils/workoutCoverage";
import { Dumbbell, Layers } from "lucide-react";
import { MuscleBodyDiagram } from "./MuscleBodyDiagram";
import { cn } from "@/lib/utils/cn";

interface WorkoutCoveragePanelProps {
  exercises: Exercise[];
  routineName?: string;
  subtitle?: string;
  /** Compact layout for phones */
  compact?: boolean;
}

export function WorkoutCoveragePanel({
  exercises,
  routineName,
  subtitle = "Personalized for your goals",
  compact = false,
}: WorkoutCoveragePanelProps) {
  const stats = getWorkoutCoverage(exercises);

  return (
    <div
      className={cn(
        "aura-card rounded-2xl lg:sticky lg:top-6",
        compact ? "space-y-3 p-3.5" : "space-y-5 p-5"
      )}
    >
      {routineName && (
        <div>
          <h2
            className={cn(
              "truncate font-bold text-white",
              compact ? "text-base" : "text-lg md:text-xl"
            )}
          >
            {routineName}
          </h2>
          <p className="text-xs text-white/55 md:text-sm">{subtitle}</p>
        </div>
      )}

      <div className={cn("flex items-center", compact ? "gap-3" : "gap-4")}>
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-full",
            compact ? "h-12 w-12" : "h-16 w-16"
          )}
          style={{
            background: `conic-gradient(#f0b48a ${stats.coverage}%, rgba(255,255,255,0.08) 0)`,
          }}
        >
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-full bg-[#1a2438] text-center",
              compact ? "h-9 w-9" : "h-12 w-12"
            )}
          >
            <span
              className={cn(
                "font-bold text-white",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {stats.coverage}%
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Muscle coverage</p>
          <p className="text-xs text-white/55">
            {stats.detailedMusclesHit} targets · {stats.totalExercises}{" "}
            exercises
          </p>
        </div>
      </div>

      <div className={compact ? "hidden sm:block" : undefined}>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/45">
          Fatigue map
        </p>
        <MuscleBodyDiagram
          intensity={stats.detailedIntensity}
          size={compact ? "md" : "lg"}
          className="mx-auto w-full max-w-xs"
        />
        <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-white/45">
          <span>Low</span>
          <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-white/20 via-[#f0b48a] to-[#e87050]" />
          <span>High</span>
        </div>
      </div>

      {stats.detailedList.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/45">
            <Layers className="h-3.5 w-3.5" />
            Muscle targets
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats.detailedList.map(({ id, label, score }) => (
              <span
                key={id}
                className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/80 ring-1 ring-white/10"
              >
                {label}
                <span className="text-white/45">
                  {" "}
                  · {score % 1 === 0 ? score : score.toFixed(1)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.equipment.length > 0 && !compact && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/45">
            <Dumbbell className="h-3.5 w-3.5" />
            Equipment
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats.equipment.map((item) => (
              <span
                key={item}
                className="rounded-lg bg-black/25 px-2.5 py-1 text-[11px] text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
