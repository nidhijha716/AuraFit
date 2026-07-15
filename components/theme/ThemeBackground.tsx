"use client";

import { usePathname } from "next/navigation";
import { getThemePreset } from "@/lib/config/themePresets";
import { useThemeStore } from "@/lib/store/themeStore";
import { ThemeAnimatedLayer } from "@/components/theme/ThemeAnimatedLayer";

const LANDING_PATHS = ["/"];

export function ThemeBackground() {
  const pathname = usePathname();
  const presetId = useThemeStore((s) => s.presetId);

  if (LANDING_PATHS.includes(pathname)) {
    return null;
  }

  const preset = getThemePreset(presetId);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor: "var(--ambient-base)" }}
    >
      <div className="absolute inset-0 aura-page-bg" />
      <ThemeAnimatedLayer animation={preset.animation} />
    </div>
  );
}
