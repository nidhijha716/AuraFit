"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/PageTransition";

/** Old token URL — send users to the email+name reset form. */
export default function ResetPasswordRedirectPage() {
  return (
    <AuthGuard requireAuth={false} requireOnboarding={false}>
      <div className="relative mx-auto min-h-dvh w-full aura-app-shell aura-app-shell-narrow">
        <PageTransition className="safe-top aura-page-pad pb-10 pt-6">
          <Link
            href="/auth?mode=login"
            className="aura-glass-btn mb-6 inline-flex h-9 w-9 items-center justify-center rounded-xl"
            aria-label="Back to login"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>

          <h1 className="text-3xl font-bold text-white">
            Reset <span className="aura-section-title">password</span>
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Password reset no longer uses email links. Use your account email
            and name instead.
          </p>

          <Link href="/auth/forgot" className="mt-6 block">
            <Button size="lg" fullWidth>
              Continue to reset
            </Button>
          </Link>
        </PageTransition>
      </div>
    </AuthGuard>
  );
}
