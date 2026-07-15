import type { PersonalRecord } from "@/lib/types";
import { isAuthenticatedUser } from "@/lib/store/fitnessPersistence";
import { apiFetch } from "@/lib/api/client";

const GUEST_PR_KEY = "aurafit-personal-records";

function loadGuestRecords(): PersonalRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_PR_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersonalRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestRecords(records: PersonalRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_PR_KEY, JSON.stringify(records));
}

/** True if candidate beats existing (heavier, or same weight with more reps). */
export function isBetterRecord(
  candidate: { weightKg: number; reps: number },
  existing: { weightKg: number; reps: number } | null
): boolean {
  if (!existing) return candidate.weightKg > 0 && candidate.reps > 0;
  if (candidate.weightKg > existing.weightKg) return true;
  if (
    candidate.weightKg === existing.weightKg &&
    candidate.reps > existing.reps
  ) {
    return true;
  }
  return false;
}

export function getLocalPersonalRecords(): PersonalRecord[] {
  return loadGuestRecords().sort(
    (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
  );
}

/**
 * Upsert a PR when a completed set includes weight.
 * Returns the new record if it was a PR, otherwise null.
 */
export function considerPersonalRecord(input: {
  exerciseId: string;
  weightKg: number | null | undefined;
  reps: number;
  sourceDate?: string;
}): PersonalRecord | null {
  const weight = input.weightKg;
  if (weight == null || weight <= 0 || input.reps <= 0) return null;

  const achievedAt = new Date().toISOString();
  const candidate: PersonalRecord = {
    exerciseId: input.exerciseId,
    weightKg: weight,
    reps: input.reps,
    achievedAt,
    sourceDate: input.sourceDate ?? null,
  };

  if (isAuthenticatedUser()) {
    void apiFetch("/api/records", {
      method: "POST",
      body: JSON.stringify(candidate),
    }).catch(console.error);
    return candidate;
  }

  const records = loadGuestRecords();
  const idx = records.findIndex((r) => r.exerciseId === input.exerciseId);
  const existing = idx >= 0 ? records[idx] : null;
  if (!isBetterRecord(candidate, existing)) return null;

  if (idx >= 0) records[idx] = candidate;
  else records.push(candidate);
  saveGuestRecords(records);
  return candidate;
}

export async function fetchPersonalRecords(): Promise<PersonalRecord[]> {
  if (!isAuthenticatedUser()) return getLocalPersonalRecords();
  try {
    const data = await apiFetch<{ records: PersonalRecord[] }>("/api/records");
    return data.records;
  } catch {
    return [];
  }
}
