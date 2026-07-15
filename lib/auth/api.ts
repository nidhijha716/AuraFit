import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  COOKIE_NAME,
  getExpiresInSeconds,
  verifyAccessToken,
} from "@/lib/auth/jwt";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }

  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function requireAuthUser(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  return user;
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getExpiresInSeconds(),
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function handleApiRoute(
  request: Request,
  handler: (request: Request) => Promise<NextResponse>
) {
  try {
    return await handler(request);
  } catch (err) {
    if (err instanceof ApiError) {
      return jsonError(err.status, err.message);
    }
    console.error(err);
    return jsonError(500, "Internal server error");
  }
}
