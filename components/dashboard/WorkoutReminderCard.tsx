"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useUserStore } from "@/lib/store/userStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { getTodayDayOfWeek, toDateKey } from "@/lib/utils/dateKey";
import {
  loadGuestReminderPrefs,
  saveGuestReminderPrefs,
} from "@/lib/utils/reminders";

const NOTIFIED_KEY = "aurafit-reminder-notified";

function alreadyNotifiedToday(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(NOTIFIED_KEY) === toDateKey();
}

function markNotifiedToday() {
  localStorage.setItem(NOTIFIED_KEY, toDateKey());
}

async function ensurePermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function WorkoutReminderCard() {
  const user = useUserStore((s) => s.user);
  const isGuest = useUserStore((s) => s.isGuest);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const sessions = useWorkoutStore((s) => s.sessions);
  const [guestEnabled, setGuestEnabled] = useState(false);
  const [guestTime, setGuestTime] = useState("18:00");
  const [status, setStatus] = useState<string | null>(null);
  const armed = useRef(false);

  useEffect(() => {
    if (isGuest) {
      const prefs = loadGuestReminderPrefs();
      setGuestEnabled(prefs.enabled);
      setGuestTime(prefs.timeLocal);
    }
  }, [isGuest]);

  const enabled = isGuest
    ? guestEnabled
    : Boolean(user?.reminderEnabled);
  const timeLocal = isGuest
    ? guestTime
    : user?.reminderTimeLocal || "18:00";
  const workoutDays = useMemo(
    () =>
      user?.workoutDays?.length && user.workoutDays.length > 0
        ? user.workoutDays
        : [1, 3, 5],
    [user?.workoutDays]
  );

  useEffect(() => {
    if (!enabled || armed.current) return;
    armed.current = true;

    const tick = () => {
      const today = getTodayDayOfWeek();
      if (!workoutDays.includes(today)) return;
      if (alreadyNotifiedToday()) return;

      const trainedToday = sessions.some((s) =>
        s.completedAt.startsWith(toDateKey())
      );
      if (trainedToday) return;

      const [hh, mm] = timeLocal.split(":").map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(hh || 18, mm || 0, 0, 0);
      if (now < target) return;

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("AuraFit — training day", {
            body: "Today is on your plan. Open the app and knock out your workout.",
            tag: `aurafit-${toDateKey()}`,
          });
          markNotifiedToday();
        } catch {
          /* ignore */
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [enabled, timeLocal, workoutDays, sessions]);

  const handleEnable = async () => {
    const ok = await ensurePermission();
    if (!ok) {
      setStatus(
        "Notifications are blocked in this browser. Enable them in site settings."
      );
      return;
    }
    if (isGuest) {
      saveGuestReminderPrefs({ enabled: true, timeLocal: guestTime });
      setGuestEnabled(true);
    } else {
      await updateProfile({
        reminderEnabled: true,
        reminderTimeLocal: timeLocal,
      });
    }
    setStatus("Reminders on for your workout days.");
  };

  const handleDisable = async () => {
    if (isGuest) {
      saveGuestReminderPrefs({ enabled: false, timeLocal: guestTime });
      setGuestEnabled(false);
    } else {
      await updateProfile({ reminderEnabled: false });
    }
    setStatus("Reminders turned off.");
  };

  const handleTimeChange = async (value: string) => {
    if (isGuest) {
      setGuestTime(value);
      saveGuestReminderPrefs({ enabled: guestEnabled, timeLocal: value });
    } else {
      await updateProfile({ reminderTimeLocal: value });
    }
  };

  return (
    <GlassCard className="rounded-[1.5rem]">
      <div className="mb-2 flex items-center gap-2 text-[#f5d4b8]">
        <Bell className="h-4 w-4" />
        <p className="text-[11px] font-semibold uppercase tracking-wider">
          Workout reminders
        </p>
      </div>
      <p className="text-sm text-white/65">
        Browser nudge on your scheduled days so habits stick. Local time only —
        keep the tab/app open or grant notifications.
      </p>

      <label className="mt-3 block text-xs text-white/50">
        Reminder time
        <input
          type="time"
          value={timeLocal}
          onChange={(e) => void handleTimeChange(e.target.value)}
          className="aura-input mt-1 block h-10 w-full max-w-[10rem] rounded-xl px-3 text-sm"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {enabled ? (
          <Button size="sm" variant="secondary" onClick={() => void handleDisable()}>
            Turn off
          </Button>
        ) : (
          <Button size="sm" onClick={() => void handleEnable()}>
            Enable reminders
          </Button>
        )}
      </div>
      {status && <p className="mt-2 text-xs text-white/55">{status}</p>}
    </GlassCard>
  );
}
