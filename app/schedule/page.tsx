"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, Plus, Sparkles } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { MobileShell } from "@/components/layout/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { useRoutineStore } from "@/lib/store/routineStore";
import { useUserStore } from "@/lib/store/userStore";
import { DAY_LABELS, DAY_NAMES } from "@/lib/types";
import { getTodayDayOfWeek } from "@/lib/utils/dateKey";
import { cn } from "@/lib/utils/cn";
import { installBeginnerWeek1Plan } from "@/lib/utils/installBeginnerPlan";

export default function SchedulePage() {
  const user = useUserStore((s) => s.user);
  const weeklyRoutines = useRoutineStore((s) => s.weeklyRoutines);
  const setDayRoutine = useRoutineStore((s) => s.setDayRoutine);
  const clearDayRoutine = useRoutineStore((s) => s.clearDayRoutine);
  const today = getTodayDayOfWeek();

  const hasAnyRoutine = Object.values(weeklyRoutines).some(
    (r) => r !== null && r.exercises.length > 0
  );

  const defaultDays =
    user?.workoutDays?.length && user.workoutDays.length > 0
      ? user.workoutDays
      : [1, 3, 5];

  const handleInstallBeginnerPlan = () => {
    installBeginnerWeek1Plan({
      workoutDays: defaultDays,
      setDayRoutine,
      clearDayRoutine,
      replaceAll: true,
      userId: user?.id,
    });
  };

  return (
    <AuthGuard>
      <MobileShell>
        <PageTransition>
          <PageHeader
            title="Weekly Schedule"
            subtitle="Set a routine for each day — it repeats every week"
            backHref="/dashboard"
          />

          <GlassCard className="mb-5" padding="sm">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#f5d4b8]" />
              <p className="text-sm leading-relaxed text-text-secondary">
                Pick exercises for each weekday once. Your Monday routine applies
                to every Monday. Edit anytime.
              </p>
            </div>
          </GlassCard>

          {!hasAnyRoutine && (
            <GlassCard className="mb-5 border border-[#f0b48a]/20 bg-[#f0b48a]/8">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#f5d4b8]" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">
                    Suggest a beginner plan
                  </p>
                  <p className="mt-1 text-sm text-white/65">
                    Fill your training days with short full-body sessions so you
                    don&apos;t have to pick exercises from scratch.
                  </p>
                  <Button
                    size="md"
                    className="mt-3 min-h-11"
                    onClick={handleInstallBeginnerPlan}
                  >
                    Get beginner week
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

          <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:grid-cols-3">
            {DAY_NAMES.map((dayName, dayIndex) => {
              const routine = weeklyRoutines[dayIndex];
              const isToday = dayIndex === today;

              return (
                <Link key={dayIndex} href={`/schedule/${dayIndex}`}>
                  <GlassCard
                    padding="sm"
                    hover
                    className={cn(
                      "mb-2 flex items-center gap-3",
                      isToday && "ring-1 ring-[#f0b48a]/40"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-bold",
                        isToday
                          ? "aura-btn-primary text-xs font-bold"
                          : "aura-icon text-[#f5d4b8]"
                      )}
                    >
                      <span className="text-[10px] font-medium opacity-80">
                        {DAY_LABELS[dayIndex]}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-primary">
                          {dayName}
                        </p>
                        {isToday && (
                          <Badge variant="accent" className="text-[10px]">
                            Today
                          </Badge>
                        )}
                      </div>
                      {routine ? (
                        <p className="truncate text-xs text-text-muted">
                          {routine.name} · {routine.exercises.length} exercise
                          {routine.exercises.length !== 1 ? "s" : ""}
                        </p>
                      ) : (
                        <p className="text-xs text-text-muted">No routine set</p>
                      )}
                    </div>

                    {routine ? (
                      <ChevronRight className="h-5 w-5 shrink-0 text-text-muted" />
                    ) : (
                      <Plus className="h-5 w-5 shrink-0 text-[#f5d4b8]" />
                    )}
                  </GlassCard>
                </Link>
              );
            })}
          </div>

          <Link href={`/schedule/${today}`} className="mt-6 block">
            <Button size="lg" fullWidth variant="secondary">
              <Plus className="h-5 w-5" />
              {weeklyRoutines[today]
                ? "Edit Today's Routine"
                : "Set Up Today's Routine"}
            </Button>
          </Link>
        </PageTransition>
      </MobileShell>
    </AuthGuard>
  );
}
