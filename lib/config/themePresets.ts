export const THEME_PRESET_IDS = [
  "classic",
  "ember",
  "ocean",
  "forest",
  "violet",
  "steel",
  "sunset",
  "lime",
  "aurora-glow",
  "ocean-tide",
  "ember-rise",
  "nebula-drift",
  "sunset-shimmer",
  "cyber-pulse",
  "violet-mist",
] as const;

export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

export type ThemeAnimationId =
  | "none"
  | "aurora"
  | "waves"
  | "pulse"
  | "nebula"
  | "embers"
  | "shimmer";

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  preview: [string, string];
  animation: ThemeAnimationId;
  vars: {
    gradientFrom: string;
    gradientTo: string;
    pageBgTop: string;
    pageBgMid: string;
    pageBgBottom: string;
    pageBgDeep: string;
    accent: string;
    accentTitleMid: string;
    accentSoft: string;
    glowAccent: string;
    glowSecondary: string;
    glassBg: string;
    ambientBase: string;
  };
}

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = "classic";

export const themePresets: ThemePreset[] = [
  {
    id: "classic",
    name: "Aura Classic",
    description: "Warm dark gym — the original AuraFit look",
    preview: ["#283048", "#f0b48a"],
    animation: "none",
    vars: {
      gradientFrom: "#283048",
      gradientTo: "#859398",
      pageBgTop: "#121820",
      pageBgMid: "#1a2438",
      pageBgBottom: "#283048",
      pageBgDeep: "#222c3e",
      accent: "#f0b48a",
      accentTitleMid: "#fff4ec",
      accentSoft: "rgba(240, 180, 138, 0.22)",
      glowAccent: "rgba(240, 180, 138, 0.16)",
      glowSecondary: "rgba(133, 147, 152, 0.2)",
      glassBg: "rgba(40, 48, 72, 0.55)",
      ambientBase: "#121820",
    },
  },
  {
    id: "ember",
    name: "Midnight Ember",
    description: "Intense coral heat for high-energy training",
    preview: ["#3d1515", "#ff6b4a"],
    animation: "none",
    vars: {
      gradientFrom: "#2a1010",
      gradientTo: "#5c2820",
      pageBgTop: "#1a0a0a",
      pageBgMid: "#2a1212",
      pageBgBottom: "#3d1515",
      pageBgDeep: "#2a1818",
      accent: "#ff6b4a",
      accentTitleMid: "#ffd4c8",
      accentSoft: "rgba(255, 107, 74, 0.22)",
      glowAccent: "rgba(255, 107, 74, 0.18)",
      glowSecondary: "rgba(180, 60, 40, 0.15)",
      glassBg: "rgba(60, 24, 20, 0.55)",
      ambientBase: "#1a0a0a",
    },
  },
  {
    id: "ocean",
    name: "Ocean Depth",
    description: "Cool blues for calm focus and endurance",
    preview: ["#1a3a5c", "#5eb8e8"],
    animation: "none",
    vars: {
      gradientFrom: "#0d2847",
      gradientTo: "#1a5080",
      pageBgTop: "#0a1628",
      pageBgMid: "#122840",
      pageBgBottom: "#1a3a5c",
      pageBgDeep: "#0d2847",
      accent: "#5eb8e8",
      accentTitleMid: "#c8e8ff",
      accentSoft: "rgba(94, 184, 232, 0.22)",
      glowAccent: "rgba(94, 184, 232, 0.16)",
      glowSecondary: "rgba(40, 100, 160, 0.18)",
      glassBg: "rgba(20, 40, 72, 0.55)",
      ambientBase: "#0a1628",
    },
  },
  {
    id: "forest",
    name: "Forest Edge",
    description: "Grounded greens for wellness and consistency",
    preview: ["#1e3d2a", "#7dd87a"],
    animation: "none",
    vars: {
      gradientFrom: "#152a1c",
      gradientTo: "#2a5040",
      pageBgTop: "#0f1a12",
      pageBgMid: "#162818",
      pageBgBottom: "#1e3d2a",
      pageBgDeep: "#152a1c",
      accent: "#7dd87a",
      accentTitleMid: "#d4f5d0",
      accentSoft: "rgba(125, 216, 122, 0.22)",
      glowAccent: "rgba(125, 216, 122, 0.14)",
      glowSecondary: "rgba(60, 120, 80, 0.16)",
      glassBg: "rgba(24, 48, 32, 0.55)",
      ambientBase: "#0f1a12",
    },
  },
  {
    id: "violet",
    name: "Royal Violet",
    description: "Modern purple tones for a premium night feel",
    preview: ["#2d1f4e", "#c9a0ff"],
    animation: "none",
    vars: {
      gradientFrom: "#1a1230",
      gradientTo: "#3d2a60",
      pageBgTop: "#14101f",
      pageBgMid: "#201630",
      pageBgBottom: "#2d1f4e",
      pageBgDeep: "#1a1230",
      accent: "#c9a0ff",
      accentTitleMid: "#ede0ff",
      accentSoft: "rgba(201, 160, 255, 0.22)",
      glowAccent: "rgba(201, 160, 255, 0.16)",
      glowSecondary: "rgba(100, 60, 160, 0.18)",
      glassBg: "rgba(40, 28, 64, 0.55)",
      ambientBase: "#14101f",
    },
  },
  {
    id: "steel",
    name: "Steel Slate",
    description: "Minimal cool greys for a clean, focused app",
    preview: ["#2a3444", "#a8b8c8"],
    animation: "none",
    vars: {
      gradientFrom: "#222c38",
      gradientTo: "#4a5568",
      pageBgTop: "#141820",
      pageBgMid: "#1e2630",
      pageBgBottom: "#2a3444",
      pageBgDeep: "#222c38",
      accent: "#a8b8c8",
      accentTitleMid: "#e8eef4",
      accentSoft: "rgba(168, 184, 200, 0.22)",
      glowAccent: "rgba(168, 184, 200, 0.12)",
      glowSecondary: "rgba(100, 120, 140, 0.16)",
      glassBg: "rgba(36, 44, 56, 0.55)",
      ambientBase: "#141820",
    },
  },
  {
    id: "sunset",
    name: "Sunset Drive",
    description: "Warm peach tones for motivational evening sessions",
    preview: ["#4a2038", "#ff9a6c"],
    animation: "none",
    vars: {
      gradientFrom: "#2a1830",
      gradientTo: "#6a3850",
      pageBgTop: "#1f1018",
      pageBgMid: "#301828",
      pageBgBottom: "#4a2038",
      pageBgDeep: "#2a1830",
      accent: "#ff9a6c",
      accentTitleMid: "#ffe0d0",
      accentSoft: "rgba(255, 154, 108, 0.22)",
      glowAccent: "rgba(255, 154, 108, 0.17)",
      glowSecondary: "rgba(180, 80, 100, 0.15)",
      glassBg: "rgba(56, 28, 44, 0.55)",
      ambientBase: "#1f1018",
    },
  },
  {
    id: "lime",
    name: "Electric Lime",
    description: "Bold sporty green for high-contrast energy",
    preview: ["#1f2e10", "#b8e62e"],
    animation: "none",
    vars: {
      gradientFrom: "#141a0c",
      gradientTo: "#3a5020",
      pageBgTop: "#0f1408",
      pageBgMid: "#182010",
      pageBgBottom: "#1f2e10",
      pageBgDeep: "#141a0c",
      accent: "#b8e62e",
      accentTitleMid: "#e8f8c0",
      accentSoft: "rgba(184, 230, 46, 0.2)",
      glowAccent: "rgba(184, 230, 46, 0.14)",
      glowSecondary: "rgba(80, 120, 40, 0.14)",
      glassBg: "rgba(28, 40, 16, 0.55)",
      ambientBase: "#0f1408",
    },
  },
  {
    id: "aurora-glow",
    name: "Aurora Glow",
    description: "Flowing golden aurora — animated warm light",
    preview: ["#1a2438", "#f0b48a"],
    animation: "aurora",
    vars: {
      gradientFrom: "#283048",
      gradientTo: "#859398",
      pageBgTop: "#0e1420",
      pageBgMid: "#1a2438",
      pageBgBottom: "#283048",
      pageBgDeep: "#1e2838",
      accent: "#f0b48a",
      accentTitleMid: "#fff4ec",
      accentSoft: "rgba(240, 180, 138, 0.28)",
      glowAccent: "rgba(240, 180, 138, 0.35)",
      glowSecondary: "rgba(133, 147, 152, 0.25)",
      glassBg: "rgba(40, 48, 72, 0.5)",
      ambientBase: "#0e1420",
    },
  },
  {
    id: "ocean-tide",
    name: "Ocean Tide",
    description: "Rolling blue waves — calm animated depth",
    preview: ["#0a1628", "#5eb8e8"],
    animation: "waves",
    vars: {
      gradientFrom: "#0d2847",
      gradientTo: "#1a5080",
      pageBgTop: "#060d18",
      pageBgMid: "#0a1628",
      pageBgBottom: "#123050",
      pageBgDeep: "#0a2040",
      accent: "#5eb8e8",
      accentTitleMid: "#c8e8ff",
      accentSoft: "rgba(94, 184, 232, 0.28)",
      glowAccent: "rgba(94, 184, 232, 0.32)",
      glowSecondary: "rgba(40, 100, 160, 0.28)",
      glassBg: "rgba(16, 36, 64, 0.5)",
      ambientBase: "#060d18",
    },
  },
  {
    id: "ember-rise",
    name: "Ember Rise",
    description: "Rising sparks — fiery animated energy",
    preview: ["#1a0a0a", "#ff6b4a"],
    animation: "embers",
    vars: {
      gradientFrom: "#2a1010",
      gradientTo: "#5c2820",
      pageBgTop: "#120606",
      pageBgMid: "#1a0a0a",
      pageBgBottom: "#3d1515",
      pageBgDeep: "#2a1010",
      accent: "#ff6b4a",
      accentTitleMid: "#ffd4c8",
      accentSoft: "rgba(255, 107, 74, 0.3)",
      glowAccent: "rgba(255, 107, 74, 0.35)",
      glowSecondary: "rgba(180, 60, 40, 0.22)",
      glassBg: "rgba(60, 24, 20, 0.5)",
      ambientBase: "#120606",
    },
  },
  {
    id: "nebula-drift",
    name: "Nebula Drift",
    description: "Cosmic purple clouds — slow drifting nebula",
    preview: ["#14101f", "#c9a0ff"],
    animation: "nebula",
    vars: {
      gradientFrom: "#1a1230",
      gradientTo: "#3d2a60",
      pageBgTop: "#0a0814",
      pageBgMid: "#14101f",
      pageBgBottom: "#2d1f4e",
      pageBgDeep: "#1a1230",
      accent: "#c9a0ff",
      accentTitleMid: "#ede0ff",
      accentSoft: "rgba(201, 160, 255, 0.28)",
      glowAccent: "rgba(201, 160, 255, 0.32)",
      glowSecondary: "rgba(120, 60, 200, 0.25)",
      glassBg: "rgba(40, 28, 64, 0.5)",
      ambientBase: "#0a0814",
    },
  },
  {
    id: "sunset-shimmer",
    name: "Sunset Shimmer",
    description: "Sweeping peach light — animated golden hour",
    preview: ["#1f1018", "#ff9a6c"],
    animation: "shimmer",
    vars: {
      gradientFrom: "#2a1830",
      gradientTo: "#6a3850",
      pageBgTop: "#140a10",
      pageBgMid: "#1f1018",
      pageBgBottom: "#4a2038",
      pageBgDeep: "#301828",
      accent: "#ff9a6c",
      accentTitleMid: "#ffe0d0",
      accentSoft: "rgba(255, 154, 108, 0.28)",
      glowAccent: "rgba(255, 154, 108, 0.32)",
      glowSecondary: "rgba(180, 80, 100, 0.22)",
      glassBg: "rgba(56, 28, 44, 0.5)",
      ambientBase: "#140a10",
    },
  },
  {
    id: "cyber-pulse",
    name: "Cyber Pulse",
    description: "Electric cyan pulse — rhythmic animated glow",
    preview: ["#0a1420", "#00e5cc"],
    animation: "pulse",
    vars: {
      gradientFrom: "#0a2030",
      gradientTo: "#1a4050",
      pageBgTop: "#060e14",
      pageBgMid: "#0a1420",
      pageBgBottom: "#0f2838",
      pageBgDeep: "#0a1828",
      accent: "#00e5cc",
      accentTitleMid: "#b8fff5",
      accentSoft: "rgba(0, 229, 204, 0.25)",
      glowAccent: "rgba(0, 229, 204, 0.35)",
      glowSecondary: "rgba(0, 120, 160, 0.22)",
      glassBg: "rgba(16, 40, 56, 0.5)",
      ambientBase: "#060e14",
    },
  },
  {
    id: "violet-mist",
    name: "Violet Mist",
    description: "Soft lavender fog — gentle animated aurora",
    preview: ["#1a1230", "#e8b4ff"],
    animation: "aurora",
    vars: {
      gradientFrom: "#201838",
      gradientTo: "#483068",
      pageBgTop: "#100818",
      pageBgMid: "#1a1230",
      pageBgBottom: "#302050",
      pageBgDeep: "#201838",
      accent: "#e8b4ff",
      accentTitleMid: "#f5e0ff",
      accentSoft: "rgba(232, 180, 255, 0.28)",
      glowAccent: "rgba(232, 180, 255, 0.3)",
      glowSecondary: "rgba(140, 80, 200, 0.22)",
      glassBg: "rgba(48, 32, 72, 0.5)",
      ambientBase: "#100818",
    },
  },
];

export function getThemePreset(id: string): ThemePreset {
  return (
    themePresets.find((p) => p.id === id) ??
    themePresets.find((p) => p.id === DEFAULT_THEME_PRESET_ID)!
  );
}

export function isValidThemePresetId(id: string): id is ThemePresetId {
  return THEME_PRESET_IDS.includes(id as ThemePresetId);
}
