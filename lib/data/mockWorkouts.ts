import type { Workout } from "@/lib/types";

export const mockWorkouts: Workout[] = [
  {
    id: "wo-push",
    name: "Push Day",
    description: "Chest, shoulders, and triceps focused strength session.",
    exerciseIds: ["ex-1", "ex-2", "ex-7", "ex-8", "ex-10"],
    estimatedMinutes: 45,
    difficulty: "intermediate",
    muscleGroups: ["chest", "shoulders", "arms"],
  },
  {
    id: "wo-pull",
    name: "Pull Day",
    description: "Back and biceps workout for upper body pulling strength.",
    exerciseIds: ["ex-3", "ex-4", "ex-14", "ex-9", "ex-11"],
    estimatedMinutes: 40,
    difficulty: "intermediate",
    muscleGroups: ["back", "arms", "core"],
  },
  {
    id: "wo-legs",
    name: "Leg Day",
    description: "Lower body power session targeting quads, hamstrings, and glutes.",
    exerciseIds: ["ex-5", "ex-6", "ex-13", "ex-11", "ex-12"],
    estimatedMinutes: 50,
    difficulty: "intermediate",
    muscleGroups: ["legs", "core"],
  },
  {
    id: "wo-full",
    name: "Full Body Burn",
    description: "High-energy full body circuit for total conditioning.",
    exerciseIds: ["ex-16", "ex-5", "ex-1", "ex-17", "ex-18", "ex-3"],
    estimatedMinutes: 35,
    difficulty: "beginner",
    muscleGroups: ["full_body", "legs", "chest", "core"],
  },
  {
    id: "wo-upper",
    name: "Upper Body Sculpt",
    description: "Balanced upper body session for strength and definition.",
    exerciseIds: ["ex-2", "ex-15", "ex-4", "ex-7", "ex-9", "ex-10"],
    estimatedMinutes: 55,
    difficulty: "advanced",
    muscleGroups: ["chest", "back", "shoulders", "arms"],
  },
];

export function getBeginnerStarterWorkout(): Workout {
  return {
    id: "wo-beginner-starter",
    name: "Full Body Starter",
    description:
      "A short beginner-friendly session — squat, push, pull, and core. Perfect when you don’t have a custom plan yet.",
    exerciseIds: [
      "Bodyweight_Squat",
      "Incline_Push-Up",
      "Bent_Over_Two-Dumbbell_Row",
      "Butt_Lift_Bridge",
      "Plank",
    ],
    estimatedMinutes: 30,
    difficulty: "beginner",
    muscleGroups: ["full_body", "legs", "chest", "back", "core"],
  };
}

export function getWorkoutById(id: string): Workout | undefined {
  if (id === "wo-beginner-starter") {
    return getBeginnerStarterWorkout();
  }
  return mockWorkouts.find((w) => w.id === id);
}

export function getTodayWorkout(options?: {
  preferBeginner?: boolean;
}): Workout {
  if (options?.preferBeginner) {
    return getBeginnerStarterWorkout();
  }
  const dayIndex = new Date().getDay();
  return mockWorkouts[dayIndex % mockWorkouts.length];
}
