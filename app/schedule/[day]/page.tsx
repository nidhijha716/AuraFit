"use client";

import { use, useEffect, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { MobileShell } from "@/components/layout/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageTransition } from "@/components/ui/PageTransition";
import { ExercisePickerGrid } from "@/components/workout/ExercisePickerGrid";
import { WorkoutCoveragePanel } from "@/components/workout/WorkoutCoveragePanel";
import { WorkoutExerciseCard } from "@/components/workout/WorkoutExerciseCard";
import { getExerciseById, searchExercises } from "@/lib/data/exercises";
import { useRoutineStore } from "@/lib/store/routineStore";
import { DAY_NAMES, type MuscleGroup } from "@/lib/types";

export default function DaySchedulePage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day: dayParam } = use(params);
  const dayOfWeek = parseInt(dayParam, 10);
  const router = useRouter();

  if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    notFound();
  }

  const weeklyRoutines = useRoutineStore((s) => s.weeklyRoutines);
  const routine = weeklyRoutines[dayOfWeek];
  const setDayRoutine = useRoutineStore((s) => s.setDayRoutine);
  const addExerciseToDay = useRoutineStore((s) => s.addExerciseToDay);
  const removeExerciseFromDay = useRoutineStore((s) => s.removeExerciseFromDay);
  const updateRoutineExercise = useRoutineStore((s) => s.updateRoutineExercise);
  const reorderExercise = useRoutineStore((s) => s.reorderExercise);
  const clearDayRoutine = useRoutineStore((s) => s.clearDayRoutine);

  const [routineName, setRoutineName] = useState(
    routine?.name ?? `${DAY_NAMES[dayOfWeek]} Routine`
  );
  const [showPicker, setShowPicker] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MuscleGroup | "all">("all");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (routine?.name) {
      setRoutineName(routine.name);
    }
  }, [routine?.name]);

  const selectedIds = useMemo(
    () => new Set(routine?.exercises.map((e) => e.exerciseId) ?? []),
    [routine?.exercises]
  );

  const routineExercises = useMemo(
    () =>
      (routine?.exercises ?? [])
        .map((item) => {
          const ex = getExerciseById(item.exerciseId);
          return ex ? { item, exercise: ex } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [routine?.exercises]
  );

  const { items: availableExercises, total: availableTotal } = useMemo(() => {
    return searchExercises({
      search,
      muscleGroup: filter,
      excludeIds: selectedIds,
      limit: 60,
    });
  }, [search, filter, selectedIds]);

  const canSave = routineExercises.length > 0;

  const handleSave = () => {
    setSaveError("");
    const current = useRoutineStore.getState().weeklyRoutines[dayOfWeek];

    if (!current || current.exercises.length === 0) {
      setSaveError("Add at least one exercise before saving.");
      return;
    }

    const trimmedName =
      routineName.trim() || `${DAY_NAMES[dayOfWeek]} Routine`;

    setDayRoutine({
      ...current,
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    });

    setSaved(true);
    setTimeout(() => {
      router.push("/schedule");
    }, 600);
  };

  const handleClear = () => {
    if (!confirm("Clear this day's routine?")) return;
    clearDayRoutine(dayOfWeek);
    setRoutineName(`${DAY_NAMES[dayOfWeek]} Routine`);
    setSaveError("");
  };

  const handleAddExercise = (exerciseId: string) => {
    const ex = getExerciseById(exerciseId);
    addExerciseToDay(dayOfWeek, {
      exerciseId,
      targetSets: ex?.sets ?? 3,
      targetReps: ex?.reps ?? ex?.duration ?? "12",
    });
    setSaveError("");
  };

  const saveButtonLabel = saved ? (
    <>
      <Check className="h-4 w-4" />
      Saved
    </>
  ) : (
    "Save Routine"
  );

  const coverage = (
    <WorkoutCoveragePanel
      exercises={routineExercises.map((r) => r.exercise)}
      routineName={routineName}
      subtitle={`Repeats every ${DAY_NAMES[dayOfWeek]}`}
      compact
    />
  );

  return (
    <AuthGuard>
      <MobileShell
        className={
          canSave
            ? "pb-[calc(var(--nav-height)+5.5rem)] lg:pb-10"
            : undefined
        }
      >
        <PageTransition>
          <PageHeader
            title={`${DAY_NAMES[dayOfWeek]} Routine`}
            subtitle="Build your workout — tap exercises to add them"
            backHref="/schedule"
            accentWord={DAY_NAMES[dayOfWeek]}
          />

          {/* Name — save actions live in sticky bar on phone */}
          <div className="aura-card mb-4 max-w-full min-w-0 overflow-hidden rounded-[1.5rem] p-3.5 md:mb-5 md:rounded-2xl md:p-5">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 overflow-hidden">
                <Input
                  label="Routine Name"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder={`${DAY_NAMES[dayOfWeek]} Routine`}
                />
              </div>
              <div className="hidden gap-2 sm:flex sm:shrink-0">
                {canSave && (
                  <Button
                    variant="outline"
                    className="text-red-400"
                    onClick={handleClear}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                )}
                <Button
                  size="md"
                  className="min-w-[130px]"
                  onClick={handleSave}
                  disabled={!canSave || saved}
                >
                  {saveButtonLabel}
                </Button>
              </div>
            </div>

            {saveError && (
              <p className="mt-2 text-sm text-red-400">{saveError}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="min-h-10"
                onClick={() => setShowPicker(!showPicker)}
              >
                <Plus className="h-4 w-4" />
                {showPicker ? "Hide Library" : "Add Exercises"}
              </Button>
              {canSave && (
                <p className="text-xs text-white/50">
                  {routineExercises.length} exercise
                  {routineExercises.length !== 1 ? "s" : ""} added
                </p>
              )}
            </div>
          </div>

          {/* Mobile: compact coverage under name */}
          <div className="mb-4 xl:hidden">{coverage}</div>

          <div className="grid min-w-0 max-w-full gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 max-w-full space-y-2.5 md:space-y-4">
              <div className="flex items-baseline justify-between px-0.5">
                <p className="app-section-label">Your exercises</p>
                {canSave && (
                  <p className="text-[11px] text-white/40">
                    {routineExercises.length} added
                  </p>
                )}
              </div>

              {routineExercises.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {routineExercises.map(({ item, exercise }, idx) => (
                    <div key={item.exerciseId}>
                      {/* Mobile compact rows */}
                      <div className="md:hidden">
                        <WorkoutExerciseCard
                          exercise={exercise}
                          index={idx}
                          sets={item.targetSets}
                          reps={item.targetReps}
                          editable
                          compact
                          canMoveUp={idx > 0}
                          canMoveDown={idx < routineExercises.length - 1}
                          onSetsChange={(sets) =>
                            updateRoutineExercise(dayOfWeek, item.exerciseId, {
                              targetSets: sets,
                            })
                          }
                          onRepsChange={(reps) =>
                            updateRoutineExercise(dayOfWeek, item.exerciseId, {
                              targetReps: reps,
                            })
                          }
                          onMoveUp={() =>
                            reorderExercise(dayOfWeek, item.exerciseId, "up")
                          }
                          onMoveDown={() =>
                            reorderExercise(dayOfWeek, item.exerciseId, "down")
                          }
                          onRemove={() =>
                            removeExerciseFromDay(dayOfWeek, item.exerciseId)
                          }
                        />
                      </div>
                      {/* Desktop full cards */}
                      <div className="hidden md:block">
                        <WorkoutExerciseCard
                          exercise={exercise}
                          index={idx}
                          sets={item.targetSets}
                          reps={item.targetReps}
                          editable
                          canMoveUp={idx > 0}
                          canMoveDown={idx < routineExercises.length - 1}
                          onSetsChange={(sets) =>
                            updateRoutineExercise(dayOfWeek, item.exerciseId, {
                              targetSets: sets,
                            })
                          }
                          onRepsChange={(reps) =>
                            updateRoutineExercise(dayOfWeek, item.exerciseId, {
                              targetReps: reps,
                            })
                          }
                          onMoveUp={() =>
                            reorderExercise(dayOfWeek, item.exerciseId, "up")
                          }
                          onMoveDown={() =>
                            reorderExercise(dayOfWeek, item.exerciseId, "down")
                          }
                          onRemove={() =>
                            removeExerciseFromDay(dayOfWeek, item.exerciseId)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aura-card rounded-2xl px-4 py-7 text-center">
                  <p className="text-sm text-white/60">
                    Nothing here yet — tap{" "}
                    <span className="font-medium text-[#f5d4b8]">+</span> in the
                    library below to add exercises.
                  </p>
                </div>
              )}

              {showPicker && (
                <div className="pt-2 md:pt-3">
                  <ExercisePickerGrid
                    exercises={availableExercises}
                    totalCount={availableTotal}
                    search={search}
                    onSearchChange={setSearch}
                    filter={filter}
                    onFilterChange={setFilter}
                    onAdd={handleAddExercise}
                  />
                </div>
              )}
            </div>

            {/* Desktop sticky coverage */}
            <aside className="hidden space-y-4 xl:block">
              <WorkoutCoveragePanel
                exercises={routineExercises.map((r) => r.exercise)}
                routineName={routineName}
                subtitle={`Repeats every ${DAY_NAMES[dayOfWeek]}`}
              />
            </aside>
          </div>

          {canSave && (
            <div className="fixed bottom-[calc(var(--nav-height)+0.5rem)] left-0 right-0 z-40 px-3 sm:hidden safe-bottom">
              <div className="aura-nav mx-auto flex max-w-md gap-2 rounded-[1.25rem] p-2 shadow-lg">
                <Button
                  variant="outline"
                  className="min-h-12 shrink-0 text-red-400"
                  onClick={handleClear}
                  aria-label="Clear routine"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  className="min-h-12 flex-1"
                  onClick={handleSave}
                  disabled={saved}
                >
                  {saveButtonLabel}
                </Button>
              </div>
            </div>
          )}
        </PageTransition>
      </MobileShell>
    </AuthGuard>
  );
}
