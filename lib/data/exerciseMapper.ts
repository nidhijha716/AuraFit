import type { Difficulty, MuscleGroup } from "@/lib/types";

/** Source: https://github.com/yuhonas/free-exercise-db/blob/main/schema.json */
export interface FreeExerciseDbEntry {
  id: string;
  name: string;
  force: "static" | "pull" | "push" | null;
  level: "beginner" | "intermediate" | "expert";
  mechanic: "isolation" | "compound" | null;
  equipment:
    | "medicine ball"
    | "dumbbell"
    | "body only"
    | "bands"
    | "kettlebells"
    | "foam roll"
    | "cable"
    | "machine"
    | "barbell"
    | "exercise ball"
    | "e-z curl bar"
    | "other"
    | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category:
    | "powerlifting"
    | "strength"
    | "stretching"
    | "cardio"
    | "olympic weightlifting"
    | "strongman"
    | "plyometrics";
  images: string[];
}

export const FEDB_IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const MUSCLE_MAP: Record<string, MuscleGroup> = {
  abdominals: "core",
  abductors: "legs",
  adductors: "legs",
  biceps: "arms",
  calves: "legs",
  chest: "chest",
  forearms: "arms",
  glutes: "legs",
  hamstrings: "legs",
  lats: "back",
  "lower back": "back",
  "middle back": "back",
  neck: "shoulders",
  quadriceps: "legs",
  shoulders: "shoulders",
  traps: "back",
  triceps: "arms",
};

const EQUIPMENT_LABELS: Record<string, string> = {
  "body only": "Bodyweight",
  dumbbell: "Dumbbells",
  barbell: "Barbell",
  cable: "Cable Machine",
  machine: "Machine",
  kettlebells: "Kettlebell",
  bands: "Resistance Bands",
  "e-z curl bar": "EZ Bar",
  "medicine ball": "Medicine Ball",
  "exercise ball": "Exercise Ball",
  "foam roll": "Foam Roller",
  other: "Other",
};

const CARDIO_CATEGORIES = new Set(["cardio", "stretching"]);
const FULL_BODY_CATEGORIES = new Set(["plyometrics", "strongman"]);

export function fedbImageUrl(relativePath: string): string {
  return `${FEDB_IMAGE_BASE}${relativePath}`;
}

export function mapFedbLevel(
  level: FreeExerciseDbEntry["level"]
): Difficulty {
  if (level === "expert") return "advanced";
  return level;
}

export function mapFedbEquipment(
  equipment: FreeExerciseDbEntry["equipment"]
): string {
  if (!equipment) return "None";
  return EQUIPMENT_LABELS[equipment] ?? equipment;
}

export function mapFedbMuscleGroup(entry: FreeExerciseDbEntry): MuscleGroup {
  if (CARDIO_CATEGORIES.has(entry.category)) return "full_body";
  if (FULL_BODY_CATEGORIES.has(entry.category) && entry.primaryMuscles.length > 2) {
    return "full_body";
  }

  for (const muscle of entry.primaryMuscles) {
    const mapped = MUSCLE_MAP[muscle];
    if (mapped) return mapped;
  }

  return "full_body";
}

export function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
