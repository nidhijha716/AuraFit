"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageTransition } from "@/components/ui/PageTransition";
import { ApiClientError } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/userStore";
import { cn } from "@/lib/utils/cn";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "login" ? "login" : "signup";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useUserStore((s) => s.login);
  const signup = useUserStore((s) => s.signup);

  const getRedirectPath = () => {
    const next = searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      return next;
    }
    const user = useUserStore.getState().user;
    return user?.onboardingComplete ? "/dashboard" : "/onboarding";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your name.");
          return;
        }
        await signup(email, password, name.trim());
        router.push("/onboarding");
        return;
      }

      await login(email, password);
      router.push(getRedirectPath());
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          setError("An account with this email already exists.");
        } else if (err.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="safe-top aura-page-pad pb-10 pt-6 md:pt-10">
      <Link
        href="/"
        className="aura-glass-btn mb-6 inline-flex h-9 w-9 items-center justify-center rounded-xl"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-5 w-5 text-white" />
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {mode === "signup" ? (
            <>
              Create <span className="aura-section-title">Account</span>
            </>
          ) : (
            <>
              Welcome <span className="aura-section-title">Back</span>
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-white/70">
          {mode === "signup"
            ? "Start your fitness journey with AuraFit"
            : "Log in to continue your workouts"}
        </p>
      </div>

      <div className="aura-tab-bar mb-6 flex rounded-2xl p-1">
        {(["signup", "login"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setMode(tab);
              setError("");
            }}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
              mode === tab
                ? "aura-tab-active font-semibold"
                : "text-white/65 hover:text-white"
            )}
          >
            {tab === "signup" ? "Sign Up" : "Log In"}
          </button>
        ))}
      </div>

      <div className="aura-card rounded-2xl p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === "login" && (
            <div className="text-right">
              <Link
                href="/auth/forgot"
                className="text-xs font-medium text-[#f5d4b8] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400 ring-1 ring-red-400/20">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create Account"
                : "Log In"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-white/45">
        Your account and fitness data are stored securely on the server.
      </p>
    </PageTransition>
  );
}

export default function AuthPage() {
  return (
    <AuthGuard requireAuth={false} requireOnboarding={false}>
      <div className="relative mx-auto min-h-dvh w-full aura-app-shell aura-app-shell-narrow">
        <Suspense
          fallback={
            <div className="flex min-h-dvh items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0b48a] border-t-transparent" />
            </div>
          }
        >
          <AuthForm />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
