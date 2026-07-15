/**
 * Auth isolation + persistence API smoke for AuraFit.
 * Run: node scripts/qa-auth-isolation.mjs
 */
const BASE = process.env.AURAFIT_URL || "http://127.0.0.1:3001";

function cookieJar() {
  /** @type {Record<string,string>} */
  const jar = {};
  return {
    store(res) {
      const raw = res.headers.getSetCookie?.() || [];
      for (const c of raw) {
        const [pair] = c.split(";");
        const eq = pair.indexOf("=");
        if (eq > 0) jar[pair.slice(0, eq)] = pair.slice(eq + 1);
      }
      // Node < 18 fallback via get('set-cookie')
      const single = res.headers.get("set-cookie");
      if (single && raw.length === 0) {
        for (const part of single.split(/,(?=\s*[^;]+=)/)) {
          const [pair] = part.trim().split(";");
          const eq = pair.indexOf("=");
          if (eq > 0) jar[pair.slice(0, eq)] = pair.slice(eq + 1);
        }
      }
    },
    header() {
      return Object.entries(jar)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    },
    clear() {
      for (const k of Object.keys(jar)) delete jar[k];
    },
  };
}

async function api(path, { method = "GET", body, jar } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(jar?.header() ? { Cookie: jar.header() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  jar?.store(res);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, res };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const stamp = Date.now();
const user1 = {
  name: "QA User One",
  email: `qa1_${stamp}@aurafit.test`,
  password: "TestPass123!",
};
const user2 = {
  name: "QA User Two",
  email: `qa2_${stamp}@aurafit.test`,
  password: "TestPass123!",
};

let passed = 0;
function ok(name) {
  passed += 1;
  console.log(`  PASS  ${name}`);
}

async function main() {
  console.log(`AuraFit QA auth isolation @ ${BASE}\n`);

  const jar1 = cookieJar();
  let r = await api("/api/auth/register", {
    method: "POST",
    body: user1,
    jar: jar1,
  });
  assert(r.status === 201 || r.status === 200, `register1 ${r.status} ${JSON.stringify(r.data)}`);
  ok(`Register account 1 (${user1.email})`);

  r = await api("/api/auth/me", {
    method: "PATCH",
    jar: jar1,
    body: {
      onboardingComplete: true,
      goals: ["build_muscle"],
      experienceLevel: "intermediate",
      workoutDays: [1, 3, 5],
      heightCm: 175,
      weightKg: 72,
      sex: "male",
      age: 28,
      activityLevel: "moderate",
    },
  });
  assert(r.status === 200, `profile1 ${r.status}`);
  ok("Update profile / onboarding fields for user 1");

  r = await api("/api/routines/2", {
    method: "PUT",
    jar: jar1,
    body: {
      dayOfWeek: 2,
      name: "QA Tue Private Routine",
      exercises: [
        {
          exerciseId: "Running_Treadmill",
          targetSets: 1,
          targetReps: "30 min",
          order: 0,
        },
      ],
      updatedAt: new Date().toISOString(),
    },
  });
  assert(r.status === 200 || r.status === 201, `routine1 ${r.status} ${JSON.stringify(r.data)}`);
  ok("Save private Tuesday routine for user 1");

  r = await api("/api/workouts/sessions", {
    method: "POST",
    jar: jar1,
    body: {
      workoutId: "qa-session-1",
      workoutName: "QA Private Session",
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      completedAt: new Date().toISOString(),
      durationMinutes: 30,
      exercisesCompleted: ["Running_Treadmill"],
      estimatedCaloriesBurned: 250,
    },
  });
  assert(r.status === 201 || r.status === 200, `session1 ${r.status}`);
  ok("Save workout session + calories for user 1");

  r = await api("/api/routines", { jar: jar1 });
  assert(r.status === 200, "routines get 1");
  const u1Routine = r.data.weeklyRoutines?.[2];
  assert(u1Routine?.name === "QA Tue Private Routine", "user1 routine present");
  ok("User 1 can read own routine");

  r = await api("/api/workouts/sessions", { jar: jar1 });
  assert(
    (r.data.sessions || []).some((s) => s.workoutName === "QA Private Session"),
    "user1 session missing"
  );
  ok("User 1 can read own sessions");

  // Logout user 1
  r = await api("/api/auth/logout", { method: "POST", jar: jar1 });
  assert(r.status === 200 || r.status === 204 || r.status === 201, `logout ${r.status}`);
  jar1.clear();
  ok("Logout user 1");

  r = await api("/api/routines", { jar: jar1 });
  assert(r.status === 401, `expected 401 after logout got ${r.status}`);
  ok("Private routines blocked without auth (401)");

  // Login again
  r = await api("/api/auth/login", {
    method: "POST",
    jar: jar1,
    body: { email: user1.email, password: user1.password },
  });
  assert(r.status === 200, `relogin ${r.status}`);
  ok("Login user 1 again");

  r = await api("/api/auth/me", { jar: jar1 });
  assert(r.data.user?.weightKg === 72, "profile weight restored");
  assert(r.data.user?.onboardingComplete === true, "onboarding restored");
  ok("Profile data restored after re-login");

  r = await api("/api/routines", { jar: jar1 });
  assert(
    r.data.weeklyRoutines?.[2]?.name === "QA Tue Private Routine",
    "routine not restored"
  );
  ok("Routine restored after re-login");

  r = await api("/api/workouts/sessions", { jar: jar1 });
  assert(
    (r.data.sessions || []).some((s) => s.estimatedCaloriesBurned === 250),
    "calories not restored"
  );
  ok("Calories/session restored after re-login");

  // User 2
  const jar2 = cookieJar();
  r = await api("/api/auth/register", {
    method: "POST",
    body: user2,
    jar: jar2,
  });
  assert(r.status === 201 || r.status === 200, `register2 ${r.status}`);
  ok(`Register account 2 (${user2.email})`);

  r = await api("/api/routines", { jar: jar2 });
  assert(r.status === 200, "routines get 2");
  const u2Routine = r.data.weeklyRoutines?.[2];
  assert(
    !u2Routine || u2Routine.name !== "QA Tue Private Routine",
    "ISOLATION FAIL: user2 can see user1 routine"
  );
  ok("User 2 cannot see user 1 routine");

  r = await api("/api/workouts/sessions", { jar: jar2 });
  assert(
    !(r.data.sessions || []).some((s) => s.workoutName === "QA Private Session"),
    "ISOLATION FAIL: user2 can see user1 sessions"
  );
  ok("User 2 cannot see user 1 sessions/calories");

  console.log(`\n${passed} API checks passed`);
  console.log("\nTest accounts:");
  console.log(`  User1: ${user1.email} / ${user1.password}`);
  console.log(`  User2: ${user2.email} / ${user2.password}`);
}

main().catch((err) => {
  console.error(`\nFAIL: ${err.message}`);
  process.exit(1);
});
