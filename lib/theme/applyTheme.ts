import {
  DEFAULT_THEME_PRESET_ID,
  getThemePreset,
  type ThemePreset,
  type ThemePresetId,
} from "@/lib/config/themePresets";

export function applyThemePreset(preset: ThemePreset): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const { vars } = preset;

  root.style.setProperty("--gradient-from", vars.gradientFrom);
  root.style.setProperty("--gradient-to", vars.gradientTo);
  root.style.setProperty("--page-bg-top", vars.pageBgTop);
  root.style.setProperty("--page-bg-mid", vars.pageBgMid);
  root.style.setProperty("--page-bg-bottom", vars.pageBgBottom);
  root.style.setProperty("--page-bg-deep", vars.pageBgDeep);
  root.style.setProperty("--accent", vars.accent);
  root.style.setProperty("--accent-title-mid", vars.accentTitleMid);
  root.style.setProperty("--accent-soft", vars.accentSoft);
  root.style.setProperty("--glow-accent", vars.glowAccent);
  root.style.setProperty("--glow-secondary", vars.glowSecondary);
  root.style.setProperty("--glass-bg", vars.glassBg);
  root.style.setProperty("--ambient-base", vars.ambientBase);
  root.style.setProperty("--btn-secondary-bg", vars.glassBg);
  root.dataset.theme = preset.id;
  root.dataset.bgAnimation = preset.animation;
}

export function applyThemePresetById(id: ThemePresetId | string): void {
  applyThemePreset(getThemePreset(id));
}

export function resetThemeToDefault(): void {
  applyThemePresetById(DEFAULT_THEME_PRESET_ID);
}
