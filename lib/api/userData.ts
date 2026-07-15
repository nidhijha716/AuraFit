import { apiFetch } from "@/lib/api/client";
import type {
  DailyChecklist,
  DayRoutine,
  UserProfile,
  WeeklyRoutines,
  WorkoutSession,
} from "@/lib/types";
import { useRoutineStore } from "@/lib/store/routineStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { computeProgressFromSessions } from "@/lib/store/workoutProgress";
import { toDateKey } from "@/lib/utils/dateKey";

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  try {
    const data = await apiFetch<{ user: UserProfile }>("/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export async function loadUserFitnessData(): Promise<void> {
  const today = toDateKey();
  const [routinesRes, sessionsRes, checklistRes] = await Promise.all([
    apiFetch<{ weeklyRoutines: WeeklyRoutines }>("/api/routines"),
    apiFetch<{ sessions: WorkoutSession[] }>("/api/workouts/sessions"),
    apiFetch<{ checklist: DailyChecklist | null }>(
      `/api/checklists/${today}`
    ).catch(() => ({ checklist: null as DailyChecklist | null })),
  ]);

  const dailyChecklists: Record<string, DailyChecklist> = {};
  if (checklistRes.checklist) {
    dailyChecklists[checklistRes.checklist.date] = checklistRes.checklist;
  }

  useRoutineStore.getState().hydrateFromServer({
    weeklyRoutines: routinesRes.weeklyRoutines,
    dailyChecklists,
  });

  useWorkoutStore.getState().hydrateFromServer({
    sessions: sessionsRes.sessions,
    progress: computeProgressFromSessions(sessionsRes.sessions),
  });
}

export function syncDayRoutine(routine: DayRoutine): void {
  void apiFetch(`/api/routines/${routine.dayOfWeek}`, {
    method: "PUT",
    body: JSON.stringify(routine),
  }).catch(console.error);
}

export function clearDayRoutineOnServer(dayOfWeek: number): void {
  void apiFetch(`/api/routines/${dayOfWeek}`, { method: "DELETE" }).catch(
    console.error
  );
}

export function syncChecklist(checklist: DailyChecklist): void {
  void apiFetch(`/api/checklists/${checklist.date}`, {
    method: "PUT",
    body: JSON.stringify(checklist),
  }).catch(console.error);
}

export function syncWorkoutSession(session: WorkoutSession): void {
  void apiFetch("/api/workouts/sessions", {
    method: "POST",
    body: JSON.stringify(session),
  }).catch(console.error);
}

export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const data = await apiFetch<{ user: UserProfile }>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return data.user;
}
