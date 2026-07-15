import { getExerciseById } from "@/lib/data/exercises";
import type { MuscleGroup, WorkoutSession } from "@/lib/types";
import { toDateKey } from "@/lib/utils/dateKey";

export const DAILY_PROGRESS_DAYS = 10;

export interface DailyProgressDay {
  date: string;
  estimatedCaloriesBurned: number;
  muscleGroupBreakdown: Record<MuscleGroup, number>;
  workoutCount: number;
  minutes: number;
}

const emptyMuscleBreakdown = (): Record<MuscleGroup, number> => ({
  chest: 0,
  back: 0,
  legs: 0,
  shoulders: 0,
  arms: 0,
  core: 0,
  full_body: 0,
});

function addDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

function emptyDay(date: string): DailyProgressDay {
  return {
    date,
    estimatedCaloriesBurned: 0,
    muscleGroupBreakdown: emptyMuscleBreakdown(),
    workoutCount: 0,
    minutes: 0,
  };
}

/** Build calendar keys for today back through (days - 1), newest first. */
export function lastNDateKeys(
  days: number = DAILY_PROGRESS_DAYS,
  from: Date = new Date()
): string[] {
  return Array.from({ length: days }, (_, i) =>
    toDateKey(addDays(from, -i))
  );
}

function applySessionToDay(
  day: DailyProgressDay,
  session: WorkoutSession
): void {
  day.workoutCount += 1;
  day.minutes += session.durationMinutes;
  day.estimatedCaloriesBurned += session.estimatedCaloriesBurned ?? 0;

  for (const exerciseId of session.exercisesCompleted) {
    const exercise = getExerciseById(exerciseId);
    if (exercise) {
      day.muscleGroupBreakdown[exercise.muscleGroup] += 1;
    }
  }
}

/** Drop checklist burn logs on days that already have a Training Mode session. */
export function preferRealSessionsOverChecklist(
  sessions: WorkoutSession[]
): WorkoutSession[] {
  const daysWithReal = new Set(
    sessions
      .filter((s) => !s.workoutId.startsWith("checklist-"))
      .map((s) => toDateKey(new Date(s.completedAt)))
  );

  return sessions.filter((s) => {
    if (!s.workoutId.startsWith("checklist-")) return true;
    return !daysWithReal.has(toDateKey(new Date(s.completedAt)));
  });
}

/**
 * Day-scoped progress for the last N days (including today).
 * Missing days are included with zeros so history always spans N days.
 */
export function buildDailyProgressHistory(
  sessions: WorkoutSession[],
  days: number = DAILY_PROGRESS_DAYS
): DailyProgressDay[] {
  const keys = lastNDateKeys(days);
  const byDate = new Map<string, DailyProgressDay>(
    keys.map((key) => [key, emptyDay(key)])
  );

  for (const session of preferRealSessionsOverChecklist(sessions)) {
    const key = toDateKey(new Date(session.completedAt));
    const day = byDate.get(key);
    if (!day) continue;
    applySessionToDay(day, session);
  }

  return keys.map((key) => byDate.get(key)!);
}

export function getTodayProgress(
  sessions: WorkoutSession[]
): DailyProgressDay {
  return buildDailyProgressHistory(sessions, 1)[0];
}

export function muscleEntriesFromBreakdown(
  breakdown: Record<MuscleGroup, number>
): [MuscleGroup, number][] {
  return (Object.entries(breakdown) as [MuscleGroup, number][])
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);
}

export function formatDayLabel(dateKey: string): string {
  const today = toDateKey();
  if (dateKey === today) return "Today";

  const yesterday = toDateKey(addDays(new Date(), -1));
  if (dateKey === yesterday) return "Yesterday";

  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
