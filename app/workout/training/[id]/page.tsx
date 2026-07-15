"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { X } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { ExerciseStep } from "@/components/workout/ExerciseStep";
import { TrainingProgress } from "@/components/workout/TrainingProgress";
import { WorkoutComplete } from "@/components/workout/WorkoutComplete";
import { getExerciseById } from "@/lib/data/exercises";
import { getWorkoutById } from "@/lib/data/mockWorkouts";
import { useStoresHydrated } from "@/lib/store/hydrate";
import { useRoutineStore } from "@/lib/store/routineStore";
import { useUserStore } from "@/lib/store/userStore";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { resolveCalorieProfile } from "@/lib/utils/resolveCalorieProfile";

export default function TrainingModePage() {
  return (
    <AuthGuard>
      <TrainingModeContent />
    </AuthGuard>
  );
}

function TrainingModeContent() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  const isCustom = workoutId === "custom";
  const hydrated = useStoresHydrated();
  const isGuest = useUserStore((s) => s.isGuest);
  const user = useUserStore((s) => s.user);

  const activeSession = useWorkoutStore((s) => s.activeSession);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const completeExercise = useWorkoutStore((s) => s.completeExercise);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const autoCompleteExerciseFromTraining = useRoutineStore(
    (s) => s.autoCompleteExerciseFromTraining
  );

  const [finishedSession, setFinishedSession] = useState<{
    workoutName: string;
    durationMinutes: number;
    exercisesCompleted: number;
  } | null>(null);

  const workout = isCustom ? null : getWorkoutById(workoutId);

  useEffect(() => {
    if (!hydrated) return;

    if (!isCustom && !workout) {
      router.replace("/dashboard");
      return;
    }

    // Read latest from store (includes sessionStorage restore) to avoid
    // resetting an in-progress workout when React deps briefly go null.
    const current = useWorkoutStore.getState().activeSession;

    if (!current) {
      if (!isCustom && workout) {
        startWorkout(workoutId);
      } else if (isCustom) {
        router.replace("/workout/today");
      }
      return;
    }

    if (!isCustom && current.workoutId !== workoutId) {
      startWorkout(workoutId);
    }
  }, [
    hydrated,
    workout,
    workoutId,
    isCustom,
    startWorkout,
    router,
  ]);

  useEffect(() => {
    if (!activeSession) return;
    const total = activeSession.exerciseIds.length;
    if (activeSession.currentIndex >= total && !finishedSession) {
      const profile = resolveCalorieProfile(user, isGuest);
      const checklist = useRoutineStore.getState().getTodayChecklist();
      const dayRoutine = useRoutineStore.getState().getDayRoutine(
        checklist?.dayOfWeek ?? new Date().getDay()
      );

      const exercises = activeSession.completedExerciseIds.map((exerciseId) => {
        const entry = checklist?.exercises.find(
          (e) => e.exerciseId === exerciseId
        );
        const slot = dayRoutine?.exercises.find(
          (e) => e.exerciseId === exerciseId
        );
        return {
          exerciseId,
          targetSets: slot?.targetSets ?? Math.max(1, entry?.sets.length ?? 1),
          targetReps: slot?.targetReps ?? "12",
          loggedSets: entry?.sets.map((s) => ({
            reps: s.reps,
            completed: s.completed,
            weightKg: s.weightKg ?? null,
          })),
        };
      });

      const session = finishWorkout({
        weightKg: profile?.weightKg ?? user?.weightKg,
        exercises,
      });
      if (session) {
        setFinishedSession({
          workoutName: session.workoutName,
          durationMinutes: session.durationMinutes,
          exercisesCompleted: session.exercisesCompleted.length,
        });
      }
    }
  }, [
    activeSession,
    finishWorkout,
    finishedSession,
    user,
    isGuest,
  ]);

  useEffect(() => {
    if (!activeSession || finishedSession) return;
    if (activeSession.currentIndex >= activeSession.exerciseIds.length) return;
    const id = activeSession.exerciseIds[activeSession.currentIndex];
    if (!getExerciseById(id)) {
      autoCompleteExerciseFromTraining(id);
      completeExercise();
    }
  }, [
    activeSession,
    autoCompleteExerciseFromTraining,
    completeExercise,
    finishedSession,
  ]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0b48a] border-t-transparent" />
      </div>
    );
  }

  if (!isCustom && !workout) return null;

  if (finishedSession) {
    return (
      <div className="relative mx-auto min-h-dvh w-full aura-app-shell aura-page-pad safe-top pt-6 md:max-w-3xl">
        <WorkoutComplete
          workoutName={finishedSession.workoutName}
          durationMinutes={finishedSession.durationMinutes}
          exercisesCompleted={finishedSession.exercisesCompleted}
          isGuest={isGuest}
          onContinue={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0b48a] border-t-transparent" />
      </div>
    );
  }

  const total = activeSession.exerciseIds.length;
  const currentIndex = activeSession.currentIndex;

  if (currentIndex >= total) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0b48a] border-t-transparent" />
      </div>
    );
  }

  const currentExerciseId = activeSession.exerciseIds[currentIndex];
  const currentExercise = getExerciseById(currentExerciseId);

  if (!currentExercise) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0b48a] border-t-transparent" />
      </div>
    );
  }

  const displayName = activeSession.workoutName;

  const handleComplete = () => {
    autoCompleteExerciseFromTraining(currentExerciseId);
    completeExercise();
  };

  const handleExit = () => {
    if (
      confirm(
        "Exit training? Exercises you already completed stay logged on today's workout."
      )
    ) {
      cancelWorkout();
      router.push("/workout/today");
    }
  };

  return (
    <div className="relative mx-auto flex min-h-dvh w-full aura-app-shell flex-col aura-page-pad safe-top pt-4 pb-8 md:max-w-3xl lg:max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Training Mode
          </p>
          <p className="text-sm font-semibold text-text-primary">{displayName}</p>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="aura-glass-btn flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label="Exit training"
        >
          <X className="h-5 w-5 text-text-primary" />
        </button>
      </div>

      <TrainingProgress
        current={currentIndex + 1}
        total={total}
        className="mb-6"
      />

      <div className="flex-1">
        <ExerciseStep
          exercise={currentExercise}
          stepKey={`${currentExerciseId}-${currentIndex}`}
        />
      </div>

      <div className="mt-6 safe-bottom">
        <Button size="lg" fullWidth onClick={handleComplete}>
          {currentIndex + 1 === total ? "Finish Workout" : "Complete Exercise"}
        </Button>
      </div>
    </div>
  );
}
