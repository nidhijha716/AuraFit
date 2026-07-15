import type { ThemePresetId } from "@/lib/config/themePresets";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type FitnessGoal =
  | "lose_weight"
  | "build_muscle"
  | "stay_active"
  | "improve_endurance";
export type Sex = "male" | "female" | "prefer_not_to_say";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "full_body";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  goals: FitnessGoal[];
  experienceLevel: ExperienceLevel;
  workoutDays: number[];
  onboardingComplete: boolean;
  heightCm?: number | null;
  weightKg?: number | null;
  sex?: Sex | null;
  age?: number | null;
  activityLevel?: ActivityLevel | null;
  themePreset?: ThemePresetId;
  reminderEnabled?: boolean;
  /** Local time HH:mm for workout-day nudge */
  reminderTimeLocal?: string;
  createdAt: string;
}

/** Best logged lift for an exercise (requires weight). */
export interface PersonalRecord {
  exerciseId: string;
  weightKg: number;
  reps: number;
  achievedAt: string;
  sourceDate?: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  instructions: string[];
  videoUrl?: string;
  thumbnail: string;
  /** All demonstration images from free-exercise-db */
  images?: string[];
  level?: Difficulty;
  category?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  force?: string | null;
  mechanic?: string | null;
  sets?: number;
  reps?: string;
  duration?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exerciseIds: string[];
  estimatedMinutes: number;
  difficulty: Difficulty;
  muscleGroups: MuscleGroup[];
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutName: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  exercisesCompleted: string[];
  /** Automatically estimated at finish — always labeled as estimated in UI. */
  estimatedCaloriesBurned?: number;
}

export interface ProgressStats {
  totalWorkouts: number;
  streak: number;
  weeklyMinutes: number;
  lastWorkoutDate: string | null;
  muscleGroupBreakdown: Record<MuscleGroup, number>;
}

export interface ActiveSession {
  workoutId: string;
  workoutName: string;
  exerciseIds: string[];
  currentIndex: number;
  completedExerciseIds: string[];
  startedAt: string;
  isCustom?: boolean;
}

/** A single exercise slot inside a recurring day routine */
export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  order: number;
}

/** Recurring weekly routine for one weekday (0=Sun … 6=Sat) */
export interface DayRoutine {
  dayOfWeek: number;
  name: string;
  exercises: RoutineExercise[];
  updatedAt: string;
}

/** Log for one set of an exercise */
export interface SetLog {
  setNumber: number;
  reps: number;
  completed: boolean;
  /** Optional load in kg — leave empty for bodyweight moves */
  weightKg?: number | null;
}

export const DEFAULT_REST_SECONDS = 90;
export const WEIGHT_QUICK_OPTIONS = [10, 15, 20, 25, 30, 40, 50] as const;

/** Daily checklist entry for one exercise */
export interface ExerciseCheckEntry {
  exerciseId: string;
  completed: boolean;
  sets: SetLog[];
  completedAt?: string;
}

/** Checklist for a specific calendar date */
export interface DailyChecklist {
  date: string;
  dayOfWeek: number;
  routineName: string;
  exercises: ExerciseCheckEntry[];
  allComplete: boolean;
  completedAt?: string;
}

export type WeeklyRoutines = Record<number, DayRoutine | null>;

export const REP_QUICK_OPTIONS = [6, 8, 10, 12, 15, 20] as const;

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  lose_weight: "Lose Weight",
  build_muscle: "Build Muscle",
  stay_active: "Stay Active",
  improve_endurance: "Improve Endurance",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const SEX_OPTIONS: Sex[] = ["male", "female", "prefer_not_to_say"];

export const SEX_LABELS: Record<Sex, string> = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
};

export const ACTIVITY_LEVEL_OPTIONS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Lightly active",
  moderate: "Moderately active",
  active: "Active",
  very_active: "Very active",
};

export const ACTIVITY_LEVEL_HINTS: Record<ActivityLevel, string> = {
  sedentary: "Desk job, little exercise",
  light: "Light exercise 1–3 days/week",
  moderate: "Exercise 3–5 days/week",
  active: "Hard exercise 6–7 days/week",
  very_active: "Physical job or 2×/day training",
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  legs: "Legs",
  shoulders: "Shoulders",
  arms: "Arms",
  core: "Core",
  full_body: "Full Body",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
