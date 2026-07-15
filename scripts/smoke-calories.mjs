/**
 * Smoke tests for calorie + duration helpers (no test runner required).
 * Run: node scripts/smoke-calories.mjs
 */
import assert from "node:assert/strict";

// Inline mirrors of key logic so we don't need TS loader in CI smoke.
function isTimeTarget(value) {
  if (!value?.trim()) return false;
  return /\b(sec|secs|second|seconds|min|mins|minute|minutes)\b/i.test(
    value.trim()
  );
}

function parseDurationTargetToMinutes(value) {
  if (!value?.trim() || !isTimeTarget(value)) return null;
  const v = value.trim().toLowerCase();
  const sec = v.match(/^(\d+(?:\.\d+)?)\s*(sec|secs|second|seconds)\b/);
  if (sec) return Math.max(1 / 60, parseFloat(sec[1]) / 60);
  const min = v.match(/^(\d+(?:\.\d+)?)\s*(min|mins|minute|minutes)\b/);
  if (min) return Math.max(1 / 60, parseFloat(min[1]));
  return null;
}

function estimateRoutineDurationMinutes(items) {
  if (items.length === 0) return 3;
  let total = 0;
  for (const item of items) {
    const sets = Math.max(1, item.targetSets || 1);
    const perSet = parseDurationTargetToMinutes(item.targetReps);
    if (perSet != null) total += perSet * sets;
    else total += sets * 2.5;
  }
  return Math.max(1, Math.round(total));
}

function resolveEffectiveWorkoutMinutes({
  wallClockMinutes,
  exerciseCount,
  routineEstimateMinutes,
}) {
  const clock = Math.max(1, Math.round(wallClockMinutes || 1));
  const floor =
    routineEstimateMinutes > 0
      ? Math.round(routineEstimateMinutes)
      : Math.max(1, exerciseCount * 3);
  return Math.max(clock, floor);
}

function estimateWorkoutCaloriesBurned({
  durationMinutes,
  mets,
  shares,
  weightKg = 70,
  intensity = 1,
}) {
  const totalMinutes = Math.max(1, durationMinutes);
  const shareSum = shares.reduce((a, b) => a + b, 0) || mets.length;
  let kcal = 0;
  for (let i = 0; i < mets.length; i++) {
    const minutes_i = (shares[i] / shareSum) * totalMinutes;
    kcal += mets[i] * weightKg * (minutes_i / 60);
  }
  return Math.max(1, Math.round(kcal * intensity));
}

function volumeIntensity({
  baseKcal,
  volumeLoadKg,
  bodyKg,
  durationMinutes,
  avgRelativeLoad,
}) {
  if (volumeLoadKg <= 0) return 1;
  const densityFactor = 0.85 + volumeLoadKg / Math.max(1, durationMinutes) / 500;
  const relativeLoadFactor =
    avgRelativeLoad > 0 ? 0.85 + avgRelativeLoad * 0.55 : 1;
  const volumeKcal = 2.461 * (volumeLoadKg / 1000);
  const volumeBlend = 1 + 0.35 * (volumeKcal / Math.max(baseKcal, 1));
  const raw =
    0.4 * densityFactor + 0.35 * relativeLoadFactor + 0.15 * 1 + 0.1 * volumeBlend;
  return Math.min(1.45, Math.max(0.8, raw));
}

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("AuraFit smoke — duration & calories\n");

test("30 min treadmill alone ≈ 30 min", () => {
  assert.equal(
    estimateRoutineDurationMinutes([
      { targetSets: 1, targetReps: "30 min" },
    ]),
    30
  );
});

test("treadmill 30 min + 3 strength sets ≈ 38 min", () => {
  // 30 + 3*2.5 = 37.5 → 38
  assert.equal(
    estimateRoutineDurationMinutes([
      { targetSets: 1, targetReps: "30 min" },
      { targetSets: 3, targetReps: "12" },
    ]),
    38
  );
});

test("old formula length*5 is NOT used (2 exercises ≠ 10 forced)", () => {
  const mins = estimateRoutineDurationMinutes([
    { targetSets: 1, targetReps: "30 min" },
    { targetSets: 3, targetReps: "10" },
  ]);
  assert.notEqual(mins, 10);
  assert.ok(mins >= 30);
});

test("rushing UI still uses volume floor", () => {
  assert.equal(
    resolveEffectiveWorkoutMinutes({
      wallClockMinutes: 1,
      exerciseCount: 5,
    }),
    15
  );
});

test("real long workout uses clock time", () => {
  assert.equal(
    resolveEffectiveWorkoutMinutes({
      wallClockMinutes: 45,
      exerciseCount: 5,
    }),
    45
  );
});

test("burn estimate for 30 min cardio-ish is realistic (>50 kcal)", () => {
  const kcal = estimateWorkoutCaloriesBurned({
    durationMinutes: 30,
    mets: [7.5],
    shares: [1],
    weightKg: 70,
  });
  // 7.5 * 70 * 0.5 = 262.5 → 263
  assert.equal(kcal, 263);
  assert.ok(kcal > 50);
});

test("equal share with mixed METs matches weighted average", () => {
  // arms 4.2 + legs 5.2 equally for 60 min @ 70kg
  // avg Met = 4.7 → 4.7 * 70 * 1 = 329
  const kcal = estimateWorkoutCaloriesBurned({
    durationMinutes: 60,
    mets: [4.2, 5.2],
    shares: [1, 1],
    weightKg: 70,
  });
  assert.equal(kcal, 329);
});

test("time-weighted share: longer cardio raises burn vs equal split", () => {
  const equal = estimateWorkoutCaloriesBurned({
    durationMinutes: 40,
    mets: [8, 4.2],
    shares: [1, 1],
    weightKg: 70,
  });
  const cardioHeavy = estimateWorkoutCaloriesBurned({
    durationMinutes: 40,
    mets: [8, 4.2],
    shares: [30, 10],
    weightKg: 70,
  });
  assert.ok(cardioHeavy > equal);
});

test("1-min wall clock without floor is tiny; with floor is not", () => {
  const tiny = estimateWorkoutCaloriesBurned({
    durationMinutes: 1,
    mets: [5],
    shares: [1],
    weightKg: 70,
  });
  const flooredMins = resolveEffectiveWorkoutMinutes({
    wallClockMinutes: 1,
    exerciseCount: 2,
    routineEstimateMinutes: 38,
  });
  const fixed = estimateWorkoutCaloriesBurned({
    durationMinutes: flooredMins,
    mets: [5],
    shares: [1],
    weightKg: 70,
  });
  assert.ok(tiny < 20);
  assert.ok(fixed > 100);
});

test("heavy load burns more than light load (same MET/time)", () => {
  const base = 5 * 70 * 0.5; // 175
  const lightIntensity = volumeIntensity({
    baseKcal: base,
    volumeLoadKg: 3 * 12 * 15, // light
    bodyKg: 70,
    durationMinutes: 30,
    avgRelativeLoad: 15 / 70,
  });
  const heavyIntensity = volumeIntensity({
    baseKcal: base,
    volumeLoadKg: 3 * 12 * 60, // heavy
    bodyKg: 70,
    durationMinutes: 30,
    avgRelativeLoad: 60 / 70,
  });
  assert.ok(heavyIntensity > lightIntensity);
  const light = estimateWorkoutCaloriesBurned({
    durationMinutes: 30,
    mets: [5],
    shares: [1],
    weightKg: 70,
    intensity: lightIntensity,
  });
  const heavy = estimateWorkoutCaloriesBurned({
    durationMinutes: 30,
    mets: [5],
    shares: [1],
    weightKg: 70,
    intensity: heavyIntensity,
  });
  assert.ok(heavy > light);
});

test("isTimeTarget detects treadmill targets", () => {
  assert.equal(isTimeTarget("30 min"), true);
  assert.equal(isTimeTarget("12"), false);
  assert.equal(isTimeTarget("45 sec"), true);
});

console.log(`\n${passed} tests passed`);
if (process.exitCode) {
  console.error("Smoke suite FAILED");
} else {
  console.log("Smoke suite OK");
}
