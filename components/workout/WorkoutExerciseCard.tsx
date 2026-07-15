"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Trash2,
} from "lucide-react";
import type { Exercise } from "@/lib/types";
import { MUSCLE_GROUP_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { MuscleBodyDiagram } from "./MuscleBodyDiagram";
import { getExerciseDetailedIntensity } from "@/lib/utils/workoutCoverage";
import { detailedMusclesFromExercise } from "@/lib/utils/detailedMuscles";
import { cn } from "@/lib/utils/cn";
import {
  DEFAULT_REP_TARGET,
  DEFAULT_TIME_TARGET,
  type ExerciseTargetMode,
  inferTargetMode,
  REP_TARGET_OPTIONS,
  TIME_TARGET_OPTIONS,
} from "@/lib/utils/exerciseTarget";
import type { ReactNode } from "react";

interface WorkoutExerciseCardProps {
  exercise: Exercise;
  index: number;
  sets: number;
  reps: string;
  editable?: boolean;
  showMedia?: boolean;
  /** Compact row layout — preferred on phones */
  compact?: boolean;
  onSetsChange?: (sets: number) => void;
  onRepsChange?: (reps: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  footer?: ReactNode;
  className?: string;
}

function TargetModeToggle({
  mode,
  onChange,
  size = "md",
}: {
  mode: ExerciseTargetMode;
  onChange: (mode: ExerciseTargetMode) => void;
  size?: "sm" | "md";
}) {
  const btn =
    size === "sm"
      ? "h-7 px-2 text-[10px]"
      : "h-8 px-2.5 text-[11px]";

  return (
    <div
      className="flex shrink-0 rounded-lg bg-white/5 p-0.5 ring-1 ring-white/10"
      role="group"
      aria-label="Target type"
    >
      {(["reps", "time"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={cn(
            "rounded-md font-semibold uppercase tracking-wide transition-colors",
            btn,
            mode === m
              ? "bg-[#f0b48a] text-[#141820]"
              : "text-white/50 active:bg-white/10"
          )}
        >
          {m === "reps" ? "Reps" : "Time"}
        </button>
      ))}
    </div>
  );
}

function TargetValueSelect({
  mode,
  value,
  onChange,
  className,
}: {
  mode: ExerciseTargetMode;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const base: string[] =
    mode === "time" ? [...TIME_TARGET_OPTIONS] : [...REP_TARGET_OPTIONS];
  const options =
    value && !base.includes(value) ? [value, ...base] : base;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={mode === "time" ? "Duration" : "Reps"}
      className={cn(
        "aura-input min-w-0 max-w-full rounded-xl",
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {mode === "reps" ? `${opt} reps` : opt}
        </option>
      ))}
    </select>
  );
}

export function WorkoutExerciseCard({
  exercise,
  index,
  sets,
  reps,
  editable = false,
  showMedia = false,
  compact = false,
  onSetsChange,
  onRepsChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp = true,
  canMoveDown = true,
  footer,
  className,
}: WorkoutExerciseCardProps) {
  const detailedIntensity = getExerciseDetailedIntensity(exercise);
  const primaryDetailed = detailedMusclesFromExercise(exercise).primary[0];

  const [mode, setMode] = useState<ExerciseTargetMode>(() =>
    inferTargetMode(reps, exercise.duration)
  );

  useEffect(() => {
    setMode(inferTargetMode(reps, exercise.duration));
  }, [reps, exercise.duration, exercise.id]);

  const switchMode = (next: ExerciseTargetMode) => {
    if (next === mode) return;
    setMode(next);
    if (next === "time") {
      const duration = exercise.duration?.trim() ?? "";
      const fallback =
        duration && (TIME_TARGET_OPTIONS as readonly string[]).includes(duration)
          ? duration
          : DEFAULT_TIME_TARGET;
      onRepsChange?.(fallback);
    } else {
      onRepsChange?.(DEFAULT_REP_TARGET);
    }
  };

  if (compact && editable) {
    return (
      <article
        className={cn(
          "aura-card w-full max-w-full overflow-hidden rounded-2xl p-3",
          className
        )}
      >
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
            <Image
              src={exercise.thumbnail}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
            <span className="absolute left-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded bg-black/65 text-[9px] font-bold text-white">
              {index + 1}
            </span>
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-0 items-start gap-1">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-white">
                  {exercise.name}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-white/50">
                  {MUSCLE_GROUP_LABELS[exercise.muscleGroup]} ·{" "}
                  {exercise.equipment}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  disabled={!canMoveUp}
                  onClick={onMoveUp}
                  aria-label="Move up"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-white/70 disabled:opacity-30 active:bg-white/15"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={!canMoveDown}
                  onClick={onMoveDown}
                  aria-label="Move down"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-white/70 disabled:opacity-30 active:bg-white/15"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label="Remove exercise"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400 active:bg-red-500/25"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2 flex min-w-0 items-center gap-2">
              <div className="flex shrink-0 items-center gap-1 rounded-xl bg-white/5 p-0.5 ring-1 ring-white/10">
                <button
                  type="button"
                  onClick={() => onSetsChange?.(Math.max(1, sets - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm active:bg-white/10"
                  aria-label="Decrease sets"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold text-white">
                  {sets}
                </span>
                <button
                  type="button"
                  onClick={() => onSetsChange?.(sets + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm active:bg-white/10"
                  aria-label="Increase sets"
                >
                  +
                </button>
                <span className="pr-2 text-[10px] uppercase tracking-wide text-white/40">
                  sets
                </span>
              </div>
              <Link
                href={`/exercises/${exercise.id}`}
                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-white/50 active:bg-white/15"
                aria-label={`View ${exercise.name}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-2 flex min-w-0 items-center gap-1.5">
              <TargetModeToggle mode={mode} onChange={switchMode} size="sm" />
              <TargetValueSelect
                mode={mode}
                value={reps}
                onChange={(v) => onRepsChange?.(v)}
                className="h-8 flex-1 px-1.5 text-xs"
              />
            </div>
          </div>
        </div>
        {footer}
      </article>
    );
  }

  return (
    <article
      className={cn(
        "aura-card overflow-hidden rounded-2xl transition-all hover:border-[#f0b48a]/20",
        className
      )}
    >
      <div className={cn("flex flex-col", showMedia && "md:flex-row")}>
        {showMedia && (
          <div className="relative aspect-[16/10] w-full shrink-0 md:aspect-auto md:h-auto md:w-44 lg:w-52">
            <Image
              src={exercise.thumbnail}
              alt={exercise.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 208px"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
            <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-xs font-bold text-white backdrop-blur-sm">
              {index + 1}
            </span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {!showMedia && (
                <span className="aura-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-[#f5d4b8]">
                  {index + 1}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white md:text-lg">
                    {exercise.name}
                  </h3>
                  <Link
                    href={`/exercises/${exercise.id}`}
                    className="text-white/40 hover:text-[#f5d4b8]"
                    aria-label={`View ${exercise.name} details`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="accent">
                    {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                  </Badge>
                  <Badge>{exercise.equipment}</Badge>
                </div>
              </div>
            </div>

            <MuscleBodyDiagram
              intensity={detailedIntensity}
              highlight={primaryDetailed}
              size="sm"
              className="hidden shrink-0 sm:flex"
            />
          </div>

          <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-left text-[11px] uppercase tracking-wider text-white/45">
                  <th className="px-3 py-2 font-medium">Sets</th>
                  <th className="px-3 py-2 font-medium">
                    {mode === "time" ? "Time" : "Reps"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {editable ? (
                  <tr className="border-t border-white/10">
                    <td className="px-2 py-2.5 sm:px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSetsChange?.(Math.max(1, sets - 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-base active:bg-white/20"
                          aria-label="Decrease sets"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-base font-semibold text-white">
                          {sets}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSetsChange?.(sets + 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-base active:bg-white/20"
                          aria-label="Increase sets"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 sm:px-3">
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                        <TargetModeToggle
                          mode={mode}
                          onChange={switchMode}
                          size="md"
                        />
                        <TargetValueSelect
                          mode={mode}
                          value={reps}
                          onChange={(v) => onRepsChange?.(v)}
                          className="h-10 w-full min-w-0 flex-1 px-2 text-sm"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (
                  Array.from({ length: Math.min(sets, 4) }).map((_, i) => (
                    <tr key={i} className="border-t border-white/10">
                      <td className="px-3 py-2 font-medium text-white">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 text-white/80">
                        {exercise.duration && i === 0
                          ? exercise.duration
                          : reps}
                      </td>
                    </tr>
                  ))
                )}
                {!editable && sets > 4 && (
                  <tr className="border-t border-white/10">
                    <td
                      colSpan={2}
                      className="px-3 py-1.5 text-xs text-white/45"
                    >
                      +{sets - 4} more sets
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {footer}

          {editable && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={!canMoveUp}
                onClick={onMoveUp}
                aria-label="Move up"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 disabled:opacity-30 active:bg-white/20"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={!canMoveDown}
                onClick={onMoveDown}
                aria-label="Move down"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 disabled:opacity-30 active:bg-white/20"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                aria-label="Remove exercise"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400 active:bg-red-500/25"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
