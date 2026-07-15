"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDuration } from "@/lib/utils/formatDate";

interface WorkoutCompleteProps {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  onContinue: () => void;
  isGuest?: boolean;
}

export function WorkoutComplete({
  workoutName,
  durationMinutes,
  exercisesCompleted,
  onContinue,
  isGuest = false,
}: WorkoutCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex min-h-[70dvh] flex-col items-center justify-center px-2 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full aura-icon"
      >
        <CheckCircle2 className="h-10 w-10 text-[#f5d4b8]" />
      </motion.div>

      <h2 className="text-3xl font-bold text-white">
        Workout <span className="aura-section-title">Complete!</span>
      </h2>
      <p className="mt-2 text-text-secondary">{workoutName}</p>

      <div className="mt-8 grid w-full grid-cols-2 gap-3">
        <GlassCard padding="md" className="text-center">
          <Clock className="mx-auto mb-2 h-5 w-5 text-[#f5d4b8]" />
          <p className="text-lg font-bold text-text-primary">
            {formatDuration(durationMinutes)}
          </p>
          <p className="text-xs text-text-muted">Duration</p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <Flame className="mx-auto mb-2 h-5 w-5 text-[#f5d4b8]" />
          <p className="text-lg font-bold text-text-primary">
            {exercisesCompleted}
          </p>
          <p className="text-xs text-text-muted">Exercises</p>
        </GlassCard>
      </div>

      <p className="mt-4 text-xs text-text-muted">
        Estimated calories are on your Progress page.
      </p>

      {isGuest && (
        <GlassCard padding="md" className="mt-6 w-full text-left">
          <p className="text-sm font-semibold text-text-primary">
            Want to save this workout and track your progress?
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Create a free account to keep your history, routines, and streaks
            permanently.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link href="/auth?mode=signup" className="flex-1">
              <Button size="md" fullWidth>
                Create Free Account
              </Button>
            </Link>
            <Link href="/auth?mode=login" className="flex-1">
              <Button size="md" variant="outline" fullWidth>
                Log In
              </Button>
            </Link>
          </div>
        </GlassCard>
      )}

      <Button size="lg" fullWidth className="mt-8" onClick={onContinue}>
        Back to Dashboard
      </Button>
    </motion.div>
  );
}
