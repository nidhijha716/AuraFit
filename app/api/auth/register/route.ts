import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleApiRoute,
  jsonError,
  setAuthCookie,
} from "@/lib/auth/api";
import { signAccessToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { serializeJsonArray, toUserProfile } from "@/lib/auth/serialize";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  return handleApiRoute(request, async (req) => {
    const body = registerSchema.safeParse(await req.json());
    if (!body.success) {
      return jsonError(400, "Invalid registration data");
    }

    const email = body.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError(409, "An account with this email already exists");
    }

    const passwordHash = await hashPassword(body.data.password);
    const user = await prisma.user.create({
      data: {
        name: body.data.name,
        email,
        passwordHash,
        goals: serializeJsonArray(["stay_active"]),
        workoutDays: serializeJsonArray([1, 3, 5]),
      },
    });

    const token = await signAccessToken({ sub: user.id, email: user.email });
    const response = NextResponse.json(
      { user: toUserProfile(user), token },
      { status: 201 }
    );
    setAuthCookie(response, token);
    return response;
  });
}
