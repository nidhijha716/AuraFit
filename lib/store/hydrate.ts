"use client";

import { useEffect } from "react";
import { useUserStore } from "@/lib/store/userStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { useRoutineStore } from "@/lib/store/routineStore";

export function useHydrateStores() {
  const validateSession = useUserStore((s) => s.validateSession);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) {
      void validateSession();
    }
  }, [hasHydrated, validateSession]);
}

export function useStoresHydrated(): boolean {
  const userHydrated = useUserStore((s) => s._hasHydrated);
  const authChecked = useUserStore((s) => s._authChecked);
  const workoutHydrated = useWorkoutStore((s) => s._hasHydrated);
  const routineHydrated = useRoutineStore((s) => s._hasHydrated);
  return userHydrated && authChecked && workoutHydrated && routineHydrated;
}
