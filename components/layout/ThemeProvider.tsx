"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  applyThemePresetById,
  resetThemeToDefault,
} from "@/lib/theme/applyTheme";
import { useThemeStore } from "@/lib/store/themeStore";

const LANDING_PATHS = ["/"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const presetId = useThemeStore((s) => s.presetId);

  useEffect(() => {
    if (LANDING_PATHS.includes(pathname)) {
      resetThemeToDefault();
      return;
    }
    applyThemePresetById(presetId);
  }, [pathname, presetId]);

  return <>{children}</>;
}
