"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { getExerciseById } from "@/lib/data/mockExercises";
import type { ExerciseCheckEntry } from "@/lib/types";
import {
  REP_QUICK_OPTIONS,
  WEIGHT_QUICK_OPTIONS,
  MUSCLE_GROUP_LABELS,
} from "@/lib/types";
import { useRoutineStore } from "@/lib/store/routineStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";
import {
  formatExerciseTarget,
  isTimeTarget,
} from "@/lib/utils/exerciseTarget";

interface ExerciseChecklistItemProps {
  entry: ExerciseCheckEntry;
  targetReps?: string;
  defaultOpen?: boolean;
  embedded?: boolean;
}

function WeightRow({
  exerciseId,
  setNumber,
  weightKg,
}: {
  exerciseId: string;
  setNumber: number;
  weightKg: number | null | undefined;
}) {
  const logSetWeight = useRoutineStore((s) => s.logSetWeight);
  const value = weightKg ?? 0;
  const [showCustom, setShowCustom] = useState(
    value > 0 &&
      !WEIGHT_QUICK_OPTIONS.includes(
        value as (typeof WEIGHT_QUICK_OPTIONS)[number]
      )
  );

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-white/45">
        Weight (kg)
      </p>
      <div className="flex flex-wrap gap-1.5">
        {WEIGHT_QUICK_OPTIONS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => {
              logSetWeight(exerciseId, setNumber, w);
              setShowCustom(false);
            }}
            className={cn(
              "h-8 min-w-[2.25rem] rounded-lg px-2 text-xs font-medium transition-all",
              value === w && !showCustom
                ? "aura-btn-primary"
                : "glass text-text-primary hover:bg-[var(--glass-hover)]"
            )}
          >
            {w}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className={cn(
            "h-8 rounded-lg px-2 text-xs font-medium",
            showCustom ? "aura-btn-primary" : "glass text-text-primary"
          )}
        >
          Custom
        </button>
        {value > 0 && (
          <button
            type="button"
            onClick={() => logSetWeight(exerciseId, setNumber, null)}
            className="h-8 rounded-lg px-2 text-xs text-white/50 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
      {showCustom && (
        <div className="flex items-center gap-1 rounded-xl bg-black/20 p-2 ring-1 ring-white/10">
          <button
            type="button"
            onClick={() =>
              logSetWeight(exerciseId, setNumber, Math.max(0, value - 2.5))
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"
            aria-label="Decrease weight"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            min={0}
            max={1000}
            step={0.5}
            value={value || ""}
            placeholder="kg"
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              logSetWeight(
                exerciseId,
                setNumber,
                Number.isFinite(n) ? Math.min(1000, Math.max(0, n)) : null
              );
            }}
            className="aura-input h-8 min-w-0 flex-1 rounded-lg px-2 text-center text-sm"
          />
          <button
            type="button"
            onClick={() => logSetWeight(exerciseId, setNumber, value + 2.5)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"
            aria-label="Increase weight"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function SetRepPicker({
  exerciseId,
  setNumber,
  reps,
  weightKg,
  completed,
  canRemove,
  onRemove,
}: {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number | null | undefined;
  completed: boolean;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const logSetReps = useRoutineStore((s) => s.logSetReps);
  const isCustomValue =
    reps > 0 &&
    !REP_QUICK_OPTIONS.includes(reps as (typeof REP_QUICK_OPTIONS)[number]);
  const [showCustom, setShowCustom] = useState(isCustomValue);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          Set {setNumber}
          {completed && reps > 0 && (
            <span className="ml-2 text-[#f5d4b8]">
              {reps} reps
              {weightKg != null && weightKg > 0 ? ` · ${weightKg} kg` : ""} ✓
            </span>
          )}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-text-muted hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>

      <WeightRow
        exerciseId={exerciseId}
        setNumber={setNumber}
        weightKg={weightKg}
      />

      <p className="text-[11px] font-medium uppercase tracking-wide text-white/45">
        Reps
      </p>
      <div className="flex flex-wrap gap-2">
        {REP_QUICK_OPTIONS.map((rep) => (
          <button
            key={rep}
            type="button"
            onClick={() => {
              logSetReps(exerciseId, setNumber, rep, weightKg);
              setShowCustom(false);
            }}
            className={cn(
              "h-9 min-w-[2.5rem] rounded-xl px-3 text-sm font-medium transition-all",
              reps === rep && completed && !showCustom
                ? "aura-btn-primary text-sm font-semibold"
                : "glass text-text-primary hover:bg-[var(--glass-hover)]"
            )}
          >
            {rep}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className={cn(
            "h-9 rounded-xl px-3 text-sm font-medium transition-all",
            showCustom || isCustomValue
              ? "aura-btn-primary text-sm font-semibold"
              : "glass text-text-primary hover:bg-[var(--glass-hover)]"
          )}
        >
          Custom
        </button>
      </div>

      {(showCustom || isCustomValue) && (
        <div className="flex items-center gap-2 rounded-xl bg-black/20 p-2 ring-1 ring-white/10">
          <span className="shrink-0 text-xs text-text-muted">Reps:</span>
          <div className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() =>
                logSetReps(
                  exerciseId,
                  setNumber,
                  Math.max(0, reps - 1),
                  weightKg
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15"
              aria-label="Decrease reps"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              min={0}
              max={999}
              value={reps || ""}
              placeholder="Enter reps"
              onChange={(e) =>
                logSetReps(
                  exerciseId,
                  setNumber,
                  Math.min(999, Math.max(0, parseInt(e.target.value, 10) || 0)),
                  weightKg
                )
              }
              className="aura-input h-9 min-w-0 flex-1 rounded-lg px-2 text-center text-sm"
            />
            <button
              type="button"
              onClick={() =>
                logSetReps(exerciseId, setNumber, reps + 1, weightKg)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15"
              aria-label="Increase reps"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SetTimeCompleter({
  exerciseId,
  setNumber,
  completed,
  targetLabel,
  canRemove,
  onRemove,
}: {
  exerciseId: string;
  setNumber: number;
  completed: boolean;
  targetLabel: string;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const completeSet = useRoutineStore((s) => s.completeSet);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-text-secondary">
          Set {setNumber}
          {targetLabel && (
            <span className="ml-2 text-white/45">· {targetLabel}</span>
          )}
          {completed && (
            <span className="ml-2 text-emerald-300">Done ✓</span>
          )}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-text-muted hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => completeSet(exerciseId, setNumber, !completed)}
        className={cn(
          "flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.99]",
          completed
            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/35"
            : "aura-btn-primary"
        )}
      >
        <Check className="h-4 w-4" />
        {completed ? "Mark incomplete" : "Mark complete"}
      </button>
    </div>
  );
}

export function ExerciseChecklistItem({
  entry,
  targetReps,
  defaultOpen = false,
  embedded = false,
}: ExerciseChecklistItemProps) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const toggleComplete = useRoutineStore((s) => s.toggleExerciseComplete);
  const addSet = useRoutineStore((s) => s.addSet);
  const removeSet = useRoutineStore((s) => s.removeSet);

  const exercise = getExerciseById(entry.exerciseId);
  if (!exercise) return null;

  const timeBased =
    isTimeTarget(targetReps) ||
    (!!exercise.duration && !targetReps && !exercise.reps);
  const targetLabel = targetReps
    ? formatExerciseTarget(targetReps)
    : exercise.duration
      ? exercise.duration
      : "";

  const completedSets = entry.sets.filter((s) => s.completed).length;

  const setsPanel = (
    <div className="space-y-3">
      {entry.sets.map((set) =>
        timeBased ? (
          <SetTimeCompleter
            key={set.setNumber}
            exerciseId={entry.exerciseId}
            setNumber={set.setNumber}
            completed={set.completed}
            targetLabel={targetLabel}
            canRemove={entry.sets.length > 1}
            onRemove={() => removeSet(entry.exerciseId, set.setNumber)}
          />
        ) : (
          <SetRepPicker
            key={set.setNumber}
            exerciseId={entry.exerciseId}
            setNumber={set.setNumber}
            reps={set.reps}
            weightKg={set.weightKg}
            completed={set.completed}
            canRemove={entry.sets.length > 1}
            onRemove={() => removeSet(entry.exerciseId, set.setNumber)}
          />
        )
      )}

      <button
        type="button"
        onClick={() => addSet(entry.exerciseId)}
        className="flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium text-[#f5d4b8] hover:bg-[var(--glass-hover)]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Set
      </button>
    </div>
  );

  const logLabel = timeBased ? "Log your times" : "Log reps & weight";

  const content = (
    <>
      <div className="flex w-full items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => toggleComplete(entry.exerciseId, !entry.completed)}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            entry.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-text-muted hover:border-[#f0b48a]"
          )}
          aria-label={entry.completed ? "Mark incomplete" : "Mark complete"}
        >
          {entry.completed && <Check className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex min-w-0 flex-1 items-center justify-between text-left"
        >
          <div className="min-w-0">
            <p
              className={cn(
                "font-medium text-text-primary",
                entry.completed && "line-through opacity-70"
              )}
            >
              {exercise.name}
            </p>
            <p className="text-xs text-text-muted">
              {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
              {targetLabel && ` · Target ${targetLabel}`}
              {` · ${completedSets}/${entry.sets.length} sets`}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="ml-2 h-5 w-5 shrink-0 text-text-muted" />
          ) : (
            <ChevronDown className="ml-2 h-5 w-5 shrink-0 text-text-muted" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-glass-border px-4 pb-4 pt-3">
          {setsPanel}
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div
        className={cn(
          "mt-3 overflow-hidden rounded-xl bg-black/20 ring-1 ring-white/10",
          entry.completed && "ring-emerald-500/30"
        )}
      >
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm"
        >
          <span className="font-medium text-white/80">
            {entry.completed ? "Completed ✓" : logLabel}
          </span>
          <span className="text-xs text-white/45">
            {completedSets}/{entry.sets.length} sets
          </span>
        </button>
        {expanded && (
          <div className="space-y-3 border-t border-white/10 px-3 pb-3 pt-3">
            {setsPanel}
            <button
              type="button"
              onClick={() => toggleComplete(entry.exerciseId, !entry.completed)}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium",
                entry.completed
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              <Check className="h-3.5 w-3.5" />
              {entry.completed ? "Mark incomplete" : "Mark exercise complete"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <GlassCard
      padding="none"
      className={cn(
        "overflow-hidden transition-all",
        entry.completed && "ring-1 ring-emerald-500/30"
      )}
    >
      {content}
    </GlassCard>
  );
}
