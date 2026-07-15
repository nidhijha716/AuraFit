import type { Exercise, MuscleGroup } from "@/lib/types";
import exercisesData from "@/lib/data/exercises.json";
import idMigrationData from "@/lib/data/exerciseIdMigration.json";
import { EXERCISE_VIDEOS } from "@/lib/data/exerciseVideos";

const LEGACY_ID_MAP: Record<string, string> = idMigrationData;

/** All exercises from free-exercise-db (873+) */
export const allExercises: Exercise[] = exercisesData as Exercise[];

/** @deprecated Use allExercises — kept for backwards compatibility */
export const mockExercises = allExercises;

const exerciseById = new Map(allExercises.map((e) => [e.id, e]));

/** Resolve legacy ex-* IDs to free-exercise-db IDs */
export function migrateExerciseId(id: string): string {
  return LEGACY_ID_MAP[id] ?? id;
}

export function getExerciseById(id: string): Exercise | undefined {
  const normalizedId = migrateExerciseId(id);
  const exercise = exerciseById.get(normalizedId);
  if (!exercise) return undefined;

  const videoUrl =
    exercise.videoUrl ?? EXERCISE_VIDEOS[id] ?? EXERCISE_VIDEOS[normalizedId];

  return videoUrl ? { ...exercise, videoUrl } : exercise;
}

export function getExercisesByIds(ids: string[]): Exercise[] {
  return ids
    .map((id) => getExerciseById(id))
    .filter((e): e is Exercise => e !== undefined);
}

export function searchExercises(options: {
  search?: string;
  muscleGroup?: MuscleGroup | "all";
  excludeIds?: Set<string>;
  limit?: number;
  offset?: number;
}): { items: Exercise[]; total: number } {
  const {
    search = "",
    muscleGroup = "all",
    excludeIds,
    limit,
    offset = 0,
  } = options;

  const query = search.trim().toLowerCase();

  let results = allExercises;

  if (query) {
    results = results.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.equipment.toLowerCase().includes(query) ||
        ex.primaryMuscles?.some((m) => m.toLowerCase().includes(query))
    );
  }

  if (muscleGroup !== "all") {
    results = results.filter((ex) => ex.muscleGroup === muscleGroup);
  }

  if (excludeIds?.size) {
    results = results.filter((ex) => !excludeIds.has(ex.id));
  }

  const total = results.length;
  const items =
    limit !== undefined
      ? results.slice(offset, offset + limit)
      : results.slice(offset);

  return { items, total };
}

export function getRelatedExercises(
  exercise: Exercise,
  limit = 3
): Exercise[] {
  return allExercises
    .filter(
      (e) =>
        e.id !== exercise.id &&
        (e.muscleGroup === exercise.muscleGroup ||
          e.primaryMuscles?.some((m) =>
            exercise.primaryMuscles?.includes(m)
          ))
    )
    .slice(0, limit);
}
