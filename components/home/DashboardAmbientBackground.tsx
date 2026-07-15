"use client";

import { getThemePreset } from "@/lib/config/themePresets";
import { useThemeStore } from "@/lib/store/themeStore";
import { ThemeAnimatedLayer } from "@/components/theme/ThemeAnimatedLayer";

/**
 * Dark gradient dashboard backdrop with subtle fitness-themed line art (~3.5% opacity).
 */
export function DashboardAmbientBackground() {
  const presetId = useThemeStore((s) => s.presetId);
  const preset = getThemePreset(presetId);
  const faint = 0.035;
  const softer = faint * 0.75;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: "var(--ambient-base)" }}
      aria-hidden
    >
      <div className="absolute inset-0 aura-page-bg" />
      <ThemeAnimatedLayer animation={preset.animation} />

      <svg
        className="absolute inset-0 h-full w-full text-[var(--accent)]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="ambient-grid"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity={softer}
            />
            <circle
              cx="50"
              cy="50"
              r="22"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity={softer * 0.8}
            />
          </pattern>
        </defs>

        <rect width="1440" height="900" fill="url(#ambient-grid)" />

        <g fill="none" stroke="currentColor" strokeWidth="1" opacity={faint}>
          <circle cx="160" cy="160" r="90" />
          <circle cx="1280" cy="200" r="120" />
          <circle cx="1080" cy="700" r="70" />
          <circle cx="280" cy="650" r="55" />
          <circle cx="720" cy="450" r="180" strokeDasharray="8 14" />
        </g>

        <g
          fill="none"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity={faint * 1.15}
        >
          <path d="M 80 420 Q 200 280 340 380" />
          <path d="M 900 180 Q 1020 320 1140 220" />
          <path d="M 200 780 Q 380 650 520 760" />
          <path d="M 1050 620 Q 920 520 800 640" />
          <path d="M 600 120 Q 720 200 640 320" />
        </g>

        <g fill="none" stroke="white" strokeWidth="1.5" opacity={faint * 1.3}>
          <g transform="translate(120, 140) rotate(-12)">
            <line x1="26" y1="21" x2="74" y2="21" strokeWidth="6" strokeLinecap="round" />
            <circle cx="14" cy="21" r="12" />
            <circle cx="14" cy="21" r="7" />
            <circle cx="86" cy="21" r="12" />
            <circle cx="86" cy="21" r="7" />
          </g>
          <g transform="translate(1050, 380) rotate(18)">
            <line x1="26" y1="21" x2="74" y2="21" strokeWidth="6" strokeLinecap="round" />
            <circle cx="14" cy="21" r="12" />
            <circle cx="86" cy="21" r="12" />
          </g>
          <g transform="translate(280, 720) rotate(-8) scale(1.2)">
            <line x1="26" y1="21" x2="74" y2="21" strokeWidth="6" strokeLinecap="round" />
            <circle cx="14" cy="21" r="12" />
            <circle cx="86" cy="21" r="12" />
          </g>
        </g>

        <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity={faint}>
          <g transform="translate(920, 120)">
            <circle cx="20" cy="8" r="8" />
            <path d="M 20 16 L 20 48 M 20 28 L 4 40 M 20 28 L 36 36 M 20 48 L 8 68 M 20 48 L 32 62" />
          </g>
          <g transform="translate(160, 520)">
            <circle cx="24" cy="10" r="9" />
            <path d="M 24 19 L 24 55 M 24 30 L 8 22 M 24 30 L 40 18 M 8 22 Q 2 8 18 4" />
            <path d="M 40 18 Q 52 6 58 20 L 62 24" />
          </g>
          <g transform="translate(640, 680) scale(1.1)">
            <circle cx="22" cy="8" r="8" />
            <path d="M 22 16 L 22 42 M 22 26 L 38 20 M 22 42 L 10 62 M 22 42 L 40 58" />
          </g>
        </g>

        <g stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity={softer}>
          <line x1="140" y1="315" x2="310" y2="290" />
          <line x1="1120" y1="405" x2="1290" y2="378" />
          <line x1="650" y1="790" x2="830" y2="765" />
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% -8%, var(--glow-accent) 0%, transparent 58%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 100% 100%, var(--glow-secondary) 0%, transparent 52%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 40%, rgba(8,10,14,0.45) 100%)",
        }}
      />
    </div>
  );
}
