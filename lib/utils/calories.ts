import { getExerciseById } from "@/lib/data/exercises";
import type {
  ActivityLevel,
  FitnessGoal,
  Sex,
} from "@/lib/types";
import { toDateKey } from "@/lib/utils/dateKey";
import { isTimeTarget } from "@/lib/utils/exerciseTarget";

/** Inputs needed for daily target + workout burn estimates. */
export interface CalorieProfileInput {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goals: FitnessGoal[];
}

export const DEFAULT_WEIGHT_KG = 70;

/** Avg minutes per strength set (work + rest) when no time target is set. */
const DEFAULT_MINUTES_PER_SET = 2.5;

/** Floor minutes per exercise when only an ID list is available. */
const DEFAULT_MINUTES_PER_EXERCISE = 3;

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Approximate MET values from Compendium of Physical Activities bands.
 * @see https://pacompendium.com/
 */
const CATEGORY_MET: Record<string, number> = {
  cardio: 7.5,
  strength: 5,
  stretching: 2.8,
  plyometrics: 6.5,
  "olympic weightlifting": 6,
  strongman: 6,
  powerlifting: 5.5,
};

/** Strength/isolation METs vary by region so the exercise type matters. */
const MUSCLE_MET: Record<string, number> = {
  full_body: 5.5,
  legs: 5.2,
  back: 4.8,
  chest: 4.8,
  shoulders: 4.5,
  arms: 4.2,
  core: 3.8,
};

/** Name patterns for moves whose intensity differs from catalog category. */
const NAME_MET_RULES: { pattern: RegExp; met: number }[] = [
  {
    pattern:
      /\b(burpee|mountain climber|jumping jack|jump rope|skipping|high knee)\b/i,
    met: 8,
  },
  {
    pattern:
      /\b(run|sprint|treadmill|rowing|rower|bike|cycling|elliptical|swim)\b/i,
    met: 8,
  },
  { pattern: /\b(walk|walking|march)\b/i, met: 3.5 },
  { pattern: /\b(yoga|stretch|foam roll)\b/i, met: 2.5 },
];

const DEFAULT_MET = 4.8;

/** Optional set/rep detail used to weight time per exercise + volume intensity. */
export interface LoggedSetBurn {
  reps: number;
  completed: boolean;
  weightKg?: number | null;
}

export interface ExerciseBurnInput {
  exerciseId: string;
  targetSets?: number;
  targetReps?: string;
  /** Actual sets logged by the user (drives volume intensity when present). */
  loggedSets?: LoggedSetBurn[];
}

/**
 * Effective external load for bodyweight sets when no bar/dumbbell is logged.
 * Rough mechanical equivalent — not lab-precise.
 */
const BODYWEIGHT_LOAD_FRACTION = 0.35;

/**
 * Volume-load → kcal slope inspired by MSSE resistance EE models
 * (~2.461 kcal per 1000 kg·reps). Used inside intensity, not alone.
 * @see https://doi.org/10.1249/mss.0000000000001925
 */
const VOLUME_KCAL_PER_1000_KG_REPS = 2.461;

/** Clamp intensity so estimates stay in a sane band (~±20–45% of MET baseline). */
const INTENSITY_MIN = 0.8;
const INTENSITY_MAX = 1.45;

export function isValidAge(age: number): boolean {
  return Number.isFinite(age) && age >= 13 && age <= 100 && Number.isInteger(age);
}

export function hasCompleteCalorieProfile(
  input: Partial<CalorieProfileInput> | null | undefined
): input is CalorieProfileInput {
  if (!input) return false;
  return (
    isValidAge(input.age ?? NaN) &&
    input.sex != null &&
    typeof input.heightCm === "number" &&
    input.heightCm >= 100 &&
    input.heightCm <= 250 &&
    typeof input.weightKg === "number" &&
    input.weightKg >= 30 &&
    input.weightKg <= 300 &&
    input.activityLevel != null &&
    Array.isArray(input.goals)
  );
}

/**
 * Mifflin–St Jeor BMR (kcal/day).
 * @see https://reference.medscape.com/calculator/846/mifflin-st-jeor-equation
 */
export function estimateBmr(input: {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
}): number {
  const base =
    10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  // Prefer-not-to-say uses the female offset as a conservative middle estimate.
  const offset = input.sex === "male" ? 5 : -161;
  return Math.round(base + offset);
}

function goalMultiplier(goals: FitnessGoal[]): number {
  if (goals.includes("lose_weight")) return 0.85;
  if (goals.includes("build_muscle")) return 1.1;
  return 1;
}

/**
 * Estimated daily calorie target = TDEE adjusted for primary fitness goal.
 * Always present as an estimate in the UI.
 */
export function estimateDailyCalorieTarget(
  input: CalorieProfileInput
): number {
  const bmr = estimateBmr(input);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];
  return Math.max(1200, Math.round(tdee * goalMultiplier(input.goals)));
}

/**
 * Resolve MET for a specific exercise (name → category → muscle group).
 * Strength uses muscle-group METs so legs vs arms are not treated equally.
 */
export function getMetForExerciseId(exerciseId: string): number {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return DEFAULT_MET;

  const name = exercise.name ?? "";
  for (const rule of NAME_MET_RULES) {
    if (rule.pattern.test(name)) return rule.met;
  }

  const categoryKey = exercise.category?.toLowerCase().trim();

  // Cardio / plyo / stretch / lifting styles: Compendium category bands.
  if (
    categoryKey &&
    categoryKey !== "strength" &&
    CATEGORY_MET[categoryKey] != null
  ) {
    return CATEGORY_MET[categoryKey];
  }

  // Strength (and most catalog moves): include which muscle the exercise hits.
  if (exercise.muscleGroup && MUSCLE_MET[exercise.muscleGroup] != null) {
    return MUSCLE_MET[exercise.muscleGroup];
  }

  if (categoryKey && CATEGORY_MET[categoryKey] != null) {
    return CATEGORY_MET[categoryKey];
  }

  return DEFAULT_MET;
}

/**
 * Relative minutes for one exercise (time targets or sets × default set length).
 * Uses logged completed sets when present; otherwise routine/catalog targets.
 */
export function estimateExerciseShareMinutes(
  item: ExerciseBurnInput
): number {
  const exercise = getExerciseById(item.exerciseId);
  const loggedCompleted =
    item.loggedSets?.filter((s) => s.completed) ?? [];

  const sets =
    loggedCompleted.length > 0
      ? loggedCompleted.length
      : Math.max(1, item.targetSets ?? exercise?.sets ?? 1);

  const repsTarget = item.targetReps ?? exercise?.reps ?? "10";
  const perSet = parseDurationTargetToMinutes(repsTarget);
  if (perSet != null) return Math.max(1 / 60, perSet * sets);

  // Slightly stretch share when average logged reps are high vs a 12-rep baseline.
  if (loggedCompleted.length > 0) {
    const avgReps =
      loggedCompleted.reduce((sum, s) => sum + Math.max(0, s.reps), 0) /
      loggedCompleted.length;
    const repFactor = Math.min(1.35, Math.max(0.75, avgReps / 12));
    return Math.max(
      DEFAULT_MINUTES_PER_SET,
      sets * DEFAULT_MINUTES_PER_SET * repFactor
    );
  }

  return Math.max(DEFAULT_MINUTES_PER_SET, sets * DEFAULT_MINUTES_PER_SET);
}

/**
 * Total volume-load (kg·reps) from logged sets.
 * Weighted sets use logged kg; bodyweight completions use a fraction of body mass.
 */
export function computeSessionVolumeLoadKg(
  exercises: ExerciseBurnInput[],
  bodyKg: number
): { volumeLoadKg: number; hasLoggedVolume: boolean; hasWeightedSets: boolean } {
  let volumeLoadKg = 0;
  let hasLoggedVolume = false;
  let hasWeightedSets = false;

  for (const item of exercises) {
    const completed = item.loggedSets?.filter((s) => s.completed) ?? [];
    if (completed.length === 0) continue;
    hasLoggedVolume = true;

    for (const set of completed) {
      const reps = Math.max(0, set.reps);
      if (reps <= 0 && !(set.weightKg != null && set.weightKg > 0)) {
        // Time-based "done" with no reps — count as one bodyweight-equivalent bout.
        volumeLoadKg += bodyKg * BODYWEIGHT_LOAD_FRACTION;
        continue;
      }
      if (set.weightKg != null && set.weightKg > 0) {
        hasWeightedSets = true;
        volumeLoadKg += reps * set.weightKg;
      } else {
        volumeLoadKg += reps * bodyKg * BODYWEIGHT_LOAD_FRACTION;
      }
    }
  }

  return { volumeLoadKg, hasLoggedVolume, hasWeightedSets };
}

/**
 * Intensity multiplier from lifting volume + relative load.
 * Heavy / higher-rep sessions > light / low-volume; clamped for safety.
 */
export function computeVolumeIntensityMultiplier(options: {
  baseKcal: number;
  volumeLoadKg: number;
  bodyKg: number;
  durationMinutes: number;
  hasLoggedVolume: boolean;
  hasWeightedSets: boolean;
  exercises: ExerciseBurnInput[];
}): number {
  if (!options.hasLoggedVolume || options.volumeLoadKg <= 0) {
    return 1;
  }

  const duration = Math.max(1, options.durationMinutes);
  const volumePerMin = options.volumeLoadKg / duration;
  // ~80 kg·reps/min ≈ moderate; 250+ ≈ dense/heavy.
  const densityFactor = 0.85 + volumePerMin / 500;

  let relativeLoadFactor = 1;
  if (options.hasWeightedSets && options.bodyKg > 0) {
    let loadSum = 0;
    let loadCount = 0;
    for (const item of options.exercises) {
      for (const set of item.loggedSets ?? []) {
        if (!set.completed || set.weightKg == null || set.weightKg <= 0) continue;
        loadSum += set.weightKg / options.bodyKg;
        loadCount += 1;
      }
    }
    if (loadCount > 0) {
      const avgRel = loadSum / loadCount;
      // 0.25 BW ≈ light accessory, 0.8+ ≈ harder compounds.
      relativeLoadFactor = 0.85 + avgRel * 0.55;
    }
  }

  let setVolumeFactor = 1;
  let planned = 0;
  let actual = 0;
  for (const item of options.exercises) {
    const completed = item.loggedSets?.filter((s) => s.completed).length ?? 0;
    if (completed === 0) continue;
    actual += completed;
    planned += Math.max(1, item.targetSets ?? completed);
  }
  if (planned > 0 && actual > 0) {
    setVolumeFactor = Math.min(1.35, Math.max(0.75, actual / planned));
  }

  // Soft blend of MSSE-style volume kcal into the multiplier (keeps absolute burn grounded).
  const volumeKcal =
    VOLUME_KCAL_PER_1000_KG_REPS * (options.volumeLoadKg / 1000);
  const volumeBlend =
    1 + 0.35 * (volumeKcal / Math.max(options.baseKcal, 1));

  const raw =
    0.4 * densityFactor +
    0.35 * relativeLoadFactor +
    0.15 * setVolumeFactor +
    0.1 * volumeBlend;

  return Math.min(INTENSITY_MAX, Math.max(INTENSITY_MIN, raw));
}

/** Parse stored targets like "30 sec" / "10 min" into minutes. */
export function parseDurationTargetToMinutes(
  value: string | undefined | null
): number | null {
  if (!value?.trim() || !isTimeTarget(value)) return null;
  const v = value.trim().toLowerCase();
  const sec = v.match(/^(\d+(?:\.\d+)?)\s*(sec|secs|second|seconds)\b/);
  if (sec) return Math.max(1 / 60, parseFloat(sec[1]) / 60);
  const min = v.match(/^(\d+(?:\.\d+)?)\s*(min|mins|minute|minutes)\b/);
  if (min) return Math.max(1 / 60, parseFloat(min[1]));
  return null;
}

export function estimateRoutineDurationMinutes(
  items: {
    targetSets: number;
    targetReps: string;
    loggedSets?: LoggedSetBurn[];
  }[]
): number {
  if (items.length === 0) return DEFAULT_MINUTES_PER_EXERCISE;

  let total = 0;
  for (const item of items) {
    total += estimateExerciseShareMinutes({
      exerciseId: "",
      targetSets: item.targetSets,
      targetReps: item.targetReps,
      loggedSets: item.loggedSets,
    });
  }

  return Math.max(1, Math.round(total));
}

/**
 * Prefer real clock time when the user took longer; use a volume-based floor
 * when they blast through the UI in under a minute.
 */
export function resolveEffectiveWorkoutMinutes(options: {
  wallClockMinutes: number;
  exerciseCount: number;
  routineEstimateMinutes?: number;
}): number {
  const clock = Math.max(
    1,
    Math.round(
      Number.isFinite(options.wallClockMinutes) ? options.wallClockMinutes : 1
    )
  );
  const floor =
    options.routineEstimateMinutes != null &&
    options.routineEstimateMinutes > 0
      ? Math.round(options.routineEstimateMinutes)
      : Math.max(1, options.exerciseCount * DEFAULT_MINUTES_PER_EXERCISE);
  return Math.max(clock, floor);
}

export function resolveWeightKgForBurn(
  explicit?: number | null
): number {
  if (typeof explicit === "number" && explicit > 0) return explicit;
  return DEFAULT_WEIGHT_KG;
}

/**
 * Estimate workout burn using per-exercise MET × body weight × time share,
 * then scale by logged volume intensity (sets × reps × load) when available.
 *
 * Base: kcal_i ≈ MET_i × kg × hours_i  (ACSM / Compendium)
 * Intensity: heavier load / more volume → higher multiplier (clamped).
 *
 * @see https://pacompendium.com/
 * @see https://doi.org/10.1249/mss.0000000000001925
 */
export function estimateWorkoutCaloriesBurned(options: {
  durationMinutes: number;
  exerciseIds: string[];
  /** When provided, set/rep detail weights each exercise's time share + volume. */
  exercises?: ExerciseBurnInput[];
  weightKg?: number | null;
}): number {
  const weight = resolveWeightKgForBurn(options.weightKg);
  const totalMinutes = Math.max(1, options.durationMinutes);
  const hoursTotal = totalMinutes / 60;

  const burnItems: ExerciseBurnInput[] =
    options.exercises && options.exercises.length > 0
      ? options.exercises
      : options.exerciseIds.map((id) => ({ exerciseId: id }));

  if (burnItems.length === 0) {
    return Math.max(1, Math.round(DEFAULT_MET * weight * hoursTotal));
  }

  const contributions = burnItems.map((item) => ({
    met: getMetForExerciseId(item.exerciseId),
    share: estimateExerciseShareMinutes(item),
  }));

  const shareSum =
    contributions.reduce((sum, c) => sum + c.share, 0) || contributions.length;

  let baseKcal = 0;
  for (const c of contributions) {
    const minutes_i = (c.share / shareSum) * totalMinutes;
    baseKcal += c.met * weight * (minutes_i / 60);
  }

  const { volumeLoadKg, hasLoggedVolume, hasWeightedSets } =
    computeSessionVolumeLoadKg(burnItems, weight);

  const intensity = computeVolumeIntensityMultiplier({
    baseKcal,
    volumeLoadKg,
    bodyKg: weight,
    durationMinutes: totalMinutes,
    hasLoggedVolume,
    hasWeightedSets,
    exercises: burnItems,
  });

  return Math.max(1, Math.round(baseKcal * intensity));
}

export function checklistSessionWorkoutId(dateKey: string): string {
  return `checklist-${dateKey}`;
}

export function sumCaloriesBurnedToday(
  sessions: { completedAt: string; estimatedCaloriesBurned?: number }[],
  todayKey: string = toDateKey()
): number {
  return sessions.reduce((sum, session) => {
    const key = toDateKey(new Date(session.completedAt));
    if (key !== todayKey) return sum;
    return sum + (session.estimatedCaloriesBurned ?? 0);
  }, 0);
}
