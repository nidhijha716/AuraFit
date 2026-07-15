import idMigration from "@/lib/data/exerciseIdMigration.json";

/** Demo videos for training mode — Mixkit free license */
const LEGACY_VIDEOS: Record<string, string> = {
  "ex-1":
    "https://assets.mixkit.co/videos/preview/mixkit-man-doing-push-ups-in-a-gym-4228-large.mp4",
  "ex-2":
    "https://assets.mixkit.co/videos/preview/mixkit-man-lifting-dumbbells-in-a-gym-4226-large.mp4",
  "ex-6":
    "https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-in-a-gym-4225-large.mp4",
  "ex-11":
    "https://assets.mixkit.co/videos/preview/mixkit-young-woman-doing-squats-4229-large.mp4",
  "ex-14":
    "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-lunges-with-dumbbells-4230-large.mp4",
  "ex-19":
    "https://assets.mixkit.co/videos/preview/mixkit-man-lifting-dumbbells-in-a-gym-4226-large.mp4",
  "ex-23":
    "https://assets.mixkit.co/videos/preview/mixkit-man-doing-bicep-curls-with-dumbbells-4231-large.mp4",
  "ex-28":
    "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-plank-exercise-4232-large.mp4",
  "ex-33":
    "https://assets.mixkit.co/videos/preview/mixkit-man-doing-burpees-in-a-gym-4233-large.mp4",
  "ex-36":
    "https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-4224-large.mp4",
  "ex-35":
    "https://assets.mixkit.co/videos/preview/mixkit-man-doing-kettlebell-swings-4234-large.mp4",
};

/** Includes both legacy ex-* keys and migrated free-exercise-db IDs */
export const EXERCISE_VIDEOS: Record<string, string> = { ...LEGACY_VIDEOS };

for (const [legacyId, newId] of Object.entries(idMigration)) {
  const video = LEGACY_VIDEOS[legacyId];
  if (video && !EXERCISE_VIDEOS[newId]) {
    EXERCISE_VIDEOS[newId] = video;
  }
}
