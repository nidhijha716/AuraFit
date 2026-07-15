"use client";

import { create } from "zustand";
import {
  clearDayRoutineIfAuthenticated,
  syncChecklistIfAuthenticated,
  syncDayRoutineIfAuthenticated,
} from "@/lib/store/fitnessPersistence";
import { loadGuestBodyProfile } from "@/lib/store/guestBodyProfile";
import { useUserStore } from "@/lib/store/userStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import type {
  DailyChecklist,
  DayRoutine,
  RoutineExercise,
  WeeklyRoutines,
} from "@/lib/types";
import { getExerciseById } from "@/lib/data/exercises";
import { getTodayDayOfWeek, toDateKey } from "@/lib/utils/dateKey";
import { considerPersonalRecord } from "@/lib/utils/personalRecords";
import {
  inferTargetMode,
  parseDefaultRepsFromTarget,
} from "@/lib/utils/exerciseTarget";
import { useRestTimerStore } from "@/lib/store/restTimerStore";
import { DEFAULT_REST_SECONDS } from "@/lib/types";

function maybeStartRest(justCompleted: boolean) {
  if (!justCompleted) return;
  useRestTimerStore.getState().start(DEFAULT_REST_SECONDS);
}

interface RoutineState {
  weeklyRoutines: WeeklyRoutines;
  dailyChecklists: Record<string, DailyChecklist>;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  getDayRoutine: (dayOfWeek: number) => DayRoutine | null;
  setDayRoutine: (routine: DayRoutine) => void;
  clearDayRoutine: (dayOfWeek: number) => void;
  addExerciseToDay: (
    dayOfWeek: number,
    exercise: Omit<RoutineExercise, "order">
  ) => void;
  removeExerciseFromDay: (dayOfWeek: number, exerciseId: string) => void;
  updateRoutineExercise: (
    dayOfWeek: number,
    exerciseId: string,
    updates: Partial<Pick<RoutineExercise, "targetSets" | "targetReps">>
  ) => void;
  reorderExercise: (
    dayOfWeek: number,
    exerciseId: string,
    direction: "up" | "down"
  ) => void;

  getTodayChecklist: () => DailyChecklist | null;
  getOrCreateTodayChecklist: () => DailyChecklist | null;
  toggleExerciseComplete: (exerciseId: string, completed: boolean) => void;
  logSetReps: (
    exerciseId: string,
    setNumber: number,
    reps: number,
    weightKg?: number | null
  ) => void;
  logSetWeight: (
    exerciseId: string,
    setNumber: number,
    weightKg: number | null
  ) => void;
  /** Mark a set done/undone without requiring logged reps (for time-based targets). */
  completeSet: (
    exerciseId: string,
    setNumber: number,
    completed?: boolean
  ) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setNumber: number) => void;
  /** Auto-fill today's checklist when an exercise is completed in training mode. */
  autoCompleteExerciseFromTraining: (exerciseId: string) => void;
  getChecklistForDate: (dateKey: string) => DailyChecklist | null;
  hydrateFromServer: (data: {
    weeklyRoutines: WeeklyRoutines;
    dailyChecklists: Record<string, DailyChecklist>;
  }) => void;
  resetForLogout: () => void;
}

function createEmptyWeeklyRoutines(): WeeklyRoutines {
  return { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
}

function buildChecklistFromRoutine(
  routine: DayRoutine,
  dateKey: string
): DailyChecklist {
  return {
    date: dateKey,
    dayOfWeek: routine.dayOfWeek,
    routineName: routine.name,
    exercises: routine.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      completed: false,
      sets: Array.from({ length: ex.targetSets }, (_, i) => ({
        setNumber: i + 1,
        reps: 0,
        completed: false,
      })),
    })),
    allComplete: false,
  };
}

function recomputeAllComplete(checklist: DailyChecklist): DailyChecklist {
  const allComplete = checklist.exercises.every((e) => e.completed);
  return {
    ...checklist,
    allComplete,
    completedAt: allComplete ? new Date().toISOString() : undefined,
  };
}

function saveChecklist(
  set: (
    partial:
      | Partial<RoutineState>
      | ((state: RoutineState) => Partial<RoutineState>)
  ) => void,
  get: () => RoutineState,
  dateKey: string,
  checklist: DailyChecklist,
  previousAllComplete: boolean
) {
  set((state) => ({
    dailyChecklists: {
      ...state.dailyChecklists,
      [dateKey]: checklist,
    },
  }));
  syncChecklist(checklist);

  if (checklist.allComplete) {
    recordCaloriesForCompletedChecklist(get, checklist);
  }
}

function recordCaloriesForCompletedChecklist(
  get: () => RoutineState,
  checklist: DailyChecklist
) {
  const routine = get().weeklyRoutines[checklist.dayOfWeek];
  const exercises = checklist.exercises.map((entry) => {
    const slot = routine?.exercises.find(
      (e) => e.exerciseId === entry.exerciseId
    );
    return {
      exerciseId: entry.exerciseId,
      targetSets: slot?.targetSets ?? Math.max(1, entry.sets.length),
      targetReps: slot?.targetReps ?? "12",
      loggedSets: entry.sets.map((s) => ({
        reps: s.reps,
        completed: s.completed,
        weightKg: s.weightKg ?? null,
      })),
    };
  });

  const userWeight = useUserStore.getState().user?.weightKg;
  const guestWeight = loadGuestBodyProfile().weightKg;

  useWorkoutStore.getState().recordChecklistCalories({
    dateKey: checklist.date,
    routineName: checklist.routineName,
    exercises,
    weightKg: userWeight ?? guestWeight,
  });
}

function syncChecklist(checklist: DailyChecklist) {
  syncChecklistIfAuthenticated(checklist);
}

export const useRoutineStore = create<RoutineState>()((set, get) => ({
  weeklyRoutines: createEmptyWeeklyRoutines(),
  dailyChecklists: {},
  _hasHydrated: false,
  setHasHydrated: (value) => set({ _hasHydrated: value }),

  hydrateFromServer: (data) => {
    set({
      weeklyRoutines: data.weeklyRoutines,
      dailyChecklists: data.dailyChecklists,
      _hasHydrated: true,
    });
  },

  resetForLogout: () => {
    set({
      weeklyRoutines: createEmptyWeeklyRoutines(),
      dailyChecklists: {},
      _hasHydrated: true,
    });
  },

  getDayRoutine: (dayOfWeek) => get().weeklyRoutines[dayOfWeek] ?? null,

  setDayRoutine: (routine) => {
    set((state) => ({
      weeklyRoutines: {
        ...state.weeklyRoutines,
        [routine.dayOfWeek]: routine,
      },
    }));
    syncDayRoutineIfAuthenticated(routine);
  },

  clearDayRoutine: (dayOfWeek) => {
    set((state) => ({
      weeklyRoutines: {
        ...state.weeklyRoutines,
        [dayOfWeek]: null,
      },
    }));
    clearDayRoutineIfAuthenticated(dayOfWeek);
  },

  addExerciseToDay: (dayOfWeek, exercise) => {
    const existing = get().weeklyRoutines[dayOfWeek];
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const routine: DayRoutine = existing ?? {
      dayOfWeek,
      name: `${dayNames[dayOfWeek]} Routine`,
      exercises: [],
      updatedAt: new Date().toISOString(),
    };

    if (routine.exercises.some((e) => e.exerciseId === exercise.exerciseId)) {
      return;
    }

    get().setDayRoutine({
      ...routine,
      exercises: [
        ...routine.exercises,
        { ...exercise, order: routine.exercises.length },
      ],
      updatedAt: new Date().toISOString(),
    });
  },

  removeExerciseFromDay: (dayOfWeek, exerciseId) => {
    const routine = get().weeklyRoutines[dayOfWeek];
    if (!routine) return;

    const exercises = routine.exercises
      .filter((e) => e.exerciseId !== exerciseId)
      .map((e, i) => ({ ...e, order: i }));

    if (exercises.length === 0) {
      get().clearDayRoutine(dayOfWeek);
      return;
    }

    get().setDayRoutine({
      ...routine,
      exercises,
      updatedAt: new Date().toISOString(),
    });
  },

  updateRoutineExercise: (dayOfWeek, exerciseId, updates) => {
    const routine = get().weeklyRoutines[dayOfWeek];
    if (!routine) return;

    get().setDayRoutine({
      ...routine,
      exercises: routine.exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, ...updates } : e
      ),
      updatedAt: new Date().toISOString(),
    });
  },

  reorderExercise: (dayOfWeek, exerciseId, direction) => {
    const routine = get().weeklyRoutines[dayOfWeek];
    if (!routine) return;

    const idx = routine.exercises.findIndex((e) => e.exerciseId === exerciseId);
    if (idx === -1) return;

    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= routine.exercises.length) return;

    const exercises = [...routine.exercises];
    [exercises[idx], exercises[newIdx]] = [exercises[newIdx], exercises[idx]];

    get().setDayRoutine({
      ...routine,
      exercises: exercises.map((e, i) => ({ ...e, order: i })),
      updatedAt: new Date().toISOString(),
    });
  },

  getChecklistForDate: (dateKey) => get().dailyChecklists[dateKey] ?? null,

  getTodayChecklist: () => get().dailyChecklists[toDateKey()] ?? null,

  getOrCreateTodayChecklist: () => {
    const dateKey = toDateKey();
    const existing = get().dailyChecklists[dateKey];
    if (existing) return existing;

    const dayOfWeek = getTodayDayOfWeek();
    const routine = get().weeklyRoutines[dayOfWeek];
    if (!routine || routine.exercises.length === 0) return null;

    const checklist = buildChecklistFromRoutine(routine, dateKey);
    saveChecklist(set, get, dateKey, checklist, false);
    return checklist;
  },

  toggleExerciseComplete: (exerciseId, completed) => {
    const dateKey = toDateKey();
    const checklist = get().dailyChecklists[dateKey];
    if (!checklist) return;

    const previousAllComplete = checklist.allComplete;
    const updated = recomputeAllComplete({
      ...checklist,
      exercises: checklist.exercises.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              completed,
              completedAt: completed ? new Date().toISOString() : undefined,
            }
          : e
      ),
    });

    saveChecklist(set, get, dateKey, updated, previousAllComplete);
  },

  logSetReps: (exerciseId, setNumber, reps, weightKg) => {
    const dateKey = toDateKey();
    let checklist: DailyChecklist | null =
      get().dailyChecklists[dateKey] ?? null;
    if (!checklist) {
      checklist = get().getOrCreateTodayChecklist();
    }
    if (!checklist) return;

    const previousAllComplete = checklist.allComplete;
    let setJustCompleted = false;
    const updated = recomputeAllComplete({
      ...checklist,
      exercises: checklist.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;

        const sets = e.sets.map((s) => {
          if (s.setNumber !== setNumber) return s;
          const completed = reps > 0;
          if (completed && !s.completed) setJustCompleted = true;
          const nextWeight =
            weightKg !== undefined ? weightKg : s.weightKg ?? null;
          return {
            ...s,
            reps,
            completed,
            weightKg: nextWeight,
          };
        });
        const allSetsDone = sets.every((s) => s.completed);
        const logged = sets.find((s) => s.setNumber === setNumber);

        if (logged?.completed && logged.weightKg && logged.reps > 0) {
          considerPersonalRecord({
            exerciseId,
            weightKg: logged.weightKg,
            reps: logged.reps,
            sourceDate: dateKey,
          });
        }

        return {
          ...e,
          sets,
          completed: allSetsDone,
          completedAt: allSetsDone ? new Date().toISOString() : undefined,
        };
      }),
    });

    saveChecklist(set, get, dateKey, updated, previousAllComplete);
    maybeStartRest(setJustCompleted);
  },

  logSetWeight: (exerciseId, setNumber, weightKg) => {
    const dateKey = toDateKey();
    let checklist: DailyChecklist | null =
      get().dailyChecklists[dateKey] ?? null;
    if (!checklist) {
      checklist = get().getOrCreateTodayChecklist();
    }
    if (!checklist) return;

    const previousAllComplete = checklist.allComplete;
    const updated = recomputeAllComplete({
      ...checklist,
      exercises: checklist.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;

        const sets = e.sets.map((s) => {
          if (s.setNumber !== setNumber) return s;
          const next = { ...s, weightKg };
          if (next.completed && next.weightKg && next.reps > 0) {
            considerPersonalRecord({
              exerciseId,
              weightKg: next.weightKg,
              reps: next.reps,
              sourceDate: dateKey,
            });
          }
          return next;
        });

        return { ...e, sets };
      }),
    });

    saveChecklist(set, get, dateKey, updated, previousAllComplete);
  },

  completeSet: (exerciseId, setNumber, completed = true) => {
    const dateKey = toDateKey();
    let checklist: DailyChecklist | null =
      get().dailyChecklists[dateKey] ?? null;
    if (!checklist) {
      checklist = get().getOrCreateTodayChecklist();
    }
    if (!checklist) return;

    const previousAllComplete = checklist.allComplete;
    let setJustCompleted = false;
    const updated = recomputeAllComplete({
      ...checklist,
      exercises: checklist.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;

        const sets = e.sets.map((s) => {
          if (s.setNumber !== setNumber) return s;
          if (completed && !s.completed) setJustCompleted = true;
          return { ...s, completed };
        });
        const allSetsDone = sets.every((s) => s.completed);

        return {
          ...e,
          sets,
          completed: allSetsDone,
          completedAt: allSetsDone ? new Date().toISOString() : undefined,
        };
      }),
    });

    saveChecklist(set, get, dateKey, updated, previousAllComplete);
    maybeStartRest(setJustCompleted);
  },

  autoCompleteExerciseFromTraining: (exerciseId) => {
    const dateKey = toDateKey();
    let checklist: DailyChecklist | null =
      get().dailyChecklists[dateKey] ?? null;
    if (!checklist) {
      checklist = get().getOrCreateTodayChecklist();
    }
    if (!checklist) return;

    const routine = get().weeklyRoutines[checklist.dayOfWeek];
    const slot = routine?.exercises.find((e) => e.exerciseId === exerciseId);
    const exercise = getExerciseById(exerciseId);

    const targetReps =
      slot?.targetReps ??
      exercise?.reps ??
      exercise?.duration ??
      "12";
    const targetSets = Math.max(
      1,
      slot?.targetSets ?? exercise?.sets ?? 3
    );
    const timeBased =
      inferTargetMode(targetReps, exercise?.duration) === "time";
    const defaultReps = timeBased ? 0 : parseDefaultRepsFromTarget(targetReps);

    const previousAllComplete = checklist.allComplete;
    const hasEntry = checklist.exercises.some(
      (e) => e.exerciseId === exerciseId
    );

    const exercises = hasEntry
      ? checklist.exercises.map((entry) => {
          if (entry.exerciseId !== exerciseId) return entry;

          const sets = Array.from({ length: targetSets }, (_, i) => ({
            setNumber: i + 1,
            reps: defaultReps,
            completed: true,
            weightKg: entry.sets[i]?.weightKg ?? null,
          }));

          return {
            ...entry,
            sets,
            completed: true,
            completedAt: new Date().toISOString(),
          };
        })
      : [
          ...checklist.exercises,
          {
            exerciseId,
            completed: true,
            completedAt: new Date().toISOString(),
            sets: Array.from({ length: targetSets }, (_, i) => ({
              setNumber: i + 1,
              reps: defaultReps,
              completed: true,
              weightKg: null,
            })),
          },
        ];

    const updated = recomputeAllComplete({
      ...checklist,
      exercises,
    });

    saveChecklist(set, get, dateKey, updated, previousAllComplete);
  },

  addSet: (exerciseId) => {
    const dateKey = toDateKey();
    const checklist = get().dailyChecklists[dateKey];
    if (!checklist) return;

    const updated: DailyChecklist = {
      ...checklist,
      exercises: checklist.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const nextNum = e.sets.length + 1;
        return {
          ...e,
          sets: [
            ...e.sets,
            { setNumber: nextNum, reps: 0, completed: false, weightKg: null },
          ],
        };
      }),
    };

    saveChecklist(set, get, dateKey, updated, checklist.allComplete);
  },

  removeSet: (exerciseId, setNumber) => {
    const dateKey = toDateKey();
    const checklist = get().dailyChecklists[dateKey];
    if (!checklist) return;

    const previousAllComplete = checklist.allComplete;
    const updated = recomputeAllComplete({
      ...checklist,
      exercises: checklist.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const sets = e.sets
          .filter((s) => s.setNumber !== setNumber)
          .map((s, i) => ({ ...s, setNumber: i + 1 }));
        return { ...e, sets, completed: false, completedAt: undefined };
      }),
    });

    saveChecklist(set, get, dateKey, updated, previousAllComplete);
  },
}));

export function resolveTodayRoutine(
  weeklyRoutines: WeeklyRoutines
): DayRoutine | null {
  const dayOfWeek = getTodayDayOfWeek();
  return weeklyRoutines[dayOfWeek] ?? null;
}
