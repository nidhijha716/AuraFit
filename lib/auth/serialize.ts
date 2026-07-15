import type { User } from "@prisma/client";
import { isValidThemePresetId } from "@/lib/config/themePresets";
import type {
  ActivityLevel,
  ExperienceLevel,
  FitnessGoal,
  Sex,
  UserProfile,
} from "@/lib/types";

const VALID_SEX: Sex[] = ["male", "female", "prefer_not_to_say"];
const VALID_ACTIVITY: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];

export function parseSex(value: string | null | undefined): Sex | null {
  if (!value) return null;
  return VALID_SEX.includes(value as Sex) ? (value as Sex) : null;
}

export function parseActivityLevel(
  value: string | null | undefined
): ActivityLevel | null {
  if (!value) return null;
  return VALID_ACTIVITY.includes(value as ActivityLevel)
    ? (value as ActivityLevel)
    : null;
}

export function parseGoals(json: string): FitnessGoal[] {
  try {
    const parsed = JSON.parse(json) as FitnessGoal[];
    return Array.isArray(parsed) ? parsed : ["stay_active"];
  } catch {
    return ["stay_active"];
  }
}

export function parseWorkoutDays(json: string): number[] {
  try {
    const parsed = JSON.parse(json) as number[];
    return Array.isArray(parsed) ? parsed : [1, 3, 5];
  } catch {
    return [1, 3, 5];
  }
}

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    goals: parseGoals(user.goals),
    experienceLevel: user.experienceLevel as ExperienceLevel,
    workoutDays: parseWorkoutDays(user.workoutDays),
    onboardingComplete: user.onboardingComplete,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    sex: parseSex(user.sex),
    age: user.age,
    activityLevel: parseActivityLevel(user.activityLevel),
    themePreset: isValidThemePresetId(user.themePreset)
      ? user.themePreset
      : "classic",
    reminderEnabled: user.reminderEnabled,
    reminderTimeLocal: user.reminderTimeLocal || "18:00",
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeJsonArray<T>(value: T[]): string {
  return JSON.stringify(value);
}
