"use client";

import { themePresets, type ThemePresetId } from "@/lib/config/themePresets";
import { useThemeStore } from "@/lib/store/themeStore";
import { cn } from "@/lib/utils/cn";

interface ThemePickerProps {
  className?: string;
  compact?: boolean;
}

export function ThemePicker({ className, compact = false }: ThemePickerProps) {
  const presetId = useThemeStore((s) => s.presetId);
  const setPresetId = useThemeStore((s) => s.setPresetId);

  return (
    <div className={className}>
      <div className="mb-3">
        <h3 className="font-semibold text-text-primary">App theme</h3>
        <p className="text-xs text-text-muted">
          {compact
            ? "Personalize your AuraFit colors"
            : "Choose a gradient and accent color for your app (landing page stays the same)"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {themePresets.map((preset) => {
          const selected = presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => void setPresetId(preset.id as ThemePresetId)}
              className={cn(
                "rounded-2xl border p-3 text-left transition-all",
                selected
                  ? "border-[var(--accent)] bg-white/8 ring-1 ring-[var(--accent)]/40"
                  : "border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/6"
              )}
              aria-pressed={selected}
            >
              <div
                className="mb-2 h-10 w-full rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${preset.preview[0]} 0%, ${preset.preview[1]} 100%)`,
                }}
              />
              <p className="text-xs font-semibold text-text-primary">
                {preset.name}
              </p>
              {!compact && (
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-text-muted">
                  {preset.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
