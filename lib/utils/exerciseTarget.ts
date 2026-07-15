/** Detect if a stored target string is time-based (e.g. "30 sec", "10 min"). */
export function isTimeTarget(value: string | undefined | null): boolean {
  if (!value?.trim()) return false;
  return /\b(sec|secs|second|seconds|min|mins|minute|minutes)\b/i.test(
    value.trim()
  );
}

export type ExerciseTargetMode = "reps" | "time";

export function inferTargetMode(
  value: string,
  exerciseDuration?: string
): ExerciseTargetMode {
  if (isTimeTarget(value)) return "time";
  if (!value.trim() && isTimeTarget(exerciseDuration)) return "time";
  return "reps";
}

/** Label for UI: "12 reps" vs "10 min" (already includes unit). */
export function formatExerciseTarget(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isTimeTarget(trimmed)) return trimmed;
  return `${trimmed} reps`;
}

/** First numeric rep count from targets like "12" or "8-12" (for training auto-fill). */
export function parseDefaultRepsFromTarget(
  value: string | undefined | null
): number {
  if (!value?.trim() || isTimeTarget(value)) return 0;
  const match = value.trim().match(/(\d+)/);
  return match ? Math.min(999, parseInt(match[1], 10)) : 12;
}

export const REP_TARGET_OPTIONS = [
  "6",
  "8",
  "10",
  "12",
  "15",
  "20",
  "8-12",
  "12-15",
] as const;

export const TIME_TARGET_OPTIONS = [
  "30 sec",
  "45 sec",
  "1 min",
  "2 min",
  "3 min",
  "5 min",
  "10 min",
  "15 min",
  "20 min",
  "30 min",
  "45 min",
  "60 min",
] as const;

export const DEFAULT_REP_TARGET = "12";
export const DEFAULT_TIME_TARGET = "5 min";
