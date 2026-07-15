"use client";

import { create } from "zustand";
import { apiFetch } from "@/lib/api/client";
import { loadUserFitnessData } from "@/lib/api/userData";
import {
  enterGuestMode,
  migrateGuestDataToAccount,
} from "@/lib/store/fitnessPersistence";
import { useRoutineStore } from "@/lib/store/routineStore";
import { useThemeStore, getGuestThemeIdForMigration } from "@/lib/store/themeStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { DEFAULT_THEME_PRESET_ID } from "@/lib/config/themePresets";
import type {
  ActivityLevel,
  ExperienceLevel,
  FitnessGoal,
  Sex,
  UserProfile,
} from "@/lib/types";

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  _hasHydrated: boolean;
  _authChecked: boolean;
  setHasHydrated: (value: boolean) => void;
  setAuthChecked: (value: boolean) => void;
  validateSession: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: {
    name: string;
    goals: FitnessGoal[];
    experienceLevel: ExperienceLevel;
    workoutDays: number[];
    heightCm: number;
    weightKg: number;
    sex: Sex;
    age: number;
    activityLevel: ActivityLevel;
  }) => Promise<void>;
}

function markStoresHydrated() {
  useRoutineStore.getState().setHasHydrated(true);
  useWorkoutStore.getState().setHasHydrated(true);
}

async function syncThemeAfterAuth(user: UserProfile) {
  const guestTheme = getGuestThemeIdForMigration();
  if (
    guestTheme !== DEFAULT_THEME_PRESET_ID &&
    (!user.themePreset || user.themePreset === DEFAULT_THEME_PRESET_ID)
  ) {
    await useThemeStore.getState().setPresetId(guestTheme);
    return;
  }
  useThemeStore.getState().loadFromUserOrGuest(user.themePreset);
}

export const useUserStore = create<UserState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isGuest: true,
  _hasHydrated: false,
  _authChecked: false,
  setHasHydrated: (value) => set({ _hasHydrated: value }),
  setAuthChecked: (value) => set({ _authChecked: value }),

  validateSession: async () => {
    try {
      const data = await apiFetch<{ user: UserProfile }>("/api/auth/me");
      set({
        user: data.user,
        isAuthenticated: true,
        isGuest: false,
      });
      await loadUserFitnessData();
      useThemeStore.getState().loadFromUserOrGuest(data.user.themePreset);
      return true;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isGuest: true,
      });
      useRoutineStore.getState().resetForLogout();
      useWorkoutStore.getState().resetForLogout();
      enterGuestMode();
      useThemeStore.getState().loadFromUserOrGuest(null);
      return false;
    } finally {
      set({ _authChecked: true, _hasHydrated: true });
      markStoresHydrated();
    }
  },

  login: async (email, password) => {
    const data = await apiFetch<{ user: UserProfile }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    set({
      user: data.user,
      isAuthenticated: true,
      isGuest: false,
      _authChecked: true,
      _hasHydrated: true,
    });
    await migrateGuestDataToAccount();
    await loadUserFitnessData();
    await syncThemeAfterAuth(data.user);
    markStoresHydrated();
  },

  signup: async (email, password, name) => {
    const data = await apiFetch<{ user: UserProfile }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    set({
      user: data.user,
      isAuthenticated: true,
      isGuest: false,
      _authChecked: true,
      _hasHydrated: true,
    });
    await migrateGuestDataToAccount();
    await loadUserFitnessData();
    await syncThemeAfterAuth(data.user);
    markStoresHydrated();
  },

  logout: async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* clear client state even if network fails */
    }

    useRoutineStore.getState().resetForLogout();
    useWorkoutStore.getState().resetForLogout();
    enterGuestMode();
    useThemeStore.getState().resetForLogout();

    set({
      user: null,
      isAuthenticated: false,
      isGuest: true,
      _hasHydrated: true,
      _authChecked: true,
    });
    markStoresHydrated();
  },

  updateProfile: async (updates) => {
    const data = await apiFetch<{ user: UserProfile }>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    set({ user: data.user });
  },

  completeOnboarding: async (data) => {
    await get().updateProfile({
      name: data.name,
      goals: data.goals,
      experienceLevel: data.experienceLevel,
      workoutDays: data.workoutDays,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      sex: data.sex,
      age: data.age,
      activityLevel: data.activityLevel,
      onboardingComplete: true,
    });
  },
}));
