"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, getMainNavItems } from "@/lib/navigation";
import { useUserStore } from "@/lib/store/userStore";
import { cn } from "@/lib/utils/cn";

export function BottomNav() {
  const pathname = usePathname();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const navItems = getMainNavItems(isAuthenticated);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 safe-bottom lg:hidden",
        "mx-auto w-full max-w-md md:max-w-2xl"
      )}
      aria-label="Main navigation"
    >
      <div className="aura-nav mx-3 mb-3 rounded-[1.75rem] px-1.5 py-1.5">
        <ul className="flex items-center justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = isNavActive(pathname, href);

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5",
                    "text-[10px] font-semibold tracking-wide transition-all duration-200 active:scale-[0.97]",
                    isActive ? "text-white" : "text-white/50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200",
                      isActive
                        ? "aura-icon text-[#f5d4b8] shadow-[0_0_20px_rgba(240,180,138,0.25)]"
                        : "text-white/50"
                    )}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={isActive ? 2.35 : 1.9}
                    />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
