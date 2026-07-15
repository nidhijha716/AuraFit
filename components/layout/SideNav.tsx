"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuraFitLogo } from "@/components/layout/AuraFitLogo";
import { isNavActive, getMainNavItems } from "@/lib/navigation";
import { useUserStore } from "@/lib/store/userStore";
import { cn } from "@/lib/utils/cn";

export function SideNav() {
  const pathname = usePathname();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const navItems = getMainNavItems(isAuthenticated);

  return (
    <aside
      className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:gap-6 xl:w-60"
      aria-label="Sidebar navigation"
    >
      <AuraFitLogo className="px-2" size="md" />

      <nav className="aura-nav flex flex-col gap-1 rounded-2xl p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "aura-tab-active shadow-sm"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
