import type {
  ActivityLevel,
  FitnessGoal,
  Sex,
} from "@/lib/types";
import {
  ACTIVITY_LEVEL_OPTIONS,
} from "@/lib/types";
import type { CalorieProfileInput } from "@/lib/utils/calories";
import { hasCompleteCalorieProfile } from "@/lib/utils/calories";

const GUEST_BODY_KEY = "aurafit-guest-body";

export interface GuestBodyProfile {
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  goals: FitnessGoal[];
}

export function emptyGuestBodyProfile(): GuestBodyProfile {
  return {
    age: null,
    sex: null,
    heightCm: null,
    weightKg: null,
    activityLevel: null,
    goals: ["stay_active"],
  };
}

export function loadGuestBodyProfile(): GuestBodyProfile {
  if (typeof window === "undefined") return emptyGuestBodyProfile();
  try {
    const raw = localStorage.getItem(GUEST_BODY_KEY);
    if (!raw) return emptyGuestBodyProfile();
    const parsed = JSON.parse(raw) as Partial<GuestBodyProfile>;
    const activity =
      parsed.activityLevel &&
      ACTIVITY_LEVEL_OPTIONS.includes(parsed.activityLevel)
        ? parsed.activityLevel
        : null;
    return {
      age: typeof parsed.age === "number" ? parsed.age : null,
      sex: parsed.sex ?? null,
      heightCm: typeof parsed.heightCm === "number" ? parsed.heightCm : null,
      weightKg: typeof parsed.weightKg === "number" ? parsed.weightKg : null,
      activityLevel: activity,
      goals: Array.isArray(parsed.goals) && parsed.goals.length > 0
        ? parsed.goals
        : ["stay_active"],
    };
  } catch {
    return emptyGuestBodyProfile();
  }
}

export function saveGuestBodyProfile(profile: GuestBodyProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_BODY_KEY, JSON.stringify(profile));
}

export function clearGuestBodyProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_BODY_KEY);
}

export function guestBodyToCalorieInput(
  profile: GuestBodyProfile
): CalorieProfileInput | null {
  const candidate = {
    age: profile.age ?? undefined,
    sex: profile.sex ?? undefined,
    heightCm: profile.heightCm ?? undefined,
    weightKg: profile.weightKg ?? undefined,
    activityLevel: profile.activityLevel ?? undefined,
    goals: profile.goals,
  };
  return hasCompleteCalorieProfile(candidate) ? candidate : null;
}
