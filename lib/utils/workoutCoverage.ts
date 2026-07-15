import type { Exercise, MuscleGroup } from "@/lib/types";
import {
  DETAILED_MUSCLE_LABELS,
  detailedMusclesFromExercise,
  type DetailedMuscle,
} from "@/lib/utils/detailedMuscles";

const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "full_body",
];

const PRIMARY_WEIGHT = 1;
const SECONDARY_WEIGHT = 0.45;

export function getWorkoutCoverage(exercises: Exercise[]) {
  const muscleCounts: Partial<Record<MuscleGroup, number>> = {};
  const detailedCounts: Partial<Record<DetailedMuscle, number>> = {};
  const equipment = new Set<string>();

  for (const ex of exercises) {
    muscleCounts[ex.muscleGroup] = (muscleCounts[ex.muscleGroup] ?? 0) + 1;
    equipment.add(ex.equipment);

    const { primary, secondary } = detailedMusclesFromExercise(ex);
    for (const m of primary) {
      detailedCounts[m] = (detailedCounts[m] ?? 0) + PRIMARY_WEIGHT;
    }
    for (const m of secondary) {
      detailedCounts[m] = (detailedCounts[m] ?? 0) + SECONDARY_WEIGHT;
    }
  }

  const activeGroups = Object.keys(muscleCounts) as MuscleGroup[];
  const coverage = Math.round(
    (activeGroups.length / ALL_MUSCLE_GROUPS.length) * 100
  );

  const maxCount = Math.max(1, ...Object.values(muscleCounts));
  const intensity: Partial<Record<MuscleGroup, number>> = {};
  for (const [group, count] of Object.entries(muscleCounts)) {
    intensity[group as MuscleGroup] = count / maxCount;
  }

  const maxDetailed = Math.max(1, ...Object.values(detailedCounts), 0.001);
  const detailedIntensity: Partial<Record<DetailedMuscle, number>> = {};
  for (const [muscle, score] of Object.entries(detailedCounts)) {
    detailedIntensity[muscle as DetailedMuscle] = score / maxDetailed;
  }

  const detailedList = (
    Object.entries(detailedCounts) as [DetailedMuscle, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({
      id,
      label: DETAILED_MUSCLE_LABELS[id],
      score,
    }));

  return {
    coverage,
    muscleGroupsHit: activeGroups.length,
    muscleCounts,
    intensity,
    detailedCounts,
    detailedIntensity,
    detailedList,
    detailedMusclesHit: detailedList.length,
    equipment: Array.from(equipment).sort(),
    totalExercises: exercises.length,
  };
}

/** Intensity map for a single exercise (primary = full, secondary softer). */
export function getExerciseDetailedIntensity(
  exercise: Exercise
): Partial<Record<DetailedMuscle, number>> {
  const { primary, secondary } = detailedMusclesFromExercise(exercise);
  const intensity: Partial<Record<DetailedMuscle, number>> = {};
  for (const m of primary) intensity[m] = 1;
  for (const m of secondary) {
    if (intensity[m] == null) intensity[m] = 0.45;
  }
  return intensity;
}
