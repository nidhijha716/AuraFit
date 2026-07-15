import type {
  DailyChecklist,
  DayRoutine,
  ExerciseCheckEntry,
  RoutineExercise,
  SetLog,
  WeeklyRoutines,
  WorkoutSession,
} from "@/lib/types";
import type {
  ChecklistExerciseEntry,
  DayRoutine as PrismaDayRoutine,
  RoutineExercise as PrismaRoutineExercise,
  SetLogEntry,
  WorkoutSession as PrismaWorkoutSession,
} from "@prisma/client";

type RoutineWithExercises = PrismaDayRoutine & {
  exercises: PrismaRoutineExercise[];
};

type ChecklistWithExercises = {
  date: string;
  dayOfWeek: number;
  routineName: string;
  allComplete: boolean;
  completedAt: Date | null;
  exercises: (ChecklistExerciseEntry & { sets: SetLogEntry[] })[];
};

export function toDayRoutine(row: RoutineWithExercises): DayRoutine {
  return {
    dayOfWeek: row.dayOfWeek,
    name: row.name,
    updatedAt: row.updatedAt.toISOString(),
    exercises: row.exercises
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(
        (e): RoutineExercise => ({
          exerciseId: e.exerciseId,
          targetSets: e.targetSets,
          targetReps: e.targetReps,
          order: e.sortOrder,
        })
      ),
  };
}

export function toWeeklyRoutines(
  rows: RoutineWithExercises[]
): WeeklyRoutines {
  const weekly: WeeklyRoutines = {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  };
  for (const row of rows) {
    weekly[row.dayOfWeek] = toDayRoutine(row);
  }
  return weekly;
}

export function toWorkoutSession(row: PrismaWorkoutSession): WorkoutSession {
  return {
    id: row.id,
    workoutId: row.workoutId,
    workoutName: row.workoutName,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt.toISOString(),
    durationMinutes: row.durationMinutes,
    exercisesCompleted: JSON.parse(row.exercisesCompleted) as string[],
    estimatedCaloriesBurned: row.estimatedCaloriesBurned ?? undefined,
  };
}

export function toDailyChecklist(row: ChecklistWithExercises): DailyChecklist {
  return {
    date: row.date,
    dayOfWeek: row.dayOfWeek,
    routineName: row.routineName,
    allComplete: row.allComplete,
    completedAt: row.completedAt?.toISOString(),
    exercises: row.exercises.map(
      (e): ExerciseCheckEntry => ({
        exerciseId: e.exerciseId,
        completed: e.completed,
        completedAt: e.completedAt?.toISOString(),
        sets: e.sets
          .sort((a, b) => a.setNumber - b.setNumber)
          .map(
            (s): SetLog => ({
              setNumber: s.setNumber,
              reps: s.reps,
              completed: s.completed,
              weightKg: s.weightKg ?? null,
            })
          ),
      })
    ),
  };
}
