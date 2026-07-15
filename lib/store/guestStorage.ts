import type {
  DailyChecklist,
  WeeklyRoutines,
  WorkoutSession,
} from "@/lib/types";

const GUEST_STORAGE_KEY = "aurafit-guest-fitness";

export interface GuestFitnessData {
  weeklyRoutines: WeeklyRoutines;
  dailyChecklists: Record<string, DailyChecklist>;
  sessions: WorkoutSession[];
}

function emptyWeeklyRoutines(): WeeklyRoutines {
  return { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
}

export function emptyGuestFitnessData(): GuestFitnessData {
  return {
    weeklyRoutines: emptyWeeklyRoutines(),
    dailyChecklists: {},
    sessions: [],
  };
}

export function loadGuestFitnessData(): GuestFitnessData {
  if (typeof window === "undefined") {
    return emptyGuestFitnessData();
  }

  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return emptyGuestFitnessData();
    const parsed = JSON.parse(raw) as Partial<GuestFitnessData>;
    return {
      weeklyRoutines: parsed.weeklyRoutines ?? emptyWeeklyRoutines(),
      dailyChecklists: parsed.dailyChecklists ?? {},
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    return emptyGuestFitnessData();
  }
}

export function saveGuestFitnessData(data: GuestFitnessData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
}

export function clearGuestFitnessData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_STORAGE_KEY);
}

export function hasGuestFitnessData(): boolean {
  const data = loadGuestFitnessData();
  const hasRoutines = Object.values(data.weeklyRoutines).some(
    (r) => r !== null && r.exercises.length > 0
  );
  const hasChecklists = Object.keys(data.dailyChecklists).length > 0;
  const hasSessions = data.sessions.length > 0;
  return hasRoutines || hasChecklists || hasSessions;
}
