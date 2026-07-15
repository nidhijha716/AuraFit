import type { Exercise } from "@/lib/types";

/**
 * Fine-grained fatigue-map targets (free-exercise-db muscles + upper chest heuristic).
 */
export type DetailedMuscle =
  | "upper_chest"
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abdominals"
  | "lats"
  | "traps"
  | "middle_back"
  | "lower_back"
  | "neck"
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abductors"
  | "adductors";

export const DETAILED_MUSCLE_LABELS: Record<DetailedMuscle, string> = {
  upper_chest: "Upper chest",
  chest: "Chest",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  abdominals: "Abs",
  lats: "Lats",
  traps: "Traps",
  middle_back: "Middle back",
  lower_back: "Lower back",
  neck: "Neck",
  quadriceps: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  abductors: "Abductors",
  adductors: "Adductors",
};

const FEDB_TO_DETAILED: Record<string, DetailedMuscle> = {
  abdominals: "abdominals",
  abductors: "abductors",
  adductors: "adductors",
  biceps: "biceps",
  calves: "calves",
  chest: "chest",
  forearms: "forearms",
  glutes: "glutes",
  hamstrings: "hamstrings",
  lats: "lats",
  "lower back": "lower_back",
  "middle back": "middle_back",
  neck: "neck",
  quadriceps: "quadriceps",
  shoulders: "shoulders",
  traps: "traps",
  triceps: "triceps",
};

/** Incline / upper-focus moves → upper_chest instead of flat chest. */
const UPPER_CHEST_NAME =
  /\b(incline|upper[- ]?chest|clavicular|low[- ]to[- ]high|reverse[- ]grip\s+bench)\b/i;

export function resolveDetailedMuscle(
  fedbName: string,
  exerciseName?: string
): DetailedMuscle | null {
  const key = fedbName.trim().toLowerCase();
  const mapped = FEDB_TO_DETAILED[key];
  if (!mapped) return null;
  if (
    mapped === "chest" &&
    exerciseName &&
    UPPER_CHEST_NAME.test(exerciseName)
  ) {
    return "upper_chest";
  }
  return mapped;
}

export function detailedMusclesFromExercise(exercise: Exercise): {
  primary: DetailedMuscle[];
  secondary: DetailedMuscle[];
} {
  const primary: DetailedMuscle[] = [];
  const secondary: DetailedMuscle[] = [];
  const seen = new Set<DetailedMuscle>();

  for (const raw of exercise.primaryMuscles ?? []) {
    const m = resolveDetailedMuscle(raw, exercise.name);
    if (m && !seen.has(m)) {
      seen.add(m);
      primary.push(m);
    }
  }

  for (const raw of exercise.secondaryMuscles ?? []) {
    const m = resolveDetailedMuscle(raw, exercise.name);
    if (m && !seen.has(m)) {
      seen.add(m);
      secondary.push(m);
    }
  }

  // Fallback when catalog has only coarse muscleGroup.
  if (primary.length === 0) {
    const fallback = coarseGroupToDetailed(exercise.muscleGroup);
    for (const m of fallback) {
      if (!seen.has(m)) {
        seen.add(m);
        primary.push(m);
      }
    }
  }

  return { primary, secondary };
}

function coarseGroupToDetailed(
  group: Exercise["muscleGroup"]
): DetailedMuscle[] {
  switch (group) {
    case "chest":
      return ["chest"];
    case "back":
      return ["lats", "middle_back"];
    case "legs":
      return ["quadriceps", "hamstrings", "glutes"];
    case "shoulders":
      return ["shoulders"];
    case "arms":
      return ["biceps", "triceps"];
    case "core":
      return ["abdominals"];
    case "full_body":
      return ["chest", "quadriceps", "shoulders"];
    default:
      return [];
  }
}
