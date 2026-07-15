import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { handleApiRoute, requireAuthUser } from "@/lib/auth/api";
import { toWeeklyRoutines } from "@/lib/data/mappers";

export async function GET(request: Request) {
  return handleApiRoute(request, async (req) => {
    const user = await requireAuthUser(req);
    const rows = await prisma.dayRoutine.findMany({
      where: { userId: user.id },
      include: { exercises: true },
    });
    return NextResponse.json({ weeklyRoutines: toWeeklyRoutines(rows) });
  });
}
