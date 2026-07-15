import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { ApiError, handleApiRoute, jsonError, requireAuthUser } from "@/lib/auth/api";
import { toDayRoutine } from "@/lib/data/mappers";
import type { DayRoutine } from "@/lib/types";

const exerciseSchema = z.object({
  exerciseId: z.string().min(1),
  targetSets: z.number().int().min(1).max(20),
  targetReps: z.string().min(1).max(32),
  order: z.number().int().min(0),
});

const routineSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  name: z.string().min(1).max(120),
  exercises: z.array(exerciseSchema),
  updatedAt: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ day: string }> }
) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const { day } = await params;
    const dayOfWeek = parseInt(day, 10);
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return jsonError(400, "Invalid day");
    }

    const row = await prisma.dayRoutine.findUnique({
      where: { userId_dayOfWeek: { userId: user.id, dayOfWeek } },
      include: { exercises: true },
    });

    if (!row) {
      return NextResponse.json({ routine: null });
    }

    return NextResponse.json({ routine: toDayRoutine(row) });
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ day: string }> }
) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const { day } = await params;
    const dayOfWeek = parseInt(day, 10);
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return jsonError(400, "Invalid day");
    }

    const parsed = routineSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonError(400, "Invalid routine data");
    }

    if (parsed.data.dayOfWeek !== dayOfWeek) {
      return jsonError(400, "Day mismatch");
    }

    const routine = parsed.data as DayRoutine;

    const saved = await prisma.$transaction(async (tx) => {
      const existing = await tx.dayRoutine.findUnique({
        where: { userId_dayOfWeek: { userId: user.id, dayOfWeek } },
      });

      if (existing) {
        await tx.routineExercise.deleteMany({ where: { routineId: existing.id } });
      }

      return tx.dayRoutine.upsert({
        where: { userId_dayOfWeek: { userId: user.id, dayOfWeek } },
        create: {
          userId: user.id,
          dayOfWeek,
          name: routine.name,
          exercises: {
            create: routine.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              targetSets: e.targetSets,
              targetReps: e.targetReps,
              sortOrder: e.order,
            })),
          },
        },
        update: {
          name: routine.name,
          exercises: {
            create: routine.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              targetSets: e.targetSets,
              targetReps: e.targetReps,
              sortOrder: e.order,
            })),
          },
        },
        include: { exercises: true },
      });
    });

    return NextResponse.json({ routine: toDayRoutine(saved) });
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ day: string }> }
) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const { day } = await params;
    const dayOfWeek = parseInt(day, 10);
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return jsonError(400, "Invalid day");
    }

    const existing = await prisma.dayRoutine.findUnique({
      where: { userId_dayOfWeek: { userId: user.id, dayOfWeek } },
    });

    if (!existing) {
      throw new ApiError(404, "Routine not found");
    }

    await prisma.dayRoutine.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  });
}
