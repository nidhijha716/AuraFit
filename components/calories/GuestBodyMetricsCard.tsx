"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import {
  ACTIVITY_LEVEL_HINTS,
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVEL_OPTIONS,
  SEX_LABELS,
  SEX_OPTIONS,
  type ActivityLevel,
  type FitnessGoal,
  type Sex,
} from "@/lib/types";
import {
  emptyGuestBodyProfile,
  loadGuestBodyProfile,
  saveGuestBodyProfile,
  type GuestBodyProfile,
} from "@/lib/store/guestBodyProfile";
import {
  isValidHeightCm,
  isValidWeightKg,
} from "@/lib/utils/bmi";
import { isValidAge } from "@/lib/utils/calories";
import { cn } from "@/lib/utils/cn";

interface GuestBodyMetricsCardProps {
  onSaved?: () => void;
}

export function GuestBodyMetricsCard({ onSaved }: GuestBodyMetricsCardProps) {
  const initial = loadGuestBodyProfile();
  const [age, setAge] = useState(initial.age != null ? String(initial.age) : "");
  const [sex, setSex] = useState<Sex | null>(initial.sex);
  const [heightCm, setHeightCm] = useState(
    initial.heightCm != null ? String(initial.heightCm) : ""
  );
  const [weightKg, setWeightKg] = useState(
    initial.weightKg != null ? String(initial.weightKg) : ""
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    initial.activityLevel
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    const ageNum = Number(age);
    const heightNum = Number(heightCm);
    const weightNum = Number(weightKg);

    if (!isValidAge(ageNum)) {
      setError("Age must be a whole number between 13 and 100.");
      return;
    }
    if (!sex) {
      setError("Please select sex.");
      return;
    }
    if (!isValidHeightCm(heightNum) || !isValidWeightKg(weightNum)) {
      setError("Enter height (100–250 cm) and weight (30–300 kg).");
      return;
    }
    if (!activityLevel) {
      setError("Please select an activity level.");
      return;
    }

    const profile: GuestBodyProfile = {
      ...emptyGuestBodyProfile(),
      age: ageNum,
      sex,
      heightCm: heightNum,
      weightKg: weightNum,
      activityLevel,
      goals: (initial.goals?.length
        ? initial.goals
        : ["stay_active"]) as FitnessGoal[],
    };
    saveGuestBodyProfile(profile);
    setSaved(true);
    onSaved?.();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <GlassCard className="space-y-4">
      <div>
        <h3 className="font-semibold text-text-primary">
          Body stats for calorie estimates
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          Guests: saved only on this device (temporary). Not synced to an
          account until you sign up.
        </p>
      </div>

      <Input
        label="Age"
        type="number"
        inputMode="numeric"
        min={13}
        max={100}
        placeholder="e.g. 28"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-white/72">Sex</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {SEX_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSex(option)}
              className={cn(
                "rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                sex === option
                  ? "aura-choice-selected"
                  : "glass text-text-primary hover:bg-[var(--glass-hover)]"
              )}
            >
              {SEX_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Height (cm)"
          type="number"
          inputMode="decimal"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
        />
        <Input
          label="Weight (kg)"
          type="number"
          inputMode="decimal"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-white/72">Activity level</p>
        <div className="grid gap-2">
          {ACTIVITY_LEVEL_OPTIONS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActivityLevel(level)}
              className={cn(
                "rounded-2xl px-3 py-2.5 text-left text-sm transition-all",
                activityLevel === level
                  ? "aura-choice-selected"
                  : "glass text-text-primary hover:bg-[var(--glass-hover)]"
              )}
            >
              <span className="font-medium">{ACTIVITY_LEVEL_LABELS[level]}</span>
              <span className="mt-0.5 block text-xs opacity-70">
                {ACTIVITY_LEVEL_HINTS[level]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button fullWidth onClick={handleSave}>
        {saved ? "Saved!" : "Save for calorie estimates"}
      </Button>
    </GlassCard>
  );
}
