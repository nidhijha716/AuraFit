"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette, Sparkles } from "lucide-react";
import {
  getThemePreset,
  themePresets,
  type ThemePresetId,
} from "@/lib/config/themePresets";
import { useThemeStore } from "@/lib/store/themeStore";
import { cn } from "@/lib/utils/cn";

interface ThemeMenuProps {
  className?: string;
}

export function ThemeMenu({ className }: ThemeMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const presetId = useThemeStore((s) => s.presetId);
  const setPresetId = useThemeStore((s) => s.setPresetId);
  const current = getThemePreset(presetId);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectTheme = (id: ThemePresetId) => {
    void setPresetId(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="aura-glass-btn flex h-9 items-center gap-2 rounded-xl px-2.5 sm:px-3"
        aria-label="Choose app theme"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className="h-5 w-5 shrink-0 rounded-md ring-1 ring-white/20"
          style={{
            background: `linear-gradient(135deg, ${current.preview[0]} 0%, ${current.preview[1]} 100%)`,
          }}
          aria-hidden
        />
        <Palette className="h-4 w-4 text-accent" />
        <span className="hidden text-xs font-medium text-white sm:inline">
          Theme
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#1a2030]/95 p-3 shadow-xl backdrop-blur-xl"
          role="listbox"
          aria-label="App themes"
        >
          <p className="mb-2 px-1 text-xs font-semibold text-white">
            Choose your theme
          </p>
          <p className="mb-3 px-1 text-[10px] leading-relaxed text-white/55">
            Applies across the app. Landing page stays unchanged.
          </p>

          <div className="max-h-[min(24rem,65vh)] space-y-1 overflow-y-auto no-scrollbar">
            {themePresets.map((preset) => {
              const selected = preset.id === presetId;
              const isAnimated = preset.animation !== "none";
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectTheme(preset.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                    selected
                      ? "bg-white/10 ring-1 ring-[var(--accent)]/40"
                      : "hover:bg-white/5"
                  )}
                >
                  <span
                    className="relative h-8 w-8 shrink-0 rounded-lg ring-1 ring-white/15"
                    style={{
                      background: `linear-gradient(135deg, ${preset.preview[0]} 0%, ${preset.preview[1]} 100%)`,
                    }}
                  >
                    {isAnimated && (
                      <Sparkles
                        className="absolute -right-1 -top-1 h-3 w-3 text-accent drop-shadow"
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="block text-xs font-semibold text-white">
                        {preset.name}
                      </span>
                      {isAnimated && (
                        <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent">
                          Live
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[10px] text-white/50">
                      {preset.description}
                    </span>
                  </span>
                  {selected && (
                    <Check className="h-4 w-4 shrink-0 text-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
