const BASE = process.env.BASE_URL ?? "http://localhost:3000";

function extractCookie(setCookie) {
  if (!setCookie) return null;
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const part of parts) {
    const match = part.match(/aurafit_token=([^;]+)/);
    if (match) return `aurafit_token=${match[1]}`;
  }
  return null;
}

async function request(path, { method = "GET", body, cookie } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  const setCookie = res.headers.getSetCookie?.() ?? res.headers.get("set-cookie");
  return { status: res.status, data, cookie: extractCookie(setCookie) };
}

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

async function main() {
  console.log("AuraFit auth isolation test\n");

  const unauth = await request("/api/auth/me");
  assert(unauth.status === 401, "Unauthenticated /api/auth/me returns 401");

  const userA = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Nidhi",
      email: `nidhi-${Date.now()}@test.com`,
      password: "password123",
    },
  });
  assert(userA.status === 201, "User A registration succeeds");
  assert(userA.data.user?.name === "Nidhi", "User A profile returned");
  const cookieA = userA.cookie;
  assert(cookieA, "User A receives auth cookie");

  const userB = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Raj",
      email: `raj-${Date.now()}@test.com`,
      password: "password123",
    },
  });
  assert(userB.status === 201, "User B registration succeeds");
  const cookieB = userB.cookie;
  assert(cookieB, "User B receives auth cookie");

  const routinePayload = {
    dayOfWeek: 1,
    name: "Nidhi Monday Push",
    exercises: [
      {
        exerciseId: "Barbell_Bench_Press_-_Medium_Grip",
        targetSets: 3,
        targetReps: "8-10",
        order: 0,
      },
    ],
  };

  const saveA = await request("/api/routines/1", {
    method: "PUT",
    body: routinePayload,
    cookie: cookieA,
  });
  assert(saveA.status === 200, "User A saves Monday routine");
  assert(
    saveA.data.routine?.name === "Nidhi Monday Push",
    "User A routine persisted"
  );

  const routinesA = await request("/api/routines", { cookie: cookieA });
  assert(
    routinesA.data.weeklyRoutines?.[1]?.name === "Nidhi Monday Push",
    "User A sees own routine in weekly list"
  );

  const routinesB = await request("/api/routines", { cookie: cookieB });
  assert(
    routinesB.data.weeklyRoutines?.[1] === null,
    "User B weekly routines are empty (no leakage)"
  );

  const getBMonday = await request("/api/routines/1", { cookie: cookieB });
  assert(
    getBMonday.data.routine === null,
    "User B cannot see User A routine on same day slot"
  );

  const sessionA = await request("/api/workouts/sessions", {
    method: "POST",
    cookie: cookieA,
    body: {
      workoutId: "custom-1",
      workoutName: "Nidhi Session",
      startedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      completedAt: new Date().toISOString(),
      durationMinutes: 30,
      exercisesCompleted: ["Barbell_Bench_Press_-_Medium_Grip"],
    },
  });
  assert(sessionA.status === 201, "User A logs workout session");

  const sessionsB = await request("/api/workouts/sessions", { cookie: cookieB });
  assert(
    sessionsB.data.sessions?.length === 0,
    "User B has no workout sessions from User A"
  );

  const logoutA = await request("/api/auth/logout", {
    method: "POST",
    cookie: cookieA,
  });
  assert(logoutA.status === 200, "User A logout succeeds");

  const afterLogoutNoCookie = await request("/api/auth/me");
  assert(
    afterLogoutNoCookie.status === 401,
    "Protected API without cookie returns 401 after logout"
  );

  console.log("\nAll isolation tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
