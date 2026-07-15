"use client";

import { create } from "zustand";
import { DEFAULT_REST_SECONDS } from "@/lib/types";

interface RestTimerState {
  active: boolean;
  secondsLeft: number;
  totalSeconds: number;
  label: string;
  start: (seconds?: number, label?: string) => void;
  tick: () => void;
  cancel: () => void;
  addTime: (seconds: number) => void;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

function clearTick() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export const useRestTimerStore = create<RestTimerState>((set, get) => ({
  active: false,
  secondsLeft: 0,
  totalSeconds: DEFAULT_REST_SECONDS,
  label: "Rest",

  start: (seconds = DEFAULT_REST_SECONDS, label = "Rest between sets") => {
    clearTick();
    const total = Math.max(5, Math.round(seconds));
    set({
      active: true,
      secondsLeft: total,
      totalSeconds: total,
      label,
    });
    intervalId = setInterval(() => {
      get().tick();
    }, 1000);
  },

  tick: () => {
    const left = get().secondsLeft - 1;
    if (left <= 0) {
      clearTick();
      set({ active: false, secondsLeft: 0 });
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.(200);
        } catch {
          /* ignore */
        }
      }
      return;
    }
    set({ secondsLeft: left });
  },

  cancel: () => {
    clearTick();
    set({ active: false, secondsLeft: 0 });
  },

  addTime: (seconds) => {
    if (!get().active) return;
    set((s) => ({
      secondsLeft: s.secondsLeft + seconds,
      totalSeconds: s.totalSeconds + seconds,
    }));
  },
}));
