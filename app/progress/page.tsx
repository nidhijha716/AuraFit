"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Target, TrendingUp, Clock } from "lucide-react";
import { GuestBodyMetricsCard } from "@/components/calories/GuestBodyMetricsCard";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { MobileShell } from "@/components/layout/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PersonalRecordsCard } from "@/components/progress/PersonalRecordsCard";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { useUserStore } from "@/lib/store/userStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { MUSCLE_GROUP_LABELS } from "@/lib/types";
import { toDateKey } from "@/lib/utils/dateKey";
import { estimateDailyCalorieTarget } from "@/lib/utils/calories";
import {
  buildDailyProgressHistory,
  formatDayLabel,
  muscleEntriesFromBreakdown,
} from "@/lib/utils/dailyProgress";
import { resolveCalorieProfile } from "@/lib/utils/resolveCalorieProfile";
import { cn } from "@/lib/utils/cn";

export default function ProgressPage() {
  const user = useUserStore((s) => s.user);
  const isGuest = useUserStore((s) => s.isGuest);
  const progress = useWorkoutStore((s) => s.progress);
  const sessions = useWorkoutStore((s) => s.sessions);
  const [bodyVersion, setBodyVersion] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateKey());

  const dailyHistory = useMemo(
    () => buildDailyProgressHistory(sessions),
    [sessions]
  );
  const selectedDay =
    dailyHistory.find((d) => d.date === selectedDate) ?? dailyHistory[0];
  const todayDay = dailyHistory[0];

  const muscleEntries = muscleEntriesFromBreakdown(
    selectedDay.muscleGroupBreakdown
  );
  const maxMuscle = muscleEntries[0]?.[1] ?? 1;

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date().getDay();
  const weekActivity = weekDays.map((label, i) => {
    const hasWorkout = sessions.some((s) => {
      const d = new Date(s.completedAt);
      return d.getDay() === i && d >= new Date(Date.now() - 7 * 86400000);
    });
    return { label, active: hasWorkout, isToday: i === today };
  });

  const calorieProfile = useMemo(
    () => resolveCalorieProfile(user, isGuest),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isGuest, bodyVersion]
  );
  const dailyCalorieTarget = calorieProfile
    ? estimateDailyCalorieTarget(calorieProfile)
    : null;
  const needsBodyStats = !calorieProfile;
  const isViewingToday = selectedDay.date === todayDay.date;

  return (
    <AuthGuard>
      <MobileShell>
        <PageTransition>
          <PageHeader
            title="Your Progress"
            accentWord="Progress"
            subtitle="Day-by-day estimates · last 10 days"
          />

          <PersonalRecordsCard />

          {/* Day rail first — thumb-friendly horizontal snap */}
          <section className="progress-panel mb-4 rounded-[1.5rem] p-4">
            <p className="app-section-label mb-3">Last 10 days</p>
            <div className="progress-day-rail">
              {dailyHistory.map((day) => {
                const active = day.date === selectedDay.date;
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      "progress-day-chip shrink-0 rounded-2xl px-2.5 py-2.5 text-center transition-all active:scale-[0.97]",
                      active
                        ? "aura-choice-selected"
                        : "glass text-text-primary"
                    )}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                      {formatDayLabel(day.date).split(" ")[0]}
                    </p>
                    <p className="mt-1 text-base font-bold leading-none">
                      {day.estimatedCaloriesBurned || 0}
                    </p>
                    <p className="mt-1 text-[10px] opacity-60">kcal</p>
                  </button>
                );
              })}
            </div>
          </section>

          <GlassCard className="mb-4 space-y-4 rounded-[1.5rem]">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Estimated Calories
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                Showing {formatDayLabel(selectedDay.date)}. Estimates use MET ×
                body weight × time, then adjust for logged volume (sets × reps ×
                load) when available. Typically within ~±25%. Resets daily —
                history stays for 10 days.
              </p>
            </div>

            {dailyCalorieTarget != null ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3.5 text-center sm:col-span-1">
                  <p className="text-2xl font-bold text-text-primary">
                    {dailyCalorieTarget}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-text-muted">
                    Daily target
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3.5 text-center">
                  <p className="text-2xl font-bold text-text-primary">
                    {selectedDay.estimatedCaloriesBurned || "—"}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-text-muted">
                    {isViewingToday ? "Burned today" : "Burned"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3.5 text-center">
                  <p className="text-2xl font-bold text-text-primary">
                    {selectedDay.workoutCount}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-text-muted">
                    Workouts
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                {isGuest
                  ? "Add your body stats below to unlock personalized calorie estimates."
                  : "Complete age, sex, height, weight, and activity level in Profile to unlock calorie estimates."}
              </p>
            )}

            {!isGuest && needsBodyStats && (
              <Link href="/profile">
                <Button variant="outline" size="md" className="min-h-11">
                  Update body stats
                </Button>
              </Link>
            )}
          </GlassCard>

          {isGuest && needsBodyStats && (
            <div className="mb-4">
              <GuestBodyMetricsCard
                onSaved={() => setBodyVersion((v) => v + 1)}
              />
            </div>
          )}

          <GlassCard className="mb-4 rounded-[1.5rem]">
            <h3 className="mb-1 font-semibold text-text-primary">
              Muscle groups
            </h3>
            <p className="mb-4 text-xs text-text-muted">
              {isViewingToday
                ? "Today only — resets each day"
                : formatDayLabel(selectedDay.date)}
            </p>
            {muscleEntries.length > 0 ? (
              <div className="space-y-3.5">
                {muscleEntries.map(([group, count]) => (
                  <div key={group}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-text-secondary">
                        {MUSCLE_GROUP_LABELS[group]}
                      </span>
                      <span className="font-semibold text-text-primary">
                        {count}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[var(--glass-hover)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#f0b48a] to-[#f5d4b8] transition-all duration-300"
                        style={{ width: `${(count / maxMuscle) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-2 text-center text-sm text-text-muted">
                No workouts logged for {formatDayLabel(selectedDay.date)}.
              </p>
            )}
          </GlassCard>

          <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
            <GlassCard padding="md" className="rounded-2xl">
              <Flame className="mb-2 h-5 w-5 text-[#f5d4b8]" />
              <p className="text-2xl font-bold text-text-primary">
                {progress.streak}
              </p>
              <p className="text-xs text-text-muted">Day streak</p>
            </GlassCard>
            <GlassCard padding="md" className="rounded-2xl">
              <Target className="mb-2 h-5 w-5 text-[#f5d4b8]" />
              <p className="text-2xl font-bold text-text-primary">
                {progress.totalWorkouts}
              </p>
              <p className="text-xs text-text-muted">Total workouts</p>
            </GlassCard>
            <GlassCard padding="md" className="rounded-2xl">
              <Clock className="mb-2 h-5 w-5 text-[#f5d4b8]" />
              <p className="text-2xl font-bold text-text-primary">
                {progress.weeklyMinutes}
              </p>
              <p className="text-xs text-text-muted">Minutes this week</p>
            </GlassCard>
            <GlassCard padding="md" className="rounded-2xl">
              <TrendingUp className="mb-2 h-5 w-5 text-[#f5d4b8]" />
              <p className="text-2xl font-bold text-text-primary">
                {selectedDay.minutes}
              </p>
              <p className="text-xs text-text-muted">
                Mins · {formatDayLabel(selectedDay.date)}
              </p>
            </GlassCard>
          </div>

          <GlassCard className="rounded-[1.5rem]">
            <h3 className="mb-4 font-semibold text-text-primary">This week</h3>
            <div className="flex justify-between gap-1.5 sm:gap-2">
              {weekActivity.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold transition-all",
                      day.active
                        ? "aura-btn-primary"
                        : day.isToday
                          ? "glass text-text-primary ring-2 ring-[#f0b48a]/45"
                          : "glass text-text-secondary"
                    )}
                  >
                    {day.label}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </PageTransition>
      </MobileShell>
    </AuthGuard>
  );
}
