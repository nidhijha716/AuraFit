import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { handleApiRoute, jsonError } from "@/lib/auth/api";
import { hashPassword } from "@/lib/auth/password";

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  password: z.string().min(8).max(128),
});

function namesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Simple recovery: email + account name must match, then set a new password.
 * No email delivery or reset tokens.
 */
export async function POST(request: Request) {
  return handleApiRoute(request, async (req) => {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonError(
        400,
        "Enter a valid email, your account name, and a password of at least 8 characters"
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const name = parsed.data.name.trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return jsonError(404, "No account found with that email");
    }

    if (!namesMatch(user.name, name)) {
      return jsonError(
        403,
        "Name does not match this account. Use the exact name from signup."
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      message: "Password updated. You can sign in with your new password.",
    });
  });
}
