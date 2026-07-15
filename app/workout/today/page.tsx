"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Play,
  Target,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { GuestModeBanner } from "@/components/layout/GuestModeBanner";
import { MobileShell } from "@/components/layout/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/PageTransition";
import { ExerciseChecklistItem } from "@/components/workout/ExerciseChecklistItem";
import { WorkoutCoveragePanel } from "@/components/workout/WorkoutCoveragePanel";
import { WorkoutExerciseCard } from "@/components/workout/WorkoutExerciseCard";
import { getExercisesByIds } from "@/lib/data/mockExercises";
import { getTodayWorkout } from "@/lib/data/mockWorkouts";
import { resolveTodayRoutine, useRoutineStore } from "@/lib/store/routineStore";
import { useUserStore } from "@/lib/store/userStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import {
  DIFFICULTY_LABELS,
  EXPERIENCE_LABELS,
  FITNESS_GOAL_LABELS,
} from "@/lib/types";
import { estimateRoutineDurationMinutes } from "@/lib/utils/calories";
import { getTodayDayOfWeek, toDateKey } from "@/lib/utils/dateKey";

export default function TodayWorkoutPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const isGuest = useUserStore((s) => s.isGuest);
  const weeklyRoutines = useRoutineStore((s) => s.weeklyRoutines);
  const getOrCreateTodayChecklist = useRoutineStore(
    (s) => s.getOrCreateTodayChecklist
  );
  const dailyChecklists = useRoutineStore((s) => s.dailyChecklists);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const startCustomWorkout = useWorkoutStore((s) => s.startCustomWorkout);

  const customRoutine = resolveTodayRoutine(weeklyRoutines);
  const preferBeginner =
    isGuest || user?.experienceLevel === "beginner" || !user?.experienceLevel;
  const fallbackWorkout = getTodayWorkout({ preferBeginner });
  const today = getTodayDayOfWeek();

  const hasCustomRoutine =
    customRoutine !== null && customRoutine.exercises.length > 0;

  useEffect(() => {
    if (hasCustomRoutine) {
      getOrCreateTodayChecklist();
    }
  }, [hasCustomRoutine, getOrCreateTodayChecklist]);

  const checklist = useMemo(() => {
    return dailyChecklists[toDateKey()] ?? null;
  }, [dailyChecklists]);

  const exerciseIds = hasCustomRoutine
    ? customRoutine.exercises.map((e) => e.exerciseId)
    : fallbackWorkout.exerciseIds;

  const exercises = getExercisesByIds(exerciseIds);
  const routineName = hasCustomRoutine
    ? customRoutine.name
    : fallbackWorkout.name;

  const completedCount =
    checklist?.exercises.filter((e) => e.completed).length ?? 0;
  const totalCount = checklist?.exercises.length ?? exercises.length;

  const goalsLabel =
    user?.goals?.map((g) => FITNESS_GOAL_LABELS[g]).join(", ") ??
    "Stay Active";

  const handleStartTraining = () => {
    if (hasCustomRoutine) {
      startCustomWorkout(routineName, exerciseIds);
      router.push("/workout/training/custom");
    } else {
      startWorkout(fallbackWorkout.id);
      router.push(`/workout/training/${fallbackWorkout.id}`);
    }
  };

  return (
    <AuthGuard>
      <MobileShell className="pb-[calc(var(--nav-height)+5rem)] lg:pb-10">
        <PageTransition>
          {isGuest && <GuestModeBanner compact className="mb-4" />}

          <PageHeader
            title={routineName}
            subtitle="Today's workout plan"
            backHref="/dashboard"
            action={
              <Link
                href={`/schedule/${today}`}
                className="aura-glass-btn flex h-9 w-9 items-center justify-center rounded-xl"
                aria-label="Edit routine"
              >
                <CalendarDays className="h-5 w-5 text-text-primary" />
              </Link>
            }
          />

          {!hasCustomRoutine && (
            <div className="aura-card mb-4 rounded-2xl p-4 text-sm text-white/70">
              {preferBeginner ? (
                <>
                  Beginner starter session — follow the list in order.{" "}
                  <Link
                    href="/dashboard"
                    className="font-medium text-[#f5d4b8]"
                  >
                    Get a full weekly plan
                  </Link>{" "}
                  from your dashboard coach card, or{" "}
                  <Link
                    href={`/schedule/${today}`}
                    className="font-medium text-[#f5d4b8]"
                  >
                    build your own routine
                  </Link>
                  .
                </>
              ) : (
                <>
                  Using a suggested workout.{" "}
                  <Link
                    href={`/schedule/${today}`}
                    className="font-medium text-[#f5d4b8]"
                  >
                    Build your own{" "}
                    {
                      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][today]
                    }{" "}
                    routine
                  </Link>{" "}
                  with photos and custom exercises.
                </>
              )}
            </div>
          )}

          {hasCustomRoutine && preferBeginner && (
            <p className="mb-4 text-sm text-white/55">
              Stick to the sets and rest shown — consistency beats intensity while
              you learn form.
            </p>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="accent">
              <Target className="mr-1 h-3 w-3" />
              {goalsLabel}
            </Badge>
            <Badge variant="accent">
              <Clock className="mr-1 h-3 w-3" />
              {hasCustomRoutine
                ? `~${estimateRoutineDurationMinutes(customRoutine.exercises)} min`
                : `${fallbackWorkout.estimatedMinutes} min`}
            </Badge>
            <Badge>{exercises.length} exercises</Badge>
            {user?.experienceLevel && (
              <Badge>{EXPERIENCE_LABELS[user.experienceLevel]}</Badge>
            )}
            {!hasCustomRoutine && (
              <Badge>{DIFFICULTY_LABELS[fallbackWorkout.difficulty]}</Badge>
            )}
            {checklist?.allComplete && (
              <Badge variant="success">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                All done!
              </Badge>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {exercises.map((exercise, i) => {
                const routineEx = hasCustomRoutine
                  ? customRoutine.exercises.find((e) => e.exerciseId === exercise.id)
                  : null;
                const sets = routineEx?.targetSets ?? exercise.sets ?? 3;
                const reps =
                  routineEx?.targetReps ?? exercise.reps ?? exercise.duration ?? "12";

                const checklistEntry = checklist?.exercises.find(
                  (e) => e.exerciseId === exercise.id
                );

                return (
                  <WorkoutExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={i}
                    sets={sets}
                    reps={reps}
                    footer={
                      hasCustomRoutine && checklistEntry ? (
                        <ExerciseChecklistItem
                          entry={checklistEntry}
                          targetReps={reps}
                          defaultOpen={i === 0 && !checklistEntry.completed}
                          embedded
                        />
                      ) : undefined
                    }
                  />
                );
              })}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" fullWidth onClick={handleStartTraining}>
                  <Play className="h-5 w-5" />
                  Start Training Mode
                </Button>
                <Link href="/schedule" className="sm:w-auto">
                  <Button variant="secondary" fullWidth size="lg">
                    <CalendarDays className="h-4 w-4" />
                    Edit Schedule
                  </Button>
                </Link>
              </div>
            </div>

            <aside className="space-y-4">
              <WorkoutCoveragePanel
                exercises={exercises}
                routineName={routineName}
                subtitle="Personalized for your goals"
              />

              {hasCustomRoutine && checklist && (
                <div className="aura-card rounded-2xl p-4">
                  <p className="text-sm font-semibold text-white">Daily progress</p>
                  <p className="mt-1 text-2xl font-bold text-[#f5d4b8]">
                    {completedCount}/{totalCount}
                  </p>
                  <p className="text-xs text-white/50">exercises completed</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#f0b48a] transition-all duration-500"
                      style={{
                        width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </aside>
          </div>
        </PageTransition>
      </MobileShell>
    </AuthGuard>
  );
}
