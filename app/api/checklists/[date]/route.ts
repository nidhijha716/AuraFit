import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { handleApiRoute, jsonError, requireAuthUser } from "@/lib/auth/api";
import { toDailyChecklist } from "@/lib/data/mappers";

const setSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0),
  completed: z.boolean(),
  weightKg: z.number().min(0).max(1000).nullable().optional(),
});

const exerciseEntrySchema = z.object({
  exerciseId: z.string().min(1),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  sets: z.array(setSchema),
});

const checklistSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayOfWeek: z.number().int().min(0).max(6),
  routineName: z.string().min(1),
  allComplete: z.boolean(),
  completedAt: z.string().optional(),
  exercises: z.array(exerciseEntrySchema),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const { date } = await params;

    const row = await prisma.dailyChecklist.findUnique({
      where: { userId_date: { userId: user.id, date } },
      include: {
        exercises: { include: { sets: true } },
      },
    });

    if (!row) {
      return NextResponse.json({ checklist: null });
    }

    return NextResponse.json({ checklist: toDailyChecklist(row) });
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const { date } = await params;
    const parsed = checklistSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonError(400, "Invalid checklist data");
    }

    if (parsed.data.date !== date) {
      return jsonError(400, "Date mismatch");
    }

    const data = parsed.data;

    const saved = await prisma.$transaction(async (tx) => {
      const existing = await tx.dailyChecklist.findUnique({
        where: { userId_date: { userId: user.id, date } },
      });

      if (existing) {
        await tx.dailyChecklist.delete({ where: { id: existing.id } });
      }

      return tx.dailyChecklist.create({
        data: {
          userId: user.id,
          date: data.date,
          dayOfWeek: data.dayOfWeek,
          routineName: data.routineName,
          allComplete: data.allComplete,
          completedAt: data.completedAt ? new Date(data.completedAt) : null,
          exercises: {
            create: data.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              completed: e.completed,
              completedAt: e.completedAt ? new Date(e.completedAt) : null,
              sets: {
                create: e.sets.map((s) => ({
                  setNumber: s.setNumber,
                  reps: s.reps,
                  completed: s.completed,
                  weightKg:
                    s.weightKg === undefined || s.weightKg === null
                      ? null
                      : s.weightKg,
                })),
              },
            })),
          },
        },
        include: {
          exercises: { include: { sets: true } },
        },
      });
    });

    return NextResponse.json({ checklist: toDailyChecklist(saved) });
  });
}
