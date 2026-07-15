import type { UserProfile } from "@/lib/types";
import {
  guestBodyToCalorieInput,
  loadGuestBodyProfile,
} from "@/lib/store/guestBodyProfile";
import {
  hasCompleteCalorieProfile,
  type CalorieProfileInput,
} from "@/lib/utils/calories";

/** Resolve calorie profile from logged-in user or temporary guest body data. */
export function resolveCalorieProfile(
  user: UserProfile | null,
  isGuest: boolean
): CalorieProfileInput | null {
  if (!isGuest && user) {
    const candidate = {
      age: user.age ?? undefined,
      sex: user.sex ?? undefined,
      heightCm: user.heightCm ?? undefined,
      weightKg: user.weightKg ?? undefined,
      activityLevel: user.activityLevel ?? undefined,
      goals: user.goals ?? [],
    };
    if (hasCompleteCalorieProfile(candidate)) return candidate;
  }

  if (isGuest) {
    return guestBodyToCalorieInput(loadGuestBodyProfile());
  }

  return null;
}
