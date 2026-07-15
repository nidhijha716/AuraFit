const GUEST_REMINDER_KEY = "aurafit-guest-reminders";

export interface GuestReminderPrefs {
  enabled: boolean;
  timeLocal: string;
}

export function loadGuestReminderPrefs(): GuestReminderPrefs {
  if (typeof window === "undefined") {
    return { enabled: false, timeLocal: "18:00" };
  }
  try {
    const raw = localStorage.getItem(GUEST_REMINDER_KEY);
    if (!raw) return { enabled: false, timeLocal: "18:00" };
    const parsed = JSON.parse(raw) as GuestReminderPrefs;
    return {
      enabled: Boolean(parsed.enabled),
      timeLocal:
        typeof parsed.timeLocal === "string" &&
        /^\d{2}:\d{2}$/.test(parsed.timeLocal)
          ? parsed.timeLocal
          : "18:00",
    };
  } catch {
    return { enabled: false, timeLocal: "18:00" };
  }
}

export function saveGuestReminderPrefs(prefs: GuestReminderPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_REMINDER_KEY, JSON.stringify(prefs));
}
