import { NextResponse } from "next/server";

/**
 * Legacy token-based reset — disabled.
 * Use POST /api/auth/reset-password-by-profile instead.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This reset method is no longer used. Open Forgot password and reset with your email and account name.",
    },
    { status: 410 }
  );
}
