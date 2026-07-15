import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { handleApiRoute, jsonError, requireAuthUser } from "@/lib/auth/api";
import { isBetterRecord } from "@/lib/utils/personalRecords";
import type { PersonalRecord } from "@/lib/types";

function toRecord(row: {
  exerciseId: string;
  weightKg: number;
  reps: number;
  achievedAt: Date;
  sourceDate: string | null;
}): PersonalRecord {
  return {
    exerciseId: row.exerciseId,
    weightKg: row.weightKg,
    reps: row.reps,
    achievedAt: row.achievedAt.toISOString(),
    sourceDate: row.sourceDate,
  };
}

export async function GET(request: Request) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const rows = await prisma.personalRecord.findMany({
      where: { userId: user.id },
      orderBy: { achievedAt: "desc" },
    });
    return NextResponse.json({ records: rows.map(toRecord) });
  });
}

const postSchema = z.object({
  exerciseId: z.string().min(1),
  weightKg: z.number().positive().max(1000),
  reps: z.number().int().positive().max(999),
  achievedAt: z.string().optional(),
  sourceDate: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const parsed = postSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError(400, "Invalid record data");

    const data = parsed.data;
    const existing = await prisma.personalRecord.findUnique({
      where: {
        userId_exerciseId: {
          userId: user.id,
          exerciseId: data.exerciseId,
        },
      },
    });

    if (
      existing &&
      !isBetterRecord(
        { weightKg: data.weightKg, reps: data.reps },
        { weightKg: existing.weightKg, reps: existing.reps }
      )
    ) {
      return NextResponse.json({
        record: toRecord(existing),
        isNew: false,
      });
    }

    const achievedAt = data.achievedAt
      ? new Date(data.achievedAt)
      : new Date();

    const row = await prisma.personalRecord.upsert({
      where: {
        userId_exerciseId: {
          userId: user.id,
          exerciseId: data.exerciseId,
        },
      },
      create: {
        userId: user.id,
        exerciseId: data.exerciseId,
        weightKg: data.weightKg,
        reps: data.reps,
        achievedAt,
        sourceDate: data.sourceDate ?? null,
      },
      update: {
        weightKg: data.weightKg,
        reps: data.reps,
        achievedAt,
        sourceDate: data.sourceDate ?? null,
      },
    });

    return NextResponse.json({ record: toRecord(row), isNew: true });
  });
}
