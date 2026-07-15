"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useHydrateStores, useStoresHydrated } from "@/lib/store/hydrate";
import { useUserStore } from "@/lib/store/userStore";

const ONBOARDING_ROUTE = "/onboarding";
const AUTH_REQUIRED_ROUTES = ["/profile", "/onboarding"];

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireOnboarding = false,
}: AuthGuardProps) {
  useHydrateStores();
  const hydrated = useStoresHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const user = useUserStore((s) => s.user);

  const mustBeAuthenticated =
    requireAuth || AUTH_REQUIRED_ROUTES.includes(pathname);

  useEffect(() => {
    if (!hydrated) return;

    if (pathname === "/auth" && isAuthenticated) {
      router.replace(
        user?.onboardingComplete ? "/dashboard" : "/onboarding"
      );
      return;
    }

    if (mustBeAuthenticated && !isAuthenticated) {
      router.replace(`/auth?mode=login&next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (
      requireOnboarding &&
      isAuthenticated &&
      user &&
      !user.onboardingComplete &&
      pathname !== ONBOARDING_ROUTE
    ) {
      router.replace("/onboarding");
    }
  }, [
    hydrated,
    isAuthenticated,
    user,
    pathname,
    router,
    requireAuth,
    requireOnboarding,
    mustBeAuthenticated,
  ]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (mustBeAuthenticated && !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
