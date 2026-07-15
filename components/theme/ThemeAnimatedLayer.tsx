"use client";

import type { ThemeAnimationId } from "@/lib/config/themePresets";
import { cn } from "@/lib/utils/cn";
import { EnhancedThemeCanvas } from "@/components/theme/EnhancedThemeCanvas";

interface ThemeAnimatedLayerProps {
  animation: ThemeAnimationId;
  className?: string;
}

export function ThemeAnimatedLayer({
  animation,
  className,
}: ThemeAnimatedLayerProps) {
  if (animation === "none") return null;

  return (
    <EnhancedThemeCanvas
      animation={animation}
      className={cn("theme-animated-bg theme-animated-bg--enhanced", className)}
    />
  );
}
