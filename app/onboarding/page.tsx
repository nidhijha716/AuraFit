"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { MobileShell } from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { PageTransition } from "@/components/ui/PageTransition";
import { useRoutineStore } from "@/lib/store/routineStore";
import { useUserStore } from "@/lib/store/userStore";
import {
  DAY_LABELS,
  EXPERIENCE_LABELS,
  FITNESS_GOAL_LABELS,
  ACTIVITY_LEVEL_HINTS,
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVEL_OPTIONS,
  SEX_LABELS,
  SEX_OPTIONS,
  type ActivityLevel,
  type ExperienceLevel,
  type FitnessGoal,
  type Sex,
} from "@/lib/types";
import {
  BMI_CATEGORY_LABELS,
  calculateBmi,
  getBmiCategory,
  isValidHeightCm,
  isValidWeightKg,
} from "@/lib/utils/bmi";
import { isValidAge } from "@/lib/utils/calories";
import { cn } from "@/lib/utils/cn";
import { installPlanForExperience } from "@/lib/utils/installBeginnerPlan";

const goals: FitnessGoal[] = [
  "lose_weight",
  "build_muscle",
  "stay_active",
  "improve_endurance",
];

const levels: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const user = useUserStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name ?? "");
  const [selectedGoals, setSelectedGoals] = useState<FitnessGoal[]>(
    user?.goals?.length ? user.goals : ["stay_active"]
  );
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("beginner");
  const [sex, setSex] = useState<Sex | null>(user?.sex ?? null);
  const [age, setAge] = useState(user?.age != null ? String(user.age) : "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    user?.activityLevel ?? "moderate"
  );
  const [heightCm, setHeightCm] = useState(
    user?.heightCm != null ? String(user.heightCm) : ""
  );
  const [weightKg, setWeightKg] = useState(
    user?.weightKg != null ? String(user.weightKg) : ""
  );
  const [workoutDays, setWorkoutDays] = useState<number[]>([1, 3, 5]);

  const heightNum = Number(heightCm);
  const weightNum = Number(weightKg);
  const ageNum = Number(age);
  const bmi = useMemo(
    () =>
      isValidHeightCm(heightNum) && isValidWeightKg(weightNum)
        ? calculateBmi(heightNum, weightNum)
        : null,
    [heightNum, weightNum]
  );

  const toggleGoal = (goal: FitnessGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.length > 1
          ? prev.filter((g) => g !== goal)
          : prev
        : [...prev, goal]
    );
  };

  const toggleDay = (day: number) => {
    setWorkoutDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      return;
    }

    if (!sex || !bmi || !activityLevel || !isValidAge(ageNum)) return;

    await completeOnboarding({
      name: name.trim() || "Athlete",
      goals: selectedGoals,
      experienceLevel,
      workoutDays,
      heightCm: heightNum,
      weightKg: weightNum,
      sex,
      age: ageNum,
      activityLevel,
    });

    // Auto-install a level-appropriate weekly plan so users never start empty.
    {
      const { setDayRoutine, clearDayRoutine } = useRoutineStore.getState();
      const userId = useUserStore.getState().user?.id;
      installPlanForExperience({
        experienceLevel,
        workoutDays,
        setDayRoutine,
        clearDayRoutine,
        userId,
      });
    }

    router.push("/dashboard");
  };

  const canProceed =
    step === 0
      ? name.trim().length > 0 && selectedGoals.length > 0
      : step === 2
        ? sex !== null &&
          activityLevel !== null &&
          isValidAge(ageNum) &&
          isValidHeightCm(heightNum) &&
          isValidWeightKg(weightNum)
        : step === 3
          ? workoutDays.length > 0
          : true;

  return (
    <AuthGuard requireAuth={true} requireOnboarding={false}>
      <MobileShell showNav={false} narrow>
        <PageTransition className="pb-10 pt-2 md:pt-4">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-8 md:mb-10">
              <div className="mb-4 flex gap-2">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i <= step ? "bg-[#f0b48a]" : "bg-white/10"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                Step {step + 1} of {TOTAL_STEPS}
              </p>
            </div>

            {step === 0 && (
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">
                    What should we{" "}
                    <span className="aura-section-title">call you?</span>
                  </h1>
                  <p className="mt-2 text-sm text-white/70 md:text-base">
                    Let&apos;s personalize your experience.
                  </p>
                </div>
                <Input
                  label="Your Name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div>
                  <p className="mb-1 text-sm font-medium text-white/72 md:text-base">
                    What are your goals?
                  </p>
                  <p className="mb-3 text-xs text-white/50 md:text-sm">
                    Select all that apply
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                    {goals.map((g) => {
                      const selected = selectedGoals.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGoal(g)}
                          className={cn(
                            "relative rounded-2xl px-3 py-3 text-sm font-medium transition-all md:py-4 md:text-base",
                            selected
                              ? "aura-choice-selected"
                              : "glass text-text-primary hover:bg-[var(--glass-hover)]"
                          )}
                        >
                          {selected && (
                            <Check className="absolute right-2 top-2 h-3.5 w-3.5 opacity-70" />
                          )}
                          {FITNESS_GOAL_LABELS[g]}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-center text-xs text-white/50 md:text-sm">
                    {selectedGoals.length} goal
                    {selectedGoals.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">
                    What&apos;s your{" "}
                    <span className="aura-section-title">experience?</span>
                  </h1>
                  <p className="mt-2 text-sm text-white/70 md:text-base">
                    We&apos;ll adjust workout intensity accordingly.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {levels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperienceLevel(level)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition-all md:flex-col md:items-start md:gap-2 md:py-5",
                        experienceLevel === level
                          ? "aura-choice-selected"
                          : "glass hover:bg-[var(--glass-hover)]"
                      )}
                    >
                      <div>
                        <p className="font-semibold">
                          {EXPERIENCE_LABELS[level]}
                        </p>
                        <p className="mt-0.5 text-xs opacity-80 md:text-sm">
                          {level === "beginner" && "New to structured workouts"}
                          {level === "intermediate" && "Regular gym-goer"}
                          {level === "advanced" && "Experienced athlete"}
                        </p>
                      </div>
                      {experienceLevel === level && (
                        <ChevronRight className="h-5 w-5 opacity-70 md:hidden" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">
                    Body{" "}
                    <span className="aura-section-title">metrics</span>
                  </h1>
                  <p className="mt-2 text-sm text-white/70 md:text-base">
                    Used for BMI and estimated daily calorie targets. Units are
                    cm and kg.
                  </p>
                </div>

                <Input
                  label="Age"
                  type="number"
                  inputMode="numeric"
                  min={13}
                  max={100}
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  error={
                    age !== "" && !isValidAge(ageNum)
                      ? "Enter a whole number between 13–100"
                      : undefined
                  }
                />

                <div>
                  <p className="mb-3 text-sm font-medium text-white/72">Sex</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {SEX_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSex(option)}
                        className={cn(
                          "rounded-2xl px-3 py-3 text-sm font-medium transition-all",
                          sex === option
                            ? "aura-choice-selected"
                            : "glass text-text-primary hover:bg-[var(--glass-hover)]"
                        )}
                      >
                        {SEX_LABELS[option]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Height (cm)"
                    type="number"
                    inputMode="decimal"
                    min={100}
                    max={250}
                    placeholder="e.g. 170"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    error={
                      heightCm !== "" && !isValidHeightCm(heightNum)
                        ? "Enter a height between 100–250 cm"
                        : undefined
                    }
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    inputMode="decimal"
                    min={30}
                    max={300}
                    placeholder="e.g. 70"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    error={
                      weightKg !== "" && !isValidWeightKg(weightNum)
                        ? "Enter a weight between 30–300 kg"
                        : undefined
                    }
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-white/72">
                    Activity level
                  </p>
                  <div className="grid gap-2">
                    {ACTIVITY_LEVEL_OPTIONS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setActivityLevel(level)}
                        className={cn(
                          "rounded-2xl px-3 py-3 text-left text-sm transition-all",
                          activityLevel === level
                            ? "aura-choice-selected"
                            : "glass text-text-primary hover:bg-[var(--glass-hover)]"
                        )}
                      >
                        <span className="font-medium">
                          {ACTIVITY_LEVEL_LABELS[level]}
                        </span>
                        <span className="mt-0.5 block text-xs opacity-70">
                          {ACTIVITY_LEVEL_HINTS[level]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {bmi != null && (
                  <GlassCard className="text-center">
                    <p className="text-xs uppercase tracking-wider text-white/50">
                      Your BMI
                    </p>
                    <p className="mt-1 text-3xl font-bold text-text-primary">
                      {bmi}
                    </p>
                    <p className="mt-1 text-sm text-accent">
                      {BMI_CATEGORY_LABELS[getBmiCategory(bmi)]}
                    </p>
                  </GlassCard>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">
                    When do you want to{" "}
                    <span className="aura-section-title">train?</span>
                  </h1>
                  <p className="mt-2 text-sm text-white/70 md:text-base">
                    Select your preferred workout days.
                    {experienceLevel === "beginner" &&
                      " We’ll fill them with a simple full-body starter plan."}
                    {experienceLevel === "intermediate" &&
                      " We’ll fill them with an intermediate Push / Pull / Legs split."}
                    {experienceLevel === "advanced" &&
                      " We’ll fill them with a denser advanced Push / Pull / Legs split."}
                  </p>
                </div>
                <GlassCard>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {DAY_LABELS.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={cn(
                          "flex h-11 w-11 flex-col items-center justify-center rounded-xl text-xs font-medium transition-all md:h-14 md:w-14 md:text-sm",
                          workoutDays.includes(i)
                            ? "aura-choice-selected"
                            : "glass text-white/65"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </GlassCard>
                <p className="text-center text-sm text-text-muted">
                  {workoutDays.length} day{workoutDays.length !== 1 ? "s" : ""}{" "}
                  selected
                </p>
              </div>
            )}

            <div className="mt-10 flex gap-3 md:mt-12">
              {step > 0 && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1 md:max-w-[200px]"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                size="lg"
                className="flex-1 md:max-w-xs md:ml-auto"
                disabled={!canProceed}
                onClick={handleNext}
              >
                {step === TOTAL_STEPS - 1 ? "Start Training" : "Continue"}
              </Button>
            </div>
          </div>
        </PageTransition>
      </MobileShell>
    </AuthGuard>
  );
}
