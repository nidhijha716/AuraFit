import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  ApiError,
  handleApiRoute,
  jsonError,
  setAuthCookie,
} from "@/lib/auth/api";
import { signAccessToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { toUserProfile } from "@/lib/auth/serialize";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  return handleApiRoute(request, async (req) => {
    const body = loginSchema.safeParse(await req.json());
    if (!body.success) {
      return jsonError(400, "Invalid login credentials");
    }

    const email = body.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const valid = await verifyPassword(body.data.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = await signAccessToken({ sub: user.id, email: user.email });
    const response = NextResponse.json({
      user: toUserProfile(user),
      token,
    });
    setAuthCookie(response, token);
    return response;
  });
}
