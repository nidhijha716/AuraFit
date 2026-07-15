import { BottomNav } from "@/components/layout/BottomNav";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { SideNav } from "@/components/layout/SideNav";
import { RestTimerBanner } from "@/components/workout/RestTimerBanner";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface MobileShellProps {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
  /** Narrow pages like auth/onboarding */
  narrow?: boolean;
  /** Wider content area for dashboard-style pages */
  wide?: boolean;
}

export function MobileShell({
  children,
  showNav = true,
  className,
  narrow = false,
  wide = false,
}: MobileShellProps) {
  return (
    <div
      className={cn(
        "relative min-h-dvh w-full max-w-full overflow-x-hidden",
        narrow ? "aura-app-shell-narrow mx-auto" : "mx-auto w-full",
        !narrow && !wide && "aura-app-shell",
        wide && "aura-app-shell-wide"
      )}
    >
      <div className="flex min-h-dvh gap-6 lg:gap-8 xl:gap-10">
        {showNav && <SideNav />}

        <main
          className={cn(
            "min-w-0 max-w-full flex-1 overflow-x-hidden aura-page-pad safe-top pt-4 lg:pt-6",
            showNav ? "pb-[calc(var(--nav-height)+1.5rem)] lg:pb-10" : "pb-6 md:pb-10",
            className
          )}
        >
          {showNav && <AppTopBar />}
          {children}
        </main>
      </div>

      <RestTimerBanner />
      {showNav && <BottomNav />}
    </div>
  );
}
