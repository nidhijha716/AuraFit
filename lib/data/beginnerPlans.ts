import type { DayRoutine, RoutineExercise } from "@/lib/types";

export type PlanKind =
  | "beginner-week1"
  | "beginner-ppl"
  | "intermediate-ppl"
  | "advanced-ppl";

export interface PlanSlotExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
}

export interface PlanDayTemplate {
  key:
    | "full_body_a"
    | "full_body_b"
    | "active_recovery"
    | "push"
    | "pull"
    | "legs"
    | "push_int"
    | "pull_int"
    | "legs_int"
    | "push_adv"
    | "pull_adv"
    | "legs_adv";
  name: string;
  why: string;
  exercises: PlanSlotExercise[];
}

/** Short full-body A — form first, gym-machine friendly. */
export const FULL_BODY_A: PlanDayTemplate = {
  key: "full_body_a",
  name: "Full Body A",
  why: "Hits legs, push, pull, and core in one short session so you practice every pattern.",
  exercises: [
    { exerciseId: "Bodyweight_Squat", targetSets: 3, targetReps: "10" },
    { exerciseId: "Incline_Push-Up", targetSets: 3, targetReps: "8" },
    { exerciseId: "Bent_Over_Two-Dumbbell_Row", targetSets: 3, targetReps: "10" },
    { exerciseId: "Butt_Lift_Bridge", targetSets: 3, targetReps: "12" },
    { exerciseId: "Plank", targetSets: 3, targetReps: "30 sec" },
  ],
};

/** Alternating full-body B — different push/pull/legs emphasis. */
export const FULL_BODY_B: PlanDayTemplate = {
  key: "full_body_b",
  name: "Full Body B",
  why: "Slightly different moves so you build variety without learning a complex split yet.",
  exercises: [
    { exerciseId: "Goblet_Squat", targetSets: 3, targetReps: "10" },
    { exerciseId: "Pushups", targetSets: 3, targetReps: "8" },
    { exerciseId: "Seated_Cable_Rows", targetSets: 3, targetReps: "10" },
    { exerciseId: "Leg_Press", targetSets: 3, targetReps: "12" },
    { exerciseId: "Crunches", targetSets: 3, targetReps: "12" },
  ],
};

/** Easy active day — optional when someone wants 4+ days. */
export const ACTIVE_RECOVERY: PlanDayTemplate = {
  key: "active_recovery",
  name: "Easy Cardio + Core",
  why: "Light movement helps recovery and habit without stacking hard lifting days.",
  exercises: [
    { exerciseId: "Walking_Treadmill", targetSets: 1, targetReps: "20 min" },
    { exerciseId: "Plank", targetSets: 2, targetReps: "30 sec" },
    { exerciseId: "Crunches", targetSets: 2, targetReps: "12" },
  ],
};

export const PUSH_DAY: PlanDayTemplate = {
  key: "push",
  name: "Push Day",
  why: "Chest, shoulders, and triceps — a classic next step after full-body weeks.",
  exercises: [
    { exerciseId: "Pushups", targetSets: 3, targetReps: "10" },
    { exerciseId: "Incline_Push-Up", targetSets: 3, targetReps: "10" },
    { exerciseId: "Dumbbell_Shoulder_Press", targetSets: 3, targetReps: "10" },
    { exerciseId: "Standing_Calf_Raises", targetSets: 3, targetReps: "12" },
    { exerciseId: "Crunches", targetSets: 3, targetReps: "12" },
  ],
};

export const PULL_DAY: PlanDayTemplate = {
  key: "pull",
  name: "Pull Day",
  why: "Back and arms — balances all the pushing you did on push day.",
  exercises: [
    { exerciseId: "Seated_Cable_Rows", targetSets: 3, targetReps: "10" },
    { exerciseId: "Wide-Grip_Lat_Pulldown", targetSets: 3, targetReps: "10" },
    { exerciseId: "Bent_Over_Two-Dumbbell_Row", targetSets: 3, targetReps: "10" },
    { exerciseId: "Face_Pull", targetSets: 3, targetReps: "12" },
    { exerciseId: "Plank", targetSets: 3, targetReps: "30 sec" },
  ],
};

export const LEGS_DAY: PlanDayTemplate = {
  key: "legs",
  name: "Leg Day",
  why: "Quads, glutes, and calves — strongest base for the rest of your training.",
  exercises: [
    { exerciseId: "Bodyweight_Squat", targetSets: 3, targetReps: "12" },
    { exerciseId: "Leg_Press", targetSets: 3, targetReps: "12" },
    { exerciseId: "Butt_Lift_Bridge", targetSets: 3, targetReps: "12" },
    { exerciseId: "Standing_Calf_Raises", targetSets: 3, targetReps: "15" },
    { exerciseId: "Crunches", targetSets: 2, targetReps: "15" },
  ],
};

/** Intermediate PPL — more volume, still accessible machines/dumbbells. */
export const INT_PUSH: PlanDayTemplate = {
  key: "push_int",
  name: "Push (Intermediate)",
  why: "Extra volume on chest and shoulders so you keep progressing past beginner loads.",
  exercises: [
    { exerciseId: "Pushups", targetSets: 4, targetReps: "12" },
    { exerciseId: "Dumbbell_Shoulder_Press", targetSets: 4, targetReps: "10" },
    { exerciseId: "Incline_Push-Up", targetSets: 3, targetReps: "12" },
    { exerciseId: "Standing_Calf_Raises", targetSets: 3, targetReps: "15" },
    { exerciseId: "Crunches", targetSets: 3, targetReps: "15" },
  ],
};

export const INT_PULL: PlanDayTemplate = {
  key: "pull_int",
  name: "Pull (Intermediate)",
  why: "More rowing and pulldown work to build a stronger back.",
  exercises: [
    { exerciseId: "Seated_Cable_Rows", targetSets: 4, targetReps: "10" },
    { exerciseId: "Wide-Grip_Lat_Pulldown", targetSets: 4, targetReps: "10" },
    { exerciseId: "Bent_Over_Two-Dumbbell_Row", targetSets: 3, targetReps: "12" },
    { exerciseId: "Face_Pull", targetSets: 3, targetReps: "15" },
    { exerciseId: "Plank", targetSets: 3, targetReps: "45 sec" },
  ],
};

export const INT_LEGS: PlanDayTemplate = {
  key: "legs_int",
  name: "Legs (Intermediate)",
  why: "Higher effort on squat pattern and press so legs keep up with upper body.",
  exercises: [
    { exerciseId: "Goblet_Squat", targetSets: 4, targetReps: "10" },
    { exerciseId: "Leg_Press", targetSets: 4, targetReps: "12" },
    { exerciseId: "Romanian_Deadlift", targetSets: 3, targetReps: "10" },
    { exerciseId: "Butt_Lift_Bridge", targetSets: 3, targetReps: "15" },
    { exerciseId: "Standing_Calf_Raises", targetSets: 4, targetReps: "15" },
  ],
};

/** Advanced PPL — denser sessions. */
export const ADV_PUSH: PlanDayTemplate = {
  key: "push_adv",
  name: "Push (Advanced)",
  why: "Dense pressing work with little fluff — for experienced trainees.",
  exercises: [
    { exerciseId: "Pushups", targetSets: 5, targetReps: "15" },
    { exerciseId: "Dumbbell_Shoulder_Press", targetSets: 4, targetReps: "12" },
    { exerciseId: "Incline_Push-Up", targetSets: 4, targetReps: "12" },
    { exerciseId: "Standing_Calf_Raises", targetSets: 4, targetReps: "20" },
    { exerciseId: "Crunches", targetSets: 4, targetReps: "20" },
  ],
};

export const ADV_PULL: PlanDayTemplate = {
  key: "pull_adv",
  name: "Pull (Advanced)",
  why: "Heavy-ish pulling volume — rows and pulldowns stacked.",
  exercises: [
    { exerciseId: "Seated_Cable_Rows", targetSets: 5, targetReps: "10" },
    { exerciseId: "Wide-Grip_Lat_Pulldown", targetSets: 4, targetReps: "12" },
    { exerciseId: "Bent_Over_Two-Dumbbell_Row", targetSets: 4, targetReps: "10" },
    { exerciseId: "Face_Pull", targetSets: 4, targetReps: "15" },
    { exerciseId: "Plank", targetSets: 4, targetReps: "60 sec" },
  ],
};

export const ADV_LEGS: PlanDayTemplate = {
  key: "legs_adv",
  name: "Legs (Advanced)",
  why: "Hard lower-body day — squat, hinge, press, and calves.",
  exercises: [
    { exerciseId: "Goblet_Squat", targetSets: 5, targetReps: "10" },
    { exerciseId: "Romanian_Deadlift", targetSets: 4, targetReps: "8" },
    { exerciseId: "Leg_Press", targetSets: 4, targetReps: "12" },
    { exerciseId: "Lying_Leg_Curls", targetSets: 3, targetReps: "12" },
    { exerciseId: "Standing_Calf_Raises", targetSets: 5, targetReps: "15" },
  ],
};

function toRoutineExercises(slots: PlanSlotExercise[]): Omit<RoutineExercise, "order">[] {
  return slots.map((s) => ({
    exerciseId: s.exerciseId,
    targetSets: s.targetSets,
    targetReps: s.targetReps,
  }));
}

export function templateToDayRoutine(
  dayOfWeek: number,
  template: PlanDayTemplate
): DayRoutine {
  return {
    dayOfWeek,
    name: template.name,
    exercises: toRoutineExercises(template.exercises).map((e, i) => ({
      ...e,
      order: i,
    })),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Map chosen training days onto Week-1 templates.
 * Rotation: A → B → A → … ; if 4+ days, insert one active recovery mid-week.
 */
export function buildBeginnerWeek1Routines(
  workoutDays: number[]
): DayRoutine[] {
  const days = [...new Set(workoutDays)]
    .filter((d) => d >= 0 && d <= 6)
    .sort((a, b) => a - b);

  if (days.length === 0) return [];

  const useRecovery = days.length >= 4;
  const recoveryIndex = useRecovery ? Math.floor(days.length / 2) : -1;

  let abToggle = 0;
  return days.map((dayOfWeek, i) => {
    if (i === recoveryIndex) {
      return templateToDayRoutine(dayOfWeek, ACTIVE_RECOVERY);
    }
    const template = abToggle % 2 === 0 ? FULL_BODY_A : FULL_BODY_B;
    abToggle += 1;
    return templateToDayRoutine(dayOfWeek, template);
  });
}

/** Classic PPL mapped onto chosen days (repeats if >3 days). */
export function buildBeginnerPplRoutines(workoutDays: number[]): DayRoutine[] {
  return buildPplCycle(workoutDays, [PUSH_DAY, PULL_DAY, LEGS_DAY]);
}

export function buildIntermediatePplRoutines(
  workoutDays: number[]
): DayRoutine[] {
  return buildPplCycle(workoutDays, [INT_PUSH, INT_PULL, INT_LEGS]);
}

export function buildAdvancedPplRoutines(workoutDays: number[]): DayRoutine[] {
  return buildPplCycle(workoutDays, [ADV_PUSH, ADV_PULL, ADV_LEGS]);
}

function buildPplCycle(
  workoutDays: number[],
  cycle: PlanDayTemplate[]
): DayRoutine[] {
  const days = [...new Set(workoutDays)]
    .filter((d) => d >= 0 && d <= 6)
    .sort((a, b) => a - b);
  if (days.length === 0) return [];

  return days.map((dayOfWeek, i) =>
    templateToDayRoutine(dayOfWeek, cycle[i % cycle.length])
  );
}

export function findTemplateWhy(routineName: string): string | null {
  const all = [
    FULL_BODY_A,
    FULL_BODY_B,
    ACTIVE_RECOVERY,
    PUSH_DAY,
    PULL_DAY,
    LEGS_DAY,
    INT_PUSH,
    INT_PULL,
    INT_LEGS,
    ADV_PUSH,
    ADV_PULL,
    ADV_LEGS,
  ];
  return all.find((t) => t.name === routineName)?.why ?? null;
}
