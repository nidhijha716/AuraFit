"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageTransition } from "@/components/ui/PageTransition";
import { ApiClientError, apiFetch } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !name.trim()) {
      setError("Enter the email and name on your account.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<{ message: string }>(
        "/api/auth/reset-password-by-profile",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
            password,
          }),
        }
      );
      setMessage(data.message);
      setTimeout(() => router.push("/auth?mode=login"), 1200);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not reset password."
      );
    } finally {
      setLoading(false);
    }
  };

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
            Confirm the email and name on your account, then choose a new
            password. No email link needed.
          </p>

          <div className="aura-card mt-6 rounded-2xl p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Account name"
                type="text"
                placeholder="Name used at signup"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <Input
                label="New password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />

              {error && (
                <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400 ring-1 ring-red-400/20">
                  {error}
                </p>
              )}
              {message && (
                <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 ring-1 ring-emerald-400/20">
                  {message}
                </p>
              )}

              <Button type="submit" size="lg" fullWidth disabled={loading}>
                {loading ? "Updating…" : "Update password"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Remembered it?{" "}
            <Link
              href="/auth?mode=login"
              className="font-medium text-[#f5d4b8] hover:underline"
            >
              Back to login
            </Link>
          </p>
        </PageTransition>
      </div>
    </AuthGuard>
  );
}
