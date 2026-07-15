"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  History,
  LineChart,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { GuestModeBanner } from "@/components/layout/GuestModeBanner";
import { MobileShell } from "@/components/layout/MobileShell";
import { CoachPlanCard } from "@/components/dashboard/CoachPlanCard";
import { PlanUpgradeCard } from "@/components/dashboard/PlanUpgradeCard";
import { TodayBurnEstimateCard } from "@/components/dashboard/TodayBurnEstimateCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { WeekStrip } from "@/components/dashboard/WeekStrip";
import { HomeBackgroundMedia } from "@/components/home/HomeBackgroundMedia";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { allExercises, getExercisesByIds } from "@/lib/data/exercises";
import { getTodayWorkout } from "@/lib/data/mockWorkouts";
import { resolveTodayRoutine, useRoutineStore } from "@/lib/store/routineStore";
import { useUserStore } from "@/lib/store/userStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import {
  DAY_NAMES,
  DIFFICULTY_LABELS,
  FITNESS_GOAL_LABELS,
} from "@/lib/types";
import { estimateRoutineDurationMinutes } from "@/lib/utils/calories";
import { getCoachGuidance } from "@/lib/utils/coachGuidance";
import { getTodayDayOfWeek, toDateKey } from "@/lib/utils/dateKey";
import {
  installBeginnerPplPlan,
  installBeginnerWeek1Plan,
  loadPlanMeta,
  savePlanMeta,
  shouldOfferPplUpgrade,
} from "@/lib/utils/installBeginnerPlan";

const quickActions = [
  {
    href: "/workout/today",
    label: "Today's Workout",
    description: "Open checklist",
    icon: Zap,
  },
  {
    href: "/schedule",
    label: "Schedule",
    description: "Plan your week",
    icon: CalendarDays,
  },
  {
    href: "/exercises",
    label: "Exercises",
    description: `${allExercises.length}+ moves`,
    icon: Dumbbell,
  },
  {
    href: "/progress",
    label: "Progress",
    description: "Track growth",
    icon: LineChart,
  },
] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const user = useUserStore((s) => s.user);
  const isGuest = useUserStore((s) => s.isGuest);
  const progress = useWorkoutStore((s) => s.progress);
  const sessions = useWorkoutStore((s) => s.sessions);
  const getSessionsThisWeek = useWorkoutStore((s) => s.getSessionsThisWeek);
  const weeklyRoutines = useRoutineStore((s) => s.weeklyRoutines);
  const setDayRoutine = useRoutineStore((s) => s.setDayRoutine);
  const clearDayRoutine = useRoutineStore((s) => s.clearDayRoutine);
  const dailyChecklists = useRoutineStore((s) => s.dailyChecklists);
  const [planTick, setPlanTick] = useState(0);

  const customRoutine = resolveTodayRoutine(weeklyRoutines);
  const preferBeginner =
    isGuest || user?.experienceLevel === "beginner" || !user?.experienceLevel;
  const fallbackWorkout = getTodayWorkout({ preferBeginner });
  const hasCustomRoutine =
    customRoutine !== null && customRoutine.exercises.length > 0;

  const exerciseIds = hasCustomRoutine
    ? customRoutine.exercises.map((e) => e.exerciseId)
    : fallbackWorkout.exerciseIds;
  const exercises = getExercisesByIds(exerciseIds);

  const todayChecklist = dailyChecklists[toDateKey()];
  const completedToday =
    todayChecklist?.exercises.filter((e) => e.completed).length ?? 0;
  const progressPct =
    exercises.length > 0
      ? Math.round((completedToday / exercises.length) * 100)
      : 0;

  const weekSessions = getSessionsThisWeek();
  const recentSessions = sessions.slice(0, 3);
  const today = getTodayDayOfWeek();
  const firstName = isGuest ? "Guest" : (user?.name?.split(" ")[0] ?? "Athlete");
  const primaryGoal = user?.goals?.[0];
  const scheduledDays = Object.values(weeklyRoutines).filter(
    (r) => r !== null && r.exercises.length > 0
  ).length;

  const workoutName = hasCustomRoutine
    ? customRoutine.name
    : fallbackWorkout.name;
  const workoutDescription = hasCustomRoutine
    ? `Your custom ${DAY_NAMES[today]} routine`
    : fallbackWorkout.description;
  const estimatedMinutes = hasCustomRoutine
    ? estimateRoutineDurationMinutes(customRoutine.exercises)
    : fallbackWorkout.estimatedMinutes;

  const todayBurnItems = useMemo(
    () =>
      hasCustomRoutine
        ? customRoutine.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            targetSets: e.targetSets,
            targetReps: e.targetReps,
          }))
        : exerciseIds.map((id) => ({ exerciseId: id })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasCustomRoutine, customRoutine, exerciseIds]
  );

  const coachGuidance = useMemo(
    () => getCoachGuidance(weeklyRoutines, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weeklyRoutines, today, planTick]
  );

  const planMeta = useMemo(
    () => loadPlanMeta(user?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, planTick]
  );

  const showUpgrade = shouldOfferPplUpgrade(
    planMeta,
    progress.totalWorkouts
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
    setPlanTick((t) => t + 1);
  };

  const handleUpgradePpl = () => {
    installBeginnerPplPlan({
      workoutDays: defaultDays,
      setDayRoutine,
      clearDayRoutine,
      userId: user?.id,
    });
    setPlanTick((t) => t + 1);
  };

  const handleDismissUpgrade = () => {
    if (!planMeta) return;
    savePlanMeta(
      { ...planMeta, upgradeDismissed: true },
      user?.id
    );
    setPlanTick((t) => t + 1);
  };

  return (
    <AuthGuard>
      <div className="relative min-h-dvh w-full">
        <HomeBackgroundMedia />

        <MobileShell wide className="relative z-10">
          <PageTransition>
            {isGuest && <GuestModeBanner className="mb-4" />}

            <section className="dashboard-hero mb-4 rounded-[1.75rem] p-4 md:mb-6 md:rounded-3xl md:p-5 lg:mb-8 lg:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="accent" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {getGreeting()}
                    </Badge>
                    {primaryGoal && (
                      <Badge>{FITNESS_GOAL_LABELS[primaryGoal]}</Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                    Hey, {firstName}
                    <span className="text-[#f5d4b8]">!</span>
                  </h1>
                  <p className="mt-1 text-sm text-white/65">
                    {DAY_NAMES[today]} · Let&apos;s make today count
                  </p>
                </div>

                <div className="hidden grid-cols-4 gap-2 lg:grid lg:min-w-[280px]">
                  <div className="dashboard-stat-tile rounded-2xl px-2 py-2.5 text-center">
                    <p className="text-lg font-bold text-white">
                      {progress.streak}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/55 sm:text-xs">
                      Day streak
                    </p>
                  </div>
                  <div className="dashboard-stat-tile rounded-2xl px-2 py-2.5 text-center">
                    <p className="text-lg font-bold text-white">
                      {weekSessions.length}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/55 sm:text-xs">
                      This week
                    </p>
                  </div>
                  <div className="dashboard-stat-tile rounded-2xl px-2 py-2.5 text-center">
                    <p className="text-lg font-bold text-white">
                      {progress.weeklyMinutes}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/55 sm:text-xs">
                      Minutes
                    </p>
                  </div>
                  <div className="dashboard-stat-tile rounded-2xl px-2 py-2.5 text-center">
                    <p className="text-lg font-bold text-white">
                      {scheduledDays}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/55 sm:text-xs">
                      Scheduled
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <CoachPlanCard
              guidance={coachGuidance}
              onInstallPlan={handleInstallBeginnerPlan}
              className="mb-4 md:mb-5"
            />

            {showUpgrade && (
              <div className="mb-4 md:mb-5">
                <PlanUpgradeCard
                  onUpgrade={handleUpgradePpl}
                  onDismiss={handleDismissUpgrade}
                />
              </div>
            )}

            {exercises.length > 0 && (
              <div className="mb-4 md:mb-5">
                <TodayBurnEstimateCard
                  exerciseItems={todayBurnItems}
                  durationMinutes={estimatedMinutes}
                  workoutComplete={Boolean(todayChecklist?.allComplete)}
                />
              </div>
            )}

            <div className="grid gap-4 md:gap-5 xl:grid-cols-12 xl:gap-6">
              <div className="space-y-4 md:space-y-5 xl:col-span-7">
                <div className="dashboard-workout-card rounded-[1.75rem] p-4 md:rounded-3xl md:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <Badge variant="accent" className="mb-3">
                        Today&apos;s Workout
                      </Badge>
                      <h2 className="text-xl font-bold leading-snug text-white md:text-3xl">
                        {workoutName}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-white/68 md:text-base">
                        {workoutDescription}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/65">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-[#f5d4b8]" />
                          ~{estimatedMinutes} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-[#f5d4b8]" />
                          {exercises.length} exercises
                        </span>
                        {hasCustomRoutine && todayChecklist ? (
                          <Badge
                            variant={
                              todayChecklist.allComplete ? "success" : "default"
                            }
                          >
                            {completedToday}/{exercises.length} done
                          </Badge>
                        ) : (
                          !hasCustomRoutine && (
                            <Badge>
                              {DIFFICULTY_LABELS[fallbackWorkout.difficulty]}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    {hasCustomRoutine && exercises.length > 0 && (
                      <ProgressRing
                        value={progressPct}
                        size={96}
                        label="done"
                      />
                    )}
                  </div>

                  <Link href="/workout/today" className="mt-5 block md:mt-6">
                    <Button size="lg" fullWidth className="min-h-12 sm:max-w-xs">
                      {hasCustomRoutine ? "Open Checklist" : "Start Workout"}
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-2 lg:hidden">
                  <div className="dashboard-stat-tile rounded-2xl px-1.5 py-2.5 text-center">
                    <p className="text-lg font-bold text-white">
                      {progress.streak}
                    </p>
                    <p className="mt-0.5 text-[9px] leading-tight text-white/50">
                      Streak
                    </p>
                  </div>
                  <div className="dashboard-stat-tile rounded-2xl px-1.5 py-2.5 text-center">
                    <p className="text-lg font-bold text-white">
                      {weekSessions.length}
                    </p>
                    <p className="mt-0.5 text-[9px] leading-tight text-white/50">
                      Week
                    </p>
                  </div>
                  <div className="dashboard-stat-tile rounded-2xl px-1.5 py-2.5 text-center">
                    <p className="text-lg font-bold text-white">
                      {progress.weeklyMinutes}
                    </p>
                    <p className="mt-0.5 text-[9px] leading-tight text-white/50">
                      Mins
                    </p>
                  </div>
                  <div className="dashboard-stat-tile rounded-2xl px-1.5 py-2.5 text-center">
                    <p className="text-lg font-bold text-white">
                      {scheduledDays}
                    </p>
                    <p className="mt-0.5 text-[9px] leading-tight text-white/50">
                      Days
                    </p>
                  </div>
                </div>

                <GlassCard className="rounded-[1.5rem]">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Your week</h3>
                    <Link
                      href="/schedule"
                      className="text-xs font-medium text-[#f5d4b8]"
                    >
                      Manage
                    </Link>
                  </div>
                  <p className="mb-3 text-xs text-white/50">
                    Tap a day to edit its routine
                  </p>
                  <WeekStrip weeklyRoutines={weeklyRoutines} today={today} />
                </GlassCard>
              </div>

              <div className="space-y-4 md:space-y-5 xl:col-span-5">
                <GlassCard className="rounded-[1.5rem]">
                  <h3 className="mb-3 font-semibold text-white">
                    Quick actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {quickActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="group rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/8 transition-colors hover:bg-white/[0.07]"
                      >
                        <action.icon className="mb-2 h-5 w-5 text-[#f5d4b8]" />
                        <p className="text-sm font-semibold text-white">
                          {action.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-white/50">
                          {action.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="rounded-[1.5rem]">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white">
                      Recent activity
                    </h3>
                    <Link
                      href="/history"
                      className="flex items-center gap-1 text-xs font-medium text-[#f5d4b8]"
                    >
                      View all
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  {recentSessions.length === 0 ? (
                    <div className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center">
                      <Flame className="mx-auto mb-2 h-6 w-6 text-white/30" />
                      <p className="text-sm text-white/55">
                        No workouts yet. Start your first session today!
                      </p>
                      <Link href="/workout/today" className="mt-3 inline-block">
                        <Button size="sm">Start training</Button>
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {recentSessions.map((session) => (
                        <li
                          key={session.id}
                          className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {session.workoutName}
                            </p>
                            <p className="text-[11px] text-white/45">
                              {new Date(session.completedAt).toLocaleDateString()}{" "}
                              · {session.durationMinutes} min
                            </p>
                          </div>
                          <History className="h-4 w-4 shrink-0 text-white/30" />
                        </li>
                      ))}
                    </ul>
                  )}
                </GlassCard>

                {!hasCustomRoutine && (
                  <Link
                    href="/schedule"
                    className="flex items-center gap-3 rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-4 transition-colors hover:border-[#f0b48a]/30"
                  >
                    <Calendar className="h-8 w-8 shrink-0 text-[#f5d4b8]" />
                    <div>
                      <p className="font-semibold text-white">
                        Build your weekly plan
                      </p>
                      <p className="text-xs text-white/50">
                        No routines set yet — add your first day
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-white/30" />
                  </Link>
                )}
              </div>
            </div>
          </PageTransition>
        </MobileShell>
      </div>
    </AuthGuard>
  );
}
