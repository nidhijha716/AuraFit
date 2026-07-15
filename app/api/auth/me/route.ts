import { NextResponse } from "next/server";
import { handleApiRoute, requireAuthUser } from "@/lib/auth/api";
import { isValidThemePresetId } from "@/lib/config/themePresets";
import { toUserProfile } from "@/lib/auth/serialize";
export async function GET(request: Request) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    return NextResponse.json({ user: toUserProfile(user) });
  });
}

export async function PATCH(request: Request) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const body = (await req.json()) as Record<string, unknown>;

    const { prisma } = await import("@/lib/db/prisma");
    const { serializeJsonArray } = await import("@/lib/auth/serialize");

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(typeof body.name === "string" ? { name: body.name.trim() } : {}),
        ...(Array.isArray(body.goals)
          ? { goals: serializeJsonArray(body.goals) }
          : {}),
        ...(typeof body.experienceLevel === "string"
          ? { experienceLevel: body.experienceLevel }
          : {}),
        ...(Array.isArray(body.workoutDays)
          ? { workoutDays: serializeJsonArray(body.workoutDays) }
          : {}),
        ...(typeof body.onboardingComplete === "boolean"
          ? { onboardingComplete: body.onboardingComplete }
          : {}),
        ...(typeof body.heightCm === "number" ? { heightCm: body.heightCm } : {}),
        ...(typeof body.weightKg === "number" ? { weightKg: body.weightKg } : {}),
        ...(typeof body.age === "number" &&
        Number.isInteger(body.age) &&
        body.age >= 13 &&
        body.age <= 100
          ? { age: body.age }
          : {}),
        ...(body.sex === null
          ? { sex: null }
          : typeof body.sex === "string" &&
              ["male", "female", "prefer_not_to_say"].includes(body.sex)
            ? { sex: body.sex }
            : {}),
        ...(body.activityLevel === null
          ? { activityLevel: null }
          : typeof body.activityLevel === "string" &&
              [
                "sedentary",
                "light",
                "moderate",
                "active",
                "very_active",
              ].includes(body.activityLevel)
            ? { activityLevel: body.activityLevel }
            : {}),
        ...(typeof body.themePreset === "string" &&
        isValidThemePresetId(body.themePreset)
          ? { themePreset: body.themePreset }
          : {}),
        ...(typeof body.reminderEnabled === "boolean"
          ? { reminderEnabled: body.reminderEnabled }
          : {}),
        ...(typeof body.reminderTimeLocal === "string" &&
        /^\d{2}:\d{2}$/.test(body.reminderTimeLocal)
          ? { reminderTimeLocal: body.reminderTimeLocal }
          : {}),
      },
    });

    return NextResponse.json({ user: toUserProfile(updated) });
  });
}
