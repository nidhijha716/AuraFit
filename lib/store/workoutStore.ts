"use client";

import { create } from "zustand";
import { syncWorkoutSessionIfAuthenticated } from "@/lib/store/fitnessPersistence";
import { getWorkoutById } from "@/lib/data/mockWorkouts";
import { loadGuestBodyProfile } from "@/lib/store/guestBodyProfile";
import { computeProgressFromSessions } from "@/lib/store/workoutProgress";
import {
  checklistSessionWorkoutId,
  estimateRoutineDurationMinutes,
  estimateWorkoutCaloriesBurned,
  resolveEffectiveWorkoutMinutes,
  resolveWeightKgForBurn,
} from "@/lib/utils/calories";
import { toDateKey } from "@/lib/utils/dateKey";
import type {
  ActiveSession,
  MuscleGroup,
  ProgressStats,
  WorkoutSession,
} from "@/lib/types";

const ACTIVE_SESSION_KEY = "aurafit-active-session";

const emptyMuscleBreakdown: Record<MuscleGroup, number> = {
  chest: 0,
  back: 0,
  legs: 0,
  shoulders: 0,
  arms: 0,
  core: 0,
  full_body: 0,
};

const defaultProgress: ProgressStats = {
  totalWorkouts: 0,
  streak: 0,
  weeklyMinutes: 0,
  lastWorkoutDate: null,
  muscleGroupBreakdown: { ...emptyMuscleBreakdown },
};

function loadActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(ACTIVE_SESSION_KEY) ??
      sessionStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveSession;
    if (
      !parsed?.workoutId ||
      !Array.isArray(parsed.exerciseIds) ||
      typeof parsed.currentIndex !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistActiveSession(session: ActiveSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!session) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      sessionStorage.removeItem(ACTIVE_SESSION_KEY);
      return;
    }
    const payload = JSON.stringify(session);
    localStorage.setItem(ACTIVE_SESSION_KEY, payload);
    sessionStorage.setItem(ACTIVE_SESSION_KEY, payload);
  } catch {
    /* ignore quota / private mode */
  }
}

interface ChecklistCalorieInput {
  dateKey: string;
  routineName: string;
  exercises: {
    exerciseId: string;
    targetSets: number;
    targetReps: string;
    loggedSets?: {
      reps: number;
      completed: boolean;
      weightKg?: number | null;
    }[];
  }[];
  weightKg?: number | null;
}

interface WorkoutState {
  sessions: WorkoutSession[];
  activeSession: ActiveSession | null;
  progress: ProgressStats;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  hydrateFromServer: (data: {
    sessions: WorkoutSession[];
    progress: ProgressStats;
  }) => void;
  resetForLogout: () => void;
  startWorkout: (workoutId: string) => void;
  startCustomWorkout: (name: string, exerciseIds: string[]) => void;
  completeExercise: () => boolean;
  finishWorkout: (options?: {
    weightKg?: number | null;
    exercises?: {
      exerciseId: string;
      targetSets?: number;
      targetReps?: string;
      loggedSets?: {
        reps: number;
        completed: boolean;
        weightKg?: number | null;
      }[];
    }[];
  }) => WorkoutSession | null;
  /** Log estimated burn when the daily checklist is fully completed. */
  recordChecklistCalories: (
    input: ChecklistCalorieInput
  ) => WorkoutSession | null;
  cancelWorkout: () => void;
  getSessionsThisWeek: () => WorkoutSession[];
}

function resolveBurnWeight(explicit?: number | null): number {
  return resolveWeightKgForBurn(
    explicit ?? loadGuestBodyProfile().weightKg
  );
}

function commitSession(
  set: (
    partial:
      | Partial<WorkoutState>
      | ((state: WorkoutState) => Partial<WorkoutState>)
  ) => void,
  get: () => WorkoutState,
  newSession: WorkoutSession,
  replaceWorkoutIds?: string[],
  sync = true
): WorkoutSession {
  const removeIds = new Set(replaceWorkoutIds ?? []);
  const previous = get().sessions.filter(
    (s) => !removeIds.has(s.workoutId) && s.id !== newSession.id
  );
  const allSessions = [newSession, ...previous];
  const progress = computeProgressFromSessions(allSessions);

  set({
    sessions: allSessions,
    progress,
  });

  if (sync) {
    syncWorkoutSessionIfAuthenticated(newSession);
  }
  return newSession;
}

function assignActiveSession(
  set: (
    partial:
      | Partial<WorkoutState>
      | ((state: WorkoutState) => Partial<WorkoutState>)
  ) => void,
  session: ActiveSession | null
) {
  persistActiveSession(session);
  set({ activeSession: session });
}

export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
  sessions: [],
  activeSession: null,
  progress: defaultProgress,
  _hasHydrated: false,
  setHasHydrated: (value) => {
    if (value) {
      const saved = loadActiveSession();
      set((state) => ({
        _hasHydrated: true,
        activeSession: state.activeSession ?? saved,
      }));
      return;
    }
    set({ _hasHydrated: false });
  },

  hydrateFromServer: (data) => {
    const saved = loadActiveSession();
    set((state) => ({
      sessions: data.sessions,
      progress: data.progress,
      activeSession: state.activeSession ?? saved,
      _hasHydrated: true,
    }));
  },

  resetForLogout: () => {
    persistActiveSession(null);
    set({
      sessions: [],
      activeSession: null,
      progress: defaultProgress,
      _hasHydrated: true,
    });
  },

  startWorkout: (workoutId) => {
    const existing = get().activeSession ?? loadActiveSession();
    // Resume after refresh — do not reset progress or create a duplicate.
    if (
      existing &&
      !existing.isCustom &&
      existing.workoutId === workoutId &&
      existing.currentIndex < existing.exerciseIds.length
    ) {
      if (get().activeSession !== existing) {
        assignActiveSession(set, existing);
      }
      return;
    }

    const workout = getWorkoutById(workoutId);
    if (!workout || workout.exerciseIds.length === 0) {
      console.error(
        `[AuraFit] startWorkout: unknown or empty workout "${workoutId}"`
      );
      return;
    }

    assignActiveSession(set, {
      workoutId: workout.id,
      workoutName: workout.name,
      exerciseIds: workout.exerciseIds,
      currentIndex: 0,
      completedExerciseIds: [],
      startedAt: new Date().toISOString(),
      isCustom: false,
    });
  },

  startCustomWorkout: (name, exerciseIds) => {
    if (exerciseIds.length === 0) return;

    const existing = get().activeSession ?? loadActiveSession();
    if (
      existing?.isCustom &&
      existing.currentIndex < existing.exerciseIds.length &&
      existing.exerciseIds.length === exerciseIds.length &&
      existing.exerciseIds.every((id, i) => id === exerciseIds[i])
    ) {
      if (get().activeSession !== existing) {
        assignActiveSession(set, existing);
      }
      return;
    }

    assignActiveSession(set, {
      workoutId: `custom-${Date.now()}`,
      workoutName: name,
      exerciseIds,
      currentIndex: 0,
      completedExerciseIds: [],
      startedAt: new Date().toISOString(),
      isCustom: true,
    });
  },

  completeExercise: () => {
    const session = get().activeSession;
    if (!session) return false;

    const currentExerciseId = session.exerciseIds[session.currentIndex];
    const newCompleted = [...session.completedExerciseIds, currentExerciseId];
    const nextIndex = session.currentIndex + 1;
    const isLast = nextIndex >= session.exerciseIds.length;

    assignActiveSession(set, {
      ...session,
      completedExerciseIds: newCompleted,
      currentIndex: nextIndex,
    });

    return isLast;
  },

  finishWorkout: (options) => {
    const session = get().activeSession;
    if (!session) return null;

    const startedAt = new Date(session.startedAt);
    const completedAt = new Date();
    const wallClockMinutes =
      (completedAt.getTime() - startedAt.getTime()) / 60000;

    const durationMinutes = resolveEffectiveWorkoutMinutes({
      wallClockMinutes,
      exerciseCount:
        session.completedExerciseIds.length || session.exerciseIds.length,
    });

    const weightKg = resolveBurnWeight(options?.weightKg);
    const estimatedCaloriesBurned = estimateWorkoutCaloriesBurned({
      durationMinutes,
      exerciseIds: session.completedExerciseIds,
      exercises: options?.exercises,
      weightKg,
    });

    const todayKey = toDateKey(completedAt);
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      workoutId: session.workoutId,
      workoutName: session.workoutName,
      startedAt: session.startedAt,
      completedAt: completedAt.toISOString(),
      durationMinutes,
      exercisesCompleted: session.completedExerciseIds,
      estimatedCaloriesBurned,
    };

    assignActiveSession(set, null);
    return commitSession(set, get, newSession, [
      checklistSessionWorkoutId(todayKey),
    ]);
  },

  recordChecklistCalories: (input) => {
    if (input.exercises.length === 0) return null;

    const workoutId = checklistSessionWorkoutId(input.dateKey);
    const alreadyHasRealSession = get().sessions.some((s) => {
      if (toDateKey(new Date(s.completedAt)) !== input.dateKey) return false;
      if (s.workoutId === workoutId) return false;
      return (s.estimatedCaloriesBurned ?? 0) > 0;
    });
    if (alreadyHasRealSession) return null;

    const exerciseIds = input.exercises.map((e) => e.exerciseId);
    const durationMinutes = estimateRoutineDurationMinutes(input.exercises);
    const weightKg = resolveBurnWeight(input.weightKg);
    const estimatedCaloriesBurned = estimateWorkoutCaloriesBurned({
      durationMinutes,
      exerciseIds,
      exercises: input.exercises,
      weightKg,
    });

    const existing = get().sessions.find((s) => s.workoutId === workoutId);
    const completedAt = new Date().toISOString();
    const newSession: WorkoutSession = {
      id: existing?.id ?? `session-checklist-${Date.now()}`,
      workoutId,
      workoutName: input.routineName,
      startedAt: existing?.startedAt ?? completedAt,
      completedAt,
      durationMinutes,
      exercisesCompleted: exerciseIds,
      estimatedCaloriesBurned,
    };

    return commitSession(set, get, newSession, [workoutId], !existing);
  },

  cancelWorkout: () => {
    assignActiveSession(set, null);
  },

  getSessionsThisWeek: () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return get().sessions.filter(
      (s) => new Date(s.completedAt) >= weekStart
    );
  },
}));
