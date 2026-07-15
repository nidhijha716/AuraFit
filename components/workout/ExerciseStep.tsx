"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Clock, Dumbbell, Repeat } from "lucide-react";
import type { Exercise } from "@/lib/types";
import { MUSCLE_GROUP_LABELS } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";

interface ExerciseStepProps {
  exercise: Exercise;
  stepKey: string;
}

export function ExerciseStep({ exercise, stepKey }: ExerciseStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const hasVideo = Boolean(exercise.videoUrl);

  useEffect(() => {
    setMediaReady(false);
    const video = videoRef.current;
    if (!video || !exercise.videoUrl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    video.play().catch(() => {});
  }, [exercise.videoUrl, stepKey]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-5"
      >
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black/30 ring-1 ring-white/10">
          {!mediaReady && (
            <div className="absolute inset-0 animate-pulse bg-white/5" aria-hidden />
          )}

          {hasVideo ? (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                style={{ opacity: mediaReady ? 1 : 0 }}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={exercise.thumbnail}
                onCanPlay={() => setMediaReady(true)}
                aria-label={`${exercise.name} demonstration`}
              >
                <source src={exercise.videoUrl} type="video/mp4" />
              </video>
              <Image
                src={exercise.thumbnail}
                alt=""
                fill
                className="object-cover transition-opacity duration-500"
                style={{ opacity: mediaReady ? 0 : 1 }}
                sizes="(max-width: 768px) 100vw, 672px"
                unoptimized
                aria-hidden
              />
            </>
          ) : (
            <Image
              src={exercise.thumbnail}
              alt={exercise.name}
              fill
              className="object-cover transition-opacity duration-500"
              style={{ opacity: mediaReady ? 1 : 0 }}
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
              onLoad={() => setMediaReady(true)}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <Badge variant="accent">
              {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
            </Badge>
            <Badge>{exercise.equipment}</Badge>
            {hasVideo && (
              <Badge className="bg-black/40 text-white">Demo video</Badge>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
            {exercise.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-text-secondary">
            {exercise.sets && (
              <span className="flex items-center gap-1.5">
                <Repeat className="h-4 w-4" />
                {exercise.sets} sets
              </span>
            )}
            {exercise.reps && (
              <span className="flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4" />
                {exercise.reps} reps
              </span>
            )}
            {exercise.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {exercise.duration}
              </span>
            )}
          </div>
        </div>

        <GlassCard padding="md">
          <p className="mb-3 text-sm font-semibold text-text-primary">
            Instructions
          </p>
          <ol className="space-y-2.5">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-secondary">
                <span className="aura-icon flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[#f5d4b8]">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
