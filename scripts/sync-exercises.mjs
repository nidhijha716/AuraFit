/**
 * Downloads free-exercise-db and generates AuraFit exercise data.
 * Source: https://github.com/yuhonas/free-exercise-db
 * License: Unlicense (public domain)
 */
import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FEDB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const MUSCLE_MAP = {
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

const EQUIPMENT_LABELS = {
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

const LEGACY_ID_MAP = {
  "ex-1": "Pushups",
  "ex-2": "Dumbbell_Bench_Press",
  "ex-3": "Barbell_Bench_Press_-_Medium_Grip",
  "ex-4": "Incline_Dumbbell_Press",
  "ex-5": "Flat_Bench_Cable_Flyes",
  "ex-6": "Pullups",
  "ex-7": "Close-Grip_Front_Lat_Pulldown",
  "ex-8": "Bent_Over_Barbell_Row",
  "ex-9": "Seated_Cable_Rows",
  "ex-10": "Barbell_Deadlift",
  "ex-11": "Bodyweight_Squat",
  "ex-12": "Barbell_Squat",
  "ex-13": "Romanian_Deadlift",
  "ex-14": "Barbell_Walking_Lunge",
  "ex-15": "Leg_Press",
  "ex-16": "Lying_Leg_Curls",
  "ex-17": "Standing_Calf_Raises",
  "ex-18": "Barbell_Hip_Thrust",
  "ex-19": "Barbell_Shoulder_Press",
  "ex-20": "Side_Lateral_Raise",
  "ex-21": "Face_Pull",
  "ex-22": "Barbell_Shrug",
  "ex-23": "Barbell_Curl",
  "ex-24": "Hammer_Curls",
  "ex-25": "Dips_-_Triceps_Version",
  "ex-26": "Triceps_Pushdown",
  "ex-27": "EZ-Bar_Skullcrusher",
  "ex-28": "Plank",
  "ex-29": "Cross-Body_Crunch",
  "ex-30": "Hanging_Leg_Raise",
  "ex-31": "Russian_Twist",
  "ex-32": "Dead_Bug",
  "ex-33": "Drop_Push",
  "ex-34": "Mountain_Climbers",
  "ex-35": "One-Arm_Kettlebell_Swings",
  "ex-36": "Jogging_Treadmill",
  "ex-37": "Bicycling_Stationary",
  "ex-38": "Rope_Jumping",
  "ex-39": "Rowing_Stationary",
  "ex-40": "Dumbbell_Step_Ups",
  "ex-41": "Goblet_Squat",
  "ex-42": "Farmers_Walk",
};

/** @deprecated Used only to validate explicit legacy mappings exist */
const LEGACY_NAMES = {
  "ex-1": "Push-ups",
  "ex-2": "Dumbbell Bench Press",
  "ex-3": "Barbell Bench Press",
  "ex-4": "Incline Dumbbell Press",
  "ex-5": "Cable Chest Fly",
  "ex-6": "Pull-ups",
  "ex-7": "Lat Pulldown",
  "ex-8": "Bent-over Barbell Row",
  "ex-9": "Seated Cable Row",
  "ex-10": "Conventional Deadlift",
  "ex-11": "Squats",
  "ex-12": "Barbell Back Squat",
  "ex-13": "Romanian Deadlift",
  "ex-14": "Walking Lunges",
  "ex-15": "Leg Press",
  "ex-16": "Leg Curl",
  "ex-17": "Calf Raises",
  "ex-18": "Hip Thrust",
  "ex-19": "Overhead Press",
  "ex-20": "Lateral Raises",
  "ex-21": "Face Pull",
  "ex-22": "Barbell Shrugs",
  "ex-23": "Bicep Curls",
  "ex-24": "Hammer Curls",
  "ex-25": "Tricep Dips",
  "ex-26": "Tricep Pushdown",
  "ex-27": "Skull Crushers",
  "ex-28": "Plank",
  "ex-29": "Bicycle Crunches",
  "ex-30": "Hanging Leg Raise",
  "ex-31": "Russian Twist",
  "ex-32": "Dead Bug",
  "ex-33": "Burpees",
  "ex-34": "Mountain Climbers",
  "ex-35": "Kettlebell Swing",
  "ex-36": "Treadmill Jog",
  "ex-37": "Stationary Bike",
  "ex-38": "Jump Rope",
  "ex-39": "Rowing Machine",
  "ex-40": "Box Step-ups",
  "ex-41": "Goblet Squat",
  "ex-42": "Farmer's Walk",
};

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mapLevel(level) {
  if (level === "expert") return "advanced";
  return level;
}

function mapEquipment(equipment) {
  if (!equipment) return "None";
  return EQUIPMENT_LABELS[equipment] ?? equipment;
}

function mapMuscleGroup(entry) {
  if (CARDIO_CATEGORIES.has(entry.category)) return "full_body";
  if (entry.category === "plyometrics" && entry.primaryMuscles.length > 2) {
    return "full_body";
  }
  for (const muscle of entry.primaryMuscles) {
    if (MUSCLE_MAP[muscle]) return MUSCLE_MAP[muscle];
  }
  return "full_body";
}

function defaultPrescription(entry) {
  if (entry.category === "cardio") {
    return { duration: "20 min" };
  }
  if (entry.category === "stretching") {
    return { duration: "30 sec" };
  }
  return { sets: 3, reps: "8-12" };
}

function transformEntry(entry) {
  const images = (entry.images ?? []).map((p) => `${IMAGE_BASE}${p}`);
  const prescription = defaultPrescription(entry);

  return {
    id: entry.id,
    name: entry.name,
    muscleGroup: mapMuscleGroup(entry),
    equipment: mapEquipment(entry.equipment),
    instructions: entry.instructions ?? [],
    thumbnail: images[0] ?? "",
    images,
    level: mapLevel(entry.level),
    category: entry.category,
    primaryMuscles: entry.primaryMuscles ?? [],
    secondaryMuscles: entry.secondaryMuscles ?? [],
    force: entry.force,
    mechanic: entry.mechanic,
    ...prescription,
  };
}

function findBestMatch(legacyName, entries, byName) {
  const normalized = normalizeName(legacyName);
  if (byName.has(normalized)) return byName.get(normalized);

  let best = null;
  let bestScore = 0;
  for (const entry of entries) {
    const candidate = normalizeName(entry.name);
    if (candidate.includes(normalized) || normalized.includes(candidate)) {
      const score = Math.min(candidate.length, normalized.length);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
  }
  return best;
}

async function main() {
  console.log("Fetching free-exercise-db...");
  const res = await fetch(FEDB_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const raw = await res.json();
  console.log(`Loaded ${raw.length} exercises`);

  const exercises = raw.map(transformEntry).filter((e) => e.thumbnail);

  const byName = new Map();
  for (const entry of raw) {
    byName.set(normalizeName(entry.name), entry);
  }

  const idMigration = {};
  for (const [legacyId, fedbId] of Object.entries(LEGACY_ID_MAP)) {
    const exists = raw.some((e) => e.id === fedbId);
    if (exists) {
      idMigration[legacyId] = fedbId;
      const legacyName = LEGACY_NAMES[legacyId] ?? legacyId;
      console.log(`  ${legacyId} (${legacyName}) -> ${fedbId}`);
    } else {
      console.warn(`  Missing fedb id for ${legacyId}: ${fedbId}`);
    }
  }

  const outDir = join(ROOT, "lib", "data");
  writeFileSync(
    join(outDir, "exercises.json"),
    JSON.stringify(exercises, null, 0)
  );
  writeFileSync(
    join(outDir, "exerciseIdMigration.json"),
    JSON.stringify(idMigration, null, 2)
  );

  console.log(`Wrote ${exercises.length} exercises to lib/data/exercises.json`);
  console.log(
    `Wrote ${Object.keys(idMigration).length} legacy ID mappings`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
