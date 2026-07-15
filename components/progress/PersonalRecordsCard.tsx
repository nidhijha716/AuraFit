"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getExerciseById } from "@/lib/data/mockExercises";
import type { PersonalRecord } from "@/lib/types";
import { fetchPersonalRecords } from "@/lib/utils/personalRecords";

export function PersonalRecordsCard() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchPersonalRecords().then((rows) => {
      if (!cancelled) {
        setRecords(rows.slice(0, 8));
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GlassCard className="mb-4 rounded-[1.5rem]">
      <div className="mb-2 flex items-center gap-2 text-[#f5d4b8]">
        <Trophy className="h-4 w-4" />
        <p className="text-[11px] font-semibold uppercase tracking-wider">
          Personal records
        </p>
      </div>
      <p className="mb-3 text-xs text-white/55">
        Best logged weight × reps per exercise. Log weight on your sets to start
        tracking strength.
      </p>

      {!loaded ? (
        <p className="text-sm text-white/45">Loading…</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-white/55">
          No lift records yet. Complete sets with a weight in kg to set a PR.
        </p>
      ) : (
        <ul className="space-y-2">
          {records.map((r) => {
            const ex = getExerciseById(r.exerciseId);
            return (
              <li
                key={r.exerciseId}
                className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {ex?.name ?? r.exerciseId}
                  </p>
                  <p className="text-[11px] text-white/45">
                    {new Date(r.achievedAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-[#f5d4b8]">
                  {r.weightKg} kg × {r.reps}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
