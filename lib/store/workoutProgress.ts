import { getExerciseById } from "@/lib/data/exercises";
import type { MuscleGroup, ProgressStats, WorkoutSession } from "@/lib/types";
import { isSameDay, isYesterday } from "@/lib/utils/formatDate";

const emptyMuscleBreakdown: Record<MuscleGroup, number> = {
  chest: 0,
  back: 0,
  legs: 0,
  shoulders: 0,
  arms: 0,
  core: 0,
  full_body: 0,
};

function computeStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;

  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  const today = new Date();
  const lastDate = new Date(sorted[0].completedAt);

  if (!isSameDay(lastDate, today) && !isYesterday(lastDate, today)) {
    return 0;
  }

  let streak = 1;
  let checkDate = new Date(lastDate);

  for (let i = 1; i < sorted.length; i++) {
    const sessionDate = new Date(sorted[i].completedAt);
    const expectedPrev = new Date(checkDate);
    expectedPrev.setDate(expectedPrev.getDate() - 1);

    if (isSameDay(sessionDate, expectedPrev)) {
      streak++;
      checkDate = sessionDate;
    } else if (isSameDay(sessionDate, checkDate)) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

function computeWeeklyMinutes(sessions: WorkoutSession[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  return sessions
    .filter((s) => new Date(s.completedAt) >= weekStart)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

function computeMuscleGroupBreakdown(
  sessions: WorkoutSession[]
): Record<MuscleGroup, number> {
  const breakdown = { ...emptyMuscleBreakdown };

  for (const session of sessions) {
    for (const exerciseId of session.exercisesCompleted) {
      const exercise = getExerciseById(exerciseId);
      if (exercise) {
        breakdown[exercise.muscleGroup] += 1;
      }
    }
  }

  return breakdown;
}

export function computeProgressFromSessions(
  sessions: WorkoutSession[]
): ProgressStats {
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  return {
    totalWorkouts: sessions.length,
    streak: computeStreak(sessions),
    weeklyMinutes: computeWeeklyMinutes(sessions),
    lastWorkoutDate: sorted[0]?.completedAt ?? null,
    muscleGroupBreakdown: computeMuscleGroupBreakdown(sessions),
  };
}
