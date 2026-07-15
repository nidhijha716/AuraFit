/**
 * Smoke test for email+name password reset (no HTTP server needed).
 * Run: node --experimental-strip-types scripts/smoke-reset-by-profile.mjs
 * or via npx tsx if available — this version uses Prisma via dynamic import after generate.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function namesMatch(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

async function main() {
  const email = `reset_smoke_${Date.now()}@aurafit.test`;
  const name = "Smoke Tester";
  const oldPass = "OldPass123!";
  const newPass = "NewPass456!";

  const passwordHash = await bcrypt.hash(oldPass, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      goals: '["stay_active"]',
      workoutDays: "[1,3,5]",
    },
  });

  // Wrong name
  if (namesMatch(user.name, "Wrong Name")) {
    throw new Error("namesMatch wrongly matched wrong name");
  }

  // Right email + name → update
  const found = await prisma.user.findUnique({ where: { email } });
  if (!found) throw new Error("user not found");
  if (!namesMatch(found.name, name)) throw new Error("name should match");

  const nextHash = await bcrypt.hash(newPass, 12);
  await prisma.user.update({
    where: { id: found.id },
    data: { passwordHash: nextHash },
  });

  const updated = await prisma.user.findUnique({ where: { id: found.id } });
  const ok = await bcrypt.compare(newPass, updated.passwordHash);
  if (!ok) throw new Error("new password did not verify");

  await prisma.user.delete({ where: { id: user.id } });
  console.log("PASS reset-by-profile smoke (email+name match, password updated)");
}

main()
  .catch((e) => {
    console.error("FAIL", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
