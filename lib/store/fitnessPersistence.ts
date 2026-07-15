import { apiFetch } from "@/lib/api/client";
import type { DayRoutine, WorkoutSession } from "@/lib/types";
import {
  clearGuestBodyProfile,
  loadGuestBodyProfile,
} from "@/lib/store/guestBodyProfile";
import {
  clearGuestFitnessData,
  hasGuestFitnessData,
  loadGuestFitnessData,
  saveGuestFitnessData,
  type GuestFitnessData,
} from "@/lib/store/guestStorage";
import { useRoutineStore } from "@/lib/store/routineStore";
import { useUserStore } from "@/lib/store/userStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { computeProgressFromSessions } from "@/lib/store/workoutProgress";

export function isAuthenticatedUser(): boolean {
  return useUserStore.getState().isAuthenticated;
}

export function snapshotGuestFitnessData(): GuestFitnessData {
  const routineState = useRoutineStore.getState();
  const workoutState = useWorkoutStore.getState();
  return {
    weeklyRoutines: routineState.weeklyRoutines,
    dailyChecklists: routineState.dailyChecklists,
    sessions: workoutState.sessions,
  };
}

export function persistGuestFitnessData(): void {
  if (isAuthenticatedUser()) return;
  saveGuestFitnessData(snapshotGuestFitnessData());
}

export function loadGuestModeFitnessData(): void {
  const guest = loadGuestFitnessData();
  useRoutineStore.getState().hydrateFromServer({
    weeklyRoutines: guest.weeklyRoutines,
    dailyChecklists: guest.dailyChecklists,
  });
  useWorkoutStore.getState().hydrateFromServer({
    sessions: guest.sessions,
    progress: computeProgressFromSessions(guest.sessions),
  });
  // Ensure in-progress training survives refresh for guests.
  useWorkoutStore.getState().setHasHydrated(true);
}

export function enterGuestMode(): void {
  loadGuestModeFitnessData();
}

export async function migrateGuestDataToAccount(): Promise<void> {
  if (!isAuthenticatedUser()) return;
  if (!hasGuestFitnessData()) {
    clearGuestFitnessData();
    return;
  }

  const guest = loadGuestFitnessData();
  const routineDays = Object.entries(guest.weeklyRoutines).filter(
    ([, routine]) => routine !== null && routine.exercises.length > 0
  );

  await Promise.all(
    routineDays.map(([, routine]) =>
      apiFetch(`/api/routines/${routine!.dayOfWeek}`, {
        method: "PUT",
        body: JSON.stringify(routine),
      })
    )
  );

  await Promise.all(
    Object.values(guest.dailyChecklists).map((checklist) =>
      apiFetch(`/api/checklists/${checklist.date}`, {
        method: "PUT",
        body: JSON.stringify(checklist),
      })
    )
  );

  await Promise.all(
    guest.sessions.map((session) =>
      apiFetch("/api/workouts/sessions", {
        method: "POST",
        body: JSON.stringify({
          workoutId: session.workoutId,
          workoutName: session.workoutName,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          durationMinutes: session.durationMinutes,
          exercisesCompleted: session.exercisesCompleted,
          estimatedCaloriesBurned: session.estimatedCaloriesBurned,
        }),
      })
    )
  );

  const guestBody = loadGuestBodyProfile();
  const user = useUserStore.getState().user;
  if (
    guestBody.age ||
    guestBody.heightCm ||
    guestBody.weightKg ||
    guestBody.sex ||
    guestBody.activityLevel
  ) {
    await apiFetch("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({
        ...(user?.age == null && guestBody.age != null
          ? { age: guestBody.age }
          : {}),
        ...(user?.heightCm == null && guestBody.heightCm != null
          ? { heightCm: guestBody.heightCm }
          : {}),
        ...(user?.weightKg == null && guestBody.weightKg != null
          ? { weightKg: guestBody.weightKg }
          : {}),
        ...(user?.sex == null && guestBody.sex != null
          ? { sex: guestBody.sex }
          : {}),
        ...(user?.activityLevel == null && guestBody.activityLevel != null
          ? { activityLevel: guestBody.activityLevel }
          : {}),
      }),
    }).catch(console.error);

    try {
      const refreshed = await apiFetch<{ user: import("@/lib/types").UserProfile }>(
        "/api/auth/me"
      );
      useUserStore.setState({ user: refreshed.user });
    } catch {
      /* keep migrated fields if refresh fails */
    }
  }

  clearGuestFitnessData();
  clearGuestBodyProfile();
}

export function syncDayRoutineIfAuthenticated(routine: DayRoutine): void {
  if (!isAuthenticatedUser()) {
    persistGuestFitnessData();
    return;
  }
  void apiFetch(`/api/routines/${routine.dayOfWeek}`, {
    method: "PUT",
    body: JSON.stringify(routine),
  }).catch(console.error);
}

export function clearDayRoutineIfAuthenticated(dayOfWeek: number): void {
  if (!isAuthenticatedUser()) {
    persistGuestFitnessData();
    return;
  }
  void apiFetch(`/api/routines/${dayOfWeek}`, { method: "DELETE" }).catch(
    console.error
  );
}

export function syncChecklistIfAuthenticated(
  checklist: import("@/lib/types").DailyChecklist
): void {
  if (!isAuthenticatedUser()) {
    persistGuestFitnessData();
    return;
  }
  void apiFetch(`/api/checklists/${checklist.date}`, {
    method: "PUT",
    body: JSON.stringify(checklist),
  }).catch(console.error);
}

export function syncWorkoutSessionIfAuthenticated(session: WorkoutSession): void {
  if (!isAuthenticatedUser()) {
    persistGuestFitnessData();
    return;
  }
  void apiFetch("/api/workouts/sessions", {
    method: "POST",
    body: JSON.stringify({
      workoutId: session.workoutId,
      workoutName: session.workoutName,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      durationMinutes: session.durationMinutes,
      exercisesCompleted: session.exercisesCompleted,
      estimatedCaloriesBurned: session.estimatedCaloriesBurned,
    }),
  }).catch(console.error);
}
