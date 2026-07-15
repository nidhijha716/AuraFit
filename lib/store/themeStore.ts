"use client";

import { create } from "zustand";
import { apiFetch } from "@/lib/api/client";
import {
  DEFAULT_THEME_PRESET_ID,
  isValidThemePresetId,
  type ThemePresetId,
} from "@/lib/config/themePresets";
import { applyThemePresetById } from "@/lib/theme/applyTheme";
import { useUserStore } from "@/lib/store/userStore";

const GUEST_THEME_KEY = "aurafit-guest-theme";

interface ThemeState {
  presetId: ThemePresetId;
  setPresetId: (id: ThemePresetId, options?: { persist?: boolean }) => Promise<void>;
  loadFromUserOrGuest: (userPresetId?: string | null) => void;
  resetForLogout: () => void;
}

function loadGuestThemeId(): ThemePresetId {
  if (typeof window === "undefined") return DEFAULT_THEME_PRESET_ID;
  try {
    const stored = localStorage.getItem(GUEST_THEME_KEY);
    if (stored && isValidThemePresetId(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME_PRESET_ID;
}

function saveGuestThemeId(id: ThemePresetId): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_THEME_KEY, id);
}

export const useThemeStore = create<ThemeState>()((set) => ({
  presetId: DEFAULT_THEME_PRESET_ID,

  setPresetId: async (id, options = { persist: true }) => {
    set({ presetId: id });
    applyThemePresetById(id);

    if (!options.persist) return;

    const isAuthenticated = useUserStore.getState().isAuthenticated;
    if (isAuthenticated) {
      try {
        await apiFetch("/api/auth/me", {
          method: "PATCH",
          body: JSON.stringify({ themePreset: id }),
        });
        const user = useUserStore.getState().user;
        if (user) {
          useUserStore.setState({ user: { ...user, themePreset: id } });
        }
      } catch (err) {
        console.error("Failed to save theme", err);
      }
    } else {
      saveGuestThemeId(id);
    }
  },

  loadFromUserOrGuest: (userPresetId) => {
    const isAuthenticated = useUserStore.getState().isAuthenticated;
    const id =
      isAuthenticated && userPresetId && isValidThemePresetId(userPresetId)
        ? userPresetId
        : loadGuestThemeId();

    set({ presetId: id });
    applyThemePresetById(id);
  },

  resetForLogout: () => {
    const id = loadGuestThemeId();
    set({ presetId: id });
    applyThemePresetById(id);
  },
}));

export function getGuestThemeIdForMigration(): ThemePresetId {
  return loadGuestThemeId();
}

export function clearGuestThemeStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_THEME_KEY);
}
