"use client";

import type { DetailedMuscle } from "@/lib/utils/detailedMuscles";
import { cn } from "@/lib/utils/cn";

interface MuscleBodyDiagramProps {
  intensity?: Partial<Record<DetailedMuscle, number>>;
  highlight?: DetailedMuscle;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-16 w-24",
  md: "h-28 w-40",
  lg: "h-48 w-72",
};

function muscleFill(
  muscle: DetailedMuscle,
  intensity: Partial<Record<DetailedMuscle, number>>,
  highlight?: DetailedMuscle
) {
  const level = intensity[muscle] ?? 0;
  if (highlight && highlight === muscle) return "rgba(240, 180, 138, 0.95)";
  if (level >= 0.75) return "rgba(240, 120, 90, 0.9)";
  if (level >= 0.45) return "rgba(240, 180, 138, 0.75)";
  if (level > 0) return "rgba(240, 200, 160, 0.55)";
  return "rgba(255, 255, 255, 0.08)";
}

function BodyFigure({
  intensity,
  highlight,
  view,
}: {
  intensity: Partial<Record<DetailedMuscle, number>>;
  highlight?: DetailedMuscle;
  view: "front" | "back";
}) {
  const f = (m: DetailedMuscle) => muscleFill(m, intensity, highlight);

  if (view === "front") {
    return (
      <svg viewBox="0 0 80 120" className="h-full w-full" aria-hidden>
        {/* head / neck */}
        <ellipse cx="40" cy="12" rx="9" ry="11" fill="rgba(255,255,255,0.12)" />
        <ellipse cx="40" cy="24" rx="5" ry="4" fill={f("neck")} />

        {/* upper chest + mid chest */}
        <ellipse cx="40" cy="34" rx="15" ry="7" fill={f("upper_chest")} />
        <ellipse cx="40" cy="44" rx="17" ry="9" fill={f("chest")} />

        {/* shoulders */}
        <ellipse cx="20" cy="36" rx="7" ry="8" fill={f("shoulders")} />
        <ellipse cx="60" cy="36" rx="7" ry="8" fill={f("shoulders")} />

        {/* biceps */}
        <ellipse cx="13" cy="50" rx="5" ry="10" fill={f("biceps")} />
        <ellipse cx="67" cy="50" rx="5" ry="10" fill={f("biceps")} />

        {/* forearms */}
        <ellipse cx="10" cy="68" rx="4" ry="9" fill={f("forearms")} />
        <ellipse cx="70" cy="68" rx="4" ry="9" fill={f("forearms")} />

        {/* abs */}
        <rect x="29" y="52" width="22" height="20" rx="5" fill={f("abdominals")} />

        {/* adductors (inner thigh hint) */}
        <ellipse cx="36" cy="82" rx="4" ry="10" fill={f("adductors")} />
        <ellipse cx="44" cy="82" rx="4" ry="10" fill={f("adductors")} />

        {/* quads */}
        <ellipse cx="28" cy="88" rx="8" ry="18" fill={f("quadriceps")} />
        <ellipse cx="52" cy="88" rx="8" ry="18" fill={f("quadriceps")} />

        {/* calves front */}
        <ellipse cx="27" cy="110" rx="5" ry="8" fill={f("calves")} />
        <ellipse cx="53" cy="110" rx="5" ry="8" fill={f("calves")} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 120" className="h-full w-full" aria-hidden>
      <ellipse cx="40" cy="12" rx="9" ry="11" fill="rgba(255,255,255,0.12)" />
      <ellipse cx="40" cy="24" rx="5" ry="4" fill={f("neck")} />

      {/* traps */}
      <ellipse cx="40" cy="32" rx="14" ry="6" fill={f("traps")} />

      {/* shoulders rear */}
      <ellipse cx="20" cy="36" rx="7" ry="8" fill={f("shoulders")} />
      <ellipse cx="60" cy="36" rx="7" ry="8" fill={f("shoulders")} />

      {/* lats / middle back */}
      <ellipse cx="40" cy="44" rx="16" ry="10" fill={f("lats")} />
      <ellipse cx="40" cy="50" rx="12" ry="7" fill={f("middle_back")} />

      {/* triceps */}
      <ellipse cx="13" cy="50" rx="5" ry="10" fill={f("triceps")} />
      <ellipse cx="67" cy="50" rx="5" ry="10" fill={f("triceps")} />

      {/* forearms rear */}
      <ellipse cx="10" cy="68" rx="4" ry="9" fill={f("forearms")} />
      <ellipse cx="70" cy="68" rx="4" ry="9" fill={f("forearms")} />

      {/* lower back */}
      <rect x="30" y="56" width="20" height="12" rx="4" fill={f("lower_back")} />

      {/* glutes */}
      <ellipse cx="40" cy="74" rx="14" ry="8" fill={f("glutes")} />

      {/* abductors (outer hip) */}
      <ellipse cx="22" cy="78" rx="5" ry="8" fill={f("abductors")} />
      <ellipse cx="58" cy="78" rx="5" ry="8" fill={f("abductors")} />

      {/* hamstrings */}
      <ellipse cx="28" cy="92" rx="8" ry="16" fill={f("hamstrings")} />
      <ellipse cx="52" cy="92" rx="8" ry="16" fill={f("hamstrings")} />

      {/* calves rear */}
      <ellipse cx="27" cy="112" rx="5" ry="7" fill={f("calves")} />
      <ellipse cx="53" cy="112" rx="5" ry="7" fill={f("calves")} />
    </svg>
  );
}

export function MuscleBodyDiagram({
  intensity = {},
  highlight,
  size = "md",
  className,
}: MuscleBodyDiagramProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 rounded-xl bg-black/20 p-1 ring-1 ring-white/10",
        sizeMap[size],
        className
      )}
    >
      <BodyFigure intensity={intensity} highlight={highlight} view="front" />
      <BodyFigure intensity={intensity} highlight={highlight} view="back" />
    </div>
  );
}
