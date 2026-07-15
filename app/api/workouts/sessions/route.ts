import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { handleApiRoute, jsonError, requireAuthUser } from "@/lib/auth/api";
import { toWorkoutSession } from "@/lib/data/mappers";

export async function GET(request: Request) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const rows = await prisma.workoutSession.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
    });
    return NextResponse.json({
      sessions: rows.map(toWorkoutSession),
    });
  });
}

const sessionSchema = z.object({
  workoutId: z.string().min(1),
  workoutName: z.string().min(1),
  startedAt: z.string(),
  completedAt: z.string(),
  durationMinutes: z.number().int().min(1),
  exercisesCompleted: z.array(z.string()),
  estimatedCaloriesBurned: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const parsed = sessionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonError(400, "Invalid session data");
    }

    const data = parsed.data;
    const row = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        workoutId: data.workoutId,
        workoutName: data.workoutName,
        startedAt: new Date(data.startedAt),
        completedAt: new Date(data.completedAt),
        durationMinutes: data.durationMinutes,
        exercisesCompleted: JSON.stringify(data.exercisesCompleted),
        estimatedCaloriesBurned: data.estimatedCaloriesBurned ?? null,
      },
    });

    return NextResponse.json(
      { session: toWorkoutSession(row) },
      { status: 201 }
    );
  });
}
