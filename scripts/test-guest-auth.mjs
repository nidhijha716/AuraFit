/**
 * Guest + Auth mode verification script.
 * Run with dev server: npm run dev
 * Then: node scripts/test-guest-auth.mjs
 */

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
  console.log("AuraFit Guest + Auth scenario tests\n");

  // Scenario 1: Public API - unauthenticated me returns 401 but app pages are client-side
  const guestMe = await request("/api/auth/me");
  assert(guestMe.status === 401, "Scenario 1: Guest API has no session (401)");

  // Scenario 3-4: Register, save data, logout data persists in DB
  const emailA = `guest-test-a-${Date.now()}@test.com`;
  const regA = await request("/api/auth/register", {
    method: "POST",
    body: { name: "User A", email: emailA, password: "password123" },
  });
  assert(regA.status === 201, "Scenario 3: User A registers");
  const cookieA = regA.cookie;

  const saveRoutine = await request("/api/routines/1", {
    method: "PUT",
    cookie: cookieA,
    body: {
      dayOfWeek: 1,
      name: "User A Monday",
      exercises: [
        {
          exerciseId: "Barbell_Bench_Press_-_Medium_Grip",
          targetSets: 3,
          targetReps: "8-10",
          order: 0,
        },
      ],
    },
  });
  assert(saveRoutine.status === 200, "Scenario 3: User A saves routine to database");

  const logoutA = await request("/api/auth/logout", {
    method: "POST",
    cookie: cookieA,
  });
  assert(logoutA.status === 200, "Scenario 3: User A logs out");

  const afterLogout = await request("/api/auth/me");
  assert(afterLogout.status === 401, "Scenario 3: No session after logout");

  const loginA = await request("/api/auth/login", {
    method: "POST",
    body: { email: emailA, password: "password123" },
  });
  assert(loginA.status === 200, "Scenario 4: User A logs in again");
  const cookieA2 = loginA.cookie;

  const routinesA = await request("/api/routines", { cookie: cookieA2 });
  assert(
    routinesA.data.weeklyRoutines?.[1]?.name === "User A Monday",
    "Scenario 4: User A data restored from database after re-login"
  );

  // Scenario 6: User B isolation
  const emailB = `guest-test-b-${Date.now()}@test.com`;
  const regB = await request("/api/auth/register", {
    method: "POST",
    body: { name: "User B", email: emailB, password: "password123" },
  });
  assert(regB.status === 201, "Scenario 6: User B registers");
  const cookieB = regB.cookie;

  const routinesB = await request("/api/routines", { cookie: cookieB });
  assert(
    routinesB.data.weeklyRoutines?.[1] === null,
    "Scenario 6: User B cannot see User A routines"
  );

  const getBMonday = await request("/api/routines/1", { cookie: cookieB });
  assert(
    getBMonday.data.routine === null,
    "Scenario 6: User B has no access to User A routine slot data"
  );

  console.log("\nAPI scenarios passed.");
  console.log(
    "\nManual UI checks (Scenarios 1-2, 5): open /dashboard without login, browse exercises, train as guest, logout and confirm guest mode."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
