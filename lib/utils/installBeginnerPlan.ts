import {
  buildAdvancedPplRoutines,
  buildBeginnerPplRoutines,
  buildBeginnerWeek1Routines,
  buildIntermediatePplRoutines,
  type PlanKind,
} from "@/lib/data/beginnerPlans";
import type { DayRoutine, ExperienceLevel, WeeklyRoutines } from "@/lib/types";

const PLAN_META_KEY = "aurafit-plan-meta";

export interface PlanMeta {
  kind: PlanKind;
  installedAt: string;
  upgradeDismissed?: boolean;
}

export function loadPlanMeta(userId?: string | null): PlanMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(planMetaKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as PlanMeta;
  } catch {
    return null;
  }
}

export function savePlanMeta(meta: PlanMeta, userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(planMetaKey(userId), JSON.stringify(meta));
}

export function clearPlanMeta(userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(planMetaKey(userId));
}

function planMetaKey(userId?: string | null): string {
  return userId ? `${PLAN_META_KEY}:${userId}` : `${PLAN_META_KEY}:guest`;
}

function applyRoutines(
  routines: DayRoutine[],
  options: {
    setDayRoutine: (routine: DayRoutine) => void;
    clearDayRoutine?: (dayOfWeek: number) => void;
    replaceAll?: boolean;
  }
): void {
  if (options.replaceAll && options.clearDayRoutine) {
    for (let d = 0; d <= 6; d++) {
      options.clearDayRoutine(d);
    }
  } else if (options.clearDayRoutine && !options.replaceAll) {
    for (let d = 0; d <= 6; d++) {
      options.clearDayRoutine(d);
    }
  }

  for (const routine of routines) {
    options.setDayRoutine(routine);
  }
}

export function installBeginnerWeek1Plan(options: {
  workoutDays: number[];
  setDayRoutine: (routine: DayRoutine) => void;
  clearDayRoutine?: (dayOfWeek: number) => void;
  existingWeekly?: WeeklyRoutines;
  replaceAll?: boolean;
  userId?: string | null;
}): DayRoutine[] {
  const routines = buildBeginnerWeek1Routines(options.workoutDays);
  if (routines.length === 0) return [];

  applyRoutines(routines, options);
  savePlanMeta(
    {
      kind: "beginner-week1",
      installedAt: new Date().toISOString(),
      upgradeDismissed: false,
    },
    options.userId
  );
  return routines;
}

export function installBeginnerPplPlan(options: {
  workoutDays: number[];
  setDayRoutine: (routine: DayRoutine) => void;
  clearDayRoutine?: (dayOfWeek: number) => void;
  userId?: string | null;
}): DayRoutine[] {
  const routines = buildBeginnerPplRoutines(options.workoutDays);
  if (routines.length === 0) return [];

  applyRoutines(routines, { ...options, replaceAll: true });
  savePlanMeta(
    {
      kind: "beginner-ppl",
      installedAt: new Date().toISOString(),
      upgradeDismissed: true,
    },
    options.userId
  );
  return routines;
}

export function installIntermediatePplPlan(options: {
  workoutDays: number[];
  setDayRoutine: (routine: DayRoutine) => void;
  clearDayRoutine?: (dayOfWeek: number) => void;
  userId?: string | null;
}): DayRoutine[] {
  const routines = buildIntermediatePplRoutines(options.workoutDays);
  if (routines.length === 0) return [];

  applyRoutines(routines, { ...options, replaceAll: true });
  savePlanMeta(
    {
      kind: "intermediate-ppl",
      installedAt: new Date().toISOString(),
      upgradeDismissed: true,
    },
    options.userId
  );
  return routines;
}

export function installAdvancedPplPlan(options: {
  workoutDays: number[];
  setDayRoutine: (routine: DayRoutine) => void;
  clearDayRoutine?: (dayOfWeek: number) => void;
  userId?: string | null;
}): DayRoutine[] {
  const routines = buildAdvancedPplRoutines(options.workoutDays);
  if (routines.length === 0) return [];

  applyRoutines(routines, { ...options, replaceAll: true });
  savePlanMeta(
    {
      kind: "advanced-ppl",
      installedAt: new Date().toISOString(),
      upgradeDismissed: true,
    },
    options.userId
  );
  return routines;
}

/** Install the default plan for an experience level (used at onboarding). */
export function installPlanForExperience(options: {
  experienceLevel: ExperienceLevel;
  workoutDays: number[];
  setDayRoutine: (routine: DayRoutine) => void;
  clearDayRoutine?: (dayOfWeek: number) => void;
  userId?: string | null;
}): DayRoutine[] {
  const shared = {
    workoutDays: options.workoutDays,
    setDayRoutine: options.setDayRoutine,
    clearDayRoutine: options.clearDayRoutine,
    userId: options.userId,
  };

  if (options.experienceLevel === "advanced") {
    return installAdvancedPplPlan(shared);
  }
  if (options.experienceLevel === "intermediate") {
    return installIntermediatePplPlan(shared);
  }
  return installBeginnerWeek1Plan({ ...shared, replaceAll: true });
}

export function daysSince(iso: string, now: Date = new Date()): number {
  const start = new Date(iso);
  const ms = now.getTime() - start.getTime();
  return Math.floor(ms / 86400000);
}

export function shouldOfferPplUpgrade(
  meta: PlanMeta | null,
  completedWorkouts: number
): boolean {
  if (!meta || meta.kind !== "beginner-week1") return false;
  if (meta.upgradeDismissed) return false;
  return completedWorkouts >= 4 || daysSince(meta.installedAt) >= 7;
}
