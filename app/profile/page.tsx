"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, LogOut, User } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { MobileShell } from "@/components/layout/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { PageTransition } from "@/components/ui/PageTransition";
import { useUserStore } from "@/lib/store/userStore";
import {
  EXPERIENCE_LABELS,
  FITNESS_GOAL_LABELS,
  DAY_LABELS,
  ACTIVITY_LEVEL_HINTS,
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVEL_OPTIONS,
  SEX_LABELS,
  SEX_OPTIONS,
  type ActivityLevel,
  type Sex,
} from "@/lib/types";
import {
  BMI_CATEGORY_LABELS,
  calculateBmi,
  getBmiCategory,
  isValidHeightCm,
  isValidWeightKg,
} from "@/lib/utils/bmi";
import { isValidAge } from "@/lib/utils/calories";
import { cn } from "@/lib/utils/cn";

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const updateProfile = useUserStore((s) => s.updateProfile);

  const [name, setName] = useState(user?.name ?? "");
  const [sex, setSex] = useState<Sex | null>(user?.sex ?? null);
  const [age, setAge] = useState(user?.age != null ? String(user.age) : "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    user?.activityLevel ?? null
  );
  const [heightCm, setHeightCm] = useState(
    user?.heightCm != null ? String(user.heightCm) : ""
  );
  const [weightKg, setWeightKg] = useState(
    user?.weightKg != null ? String(user.weightKg) : ""
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heightNum = Number(heightCm);
  const weightNum = Number(weightKg);
  const ageNum = Number(age);
  const bmi = useMemo(
    () =>
      isValidHeightCm(heightNum) && isValidWeightKg(weightNum)
        ? calculateBmi(heightNum, weightNum)
        : null,
    [heightNum, weightNum]
  );

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Display name is required.");
      return;
    }
    if (age !== "" && !isValidAge(ageNum)) {
      setError("Age must be a whole number between 13 and 100.");
      return;
    }
    if (heightCm !== "" && !isValidHeightCm(heightNum)) {
      setError("Height must be between 100–250 cm.");
      return;
    }
    if (weightKg !== "" && !isValidWeightKg(weightNum)) {
      setError("Weight must be between 30–300 kg.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        ...(sex ? { sex } : {}),
        ...(age !== "" ? { age: ageNum } : {}),
        ...(activityLevel ? { activityLevel } : {}),
        ...(heightCm !== "" ? { heightCm: heightNum } : {}),
        ...(weightKg !== "" ? { weightKg: weightNum } : {}),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <MobileShell>
        <PageTransition>
          <PageHeader title="Profile" subtitle="Manage your account" />

          <GlassCard className="mb-4 flex items-center gap-4">
            <span className="aura-icon flex h-16 w-16 items-center justify-center rounded-2xl">
              <User className="h-8 w-8 text-accent" />
            </span>
            <div>
              <p className="text-lg font-bold text-text-primary">{user.name}</p>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
          </GlassCard>

          <GlassCard className="mb-4 space-y-4">
            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
                min={100}
                max={250}
                placeholder="e.g. 170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
              <Input
                label="Weight (kg)"
                type="number"
                inputMode="decimal"
                min={30}
                max={300}
                placeholder="e.g. 70"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-white/72">
                Activity level
              </p>
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
                    <span className="font-medium">
                      {ACTIVITY_LEVEL_LABELS[level]}
                    </span>
                    <span className="mt-0.5 block text-xs opacity-70">
                      {ACTIVITY_LEVEL_HINTS[level]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {bmi != null && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wider text-white/50">
                  BMI
                </p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{bmi}</p>
                <p className="text-sm text-accent">
                  {BMI_CATEGORY_LABELS[getBmiCategory(bmi)]}
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button fullWidth onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
            </Button>
          </GlassCard>

          <GlassCard className="mb-4 space-y-3">
            <h3 className="font-semibold text-text-primary">Your Preferences</h3>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Goals</span>
              <span className="font-medium text-text-primary">
                {user.goals.map((g) => FITNESS_GOAL_LABELS[g]).join(", ")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Experience</span>
              <span className="font-medium text-text-primary">
                {EXPERIENCE_LABELS[user.experienceLevel]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Workout Days</span>
              <span className="font-medium text-text-primary">
                {user.workoutDays.map((d) => DAY_LABELS[d]).join(", ")}
              </span>
            </div>
            {user.sex && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Sex</span>
                <span className="font-medium text-text-primary">
                  {SEX_LABELS[user.sex]}
                </span>
              </div>
            )}
            {user.age != null && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Age</span>
                <span className="font-medium text-text-primary">{user.age}</span>
              </div>
            )}
            {user.activityLevel && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Activity</span>
                <span className="font-medium text-text-primary">
                  {ACTIVITY_LEVEL_LABELS[user.activityLevel]}
                </span>
              </div>
            )}
            {user.heightCm != null && user.weightKg != null && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Height / Weight</span>
                <span className="font-medium text-text-primary">
                  {user.heightCm} cm · {user.weightKg} kg
                </span>
              </div>
            )}
          </GlassCard>

          <Link href="/schedule" className="mb-4 block">
            <GlassCard padding="sm" hover className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-accent" />
              <div className="flex-1">
                <p className="font-medium text-text-primary">Weekly Schedule</p>
                <p className="text-xs text-text-muted">
                  Edit your day-by-day routines
                </p>
              </div>
            </GlassCard>
          </Link>

          <Button
            variant="outline"
            fullWidth
            onClick={handleLogout}
            className="text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </PageTransition>
      </MobileShell>
    </AuthGuard>
  );
}
