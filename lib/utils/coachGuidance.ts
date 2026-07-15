import { DAY_NAMES, type DayRoutine, type WeeklyRoutines } from "@/lib/types";
import { findTemplateWhy } from "@/lib/data/beginnerPlans";
import { getTodayDayOfWeek } from "@/lib/utils/dateKey";

export interface CoachGuidance {
  mode: "train" | "rest" | "empty";
  title: string;
  why: string;
  nextLine: string;
  ctaLabel: string;
  ctaHref: string;
  estimatedMinutesHint?: string;
}

function nextTrainingDay(
  weekly: WeeklyRoutines,
  fromDay: number
): { dayOfWeek: number; routine: DayRoutine } | null {
  for (let offset = 1; offset <= 7; offset++) {
    const day = (fromDay + offset) % 7;
    const routine = weekly[day];
    if (routine && routine.exercises.length > 0) {
      return { dayOfWeek: day, routine };
    }
  }
  return null;
}

export function getCoachGuidance(
  weekly: WeeklyRoutines,
  today: number = getTodayDayOfWeek()
): CoachGuidance {
  const todayRoutine = weekly[today];
  const hasAny = Object.values(weekly).some(
    (r) => r !== null && r.exercises.length > 0
  );

  if (!hasAny) {
    return {
      mode: "empty",
      title: "Not sure where to start?",
      why: "We’ll give you a simple beginner week — short full-body sessions so you never guess which exercise comes next.",
      nextLine: "Takes about 10 seconds. You can edit any day later.",
      ctaLabel: "Get my beginner plan",
      ctaHref: "#install-beginner-plan",
    };
  }

  if (todayRoutine && todayRoutine.exercises.length > 0) {
    const why =
      findTemplateWhy(todayRoutine.name) ??
      "Follow today’s list in order — no need to invent exercises.";
    const next = nextTrainingDay(weekly, today);
    const nextLine = next
      ? `Next: ${DAY_NAMES[next.dayOfWeek]} — ${next.routine.name}`
      : "After today, rest and come back tomorrow.";

    return {
      mode: "train",
      title: `Today: ${todayRoutine.name}`,
      why,
      nextLine,
      ctaLabel: "Start today’s workout",
      ctaHref: "/workout/today",
    };
  }

  const next = nextTrainingDay(weekly, today);
  return {
    mode: "rest",
    title: "Today is a rest day",
    why: "Rest is part of the plan — muscles grow while you recover.",
    nextLine: next
      ? `Next workout: ${DAY_NAMES[next.dayOfWeek]} — ${next.routine.name}`
      : "Add training days in Schedule when you’re ready.",
    ctaLabel: next ? "Preview schedule" : "Open schedule",
    ctaHref: next ? `/schedule/${next.dayOfWeek}` : "/schedule",
  };
}
