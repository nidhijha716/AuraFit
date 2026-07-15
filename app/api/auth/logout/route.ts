import { NextResponse } from "next/server";
import { clearAuthCookie, handleApiRoute } from "@/lib/auth/api";

export async function POST(request: Request) {
  return handleApiRoute(request, async () => {
    const response = NextResponse.json({ success: true });
    clearAuthCookie(response);
    return response;
  });
}
