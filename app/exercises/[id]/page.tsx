"use client";



import { use, useState } from "react";

import Link from "next/link";

import Image from "next/image";

import { notFound } from "next/navigation";

import { Clock, Dumbbell, Repeat } from "lucide-react";

import { AuthGuard } from "@/components/layout/AuthGuard";

import { MobileShell } from "@/components/layout/MobileShell";

import { PageHeader } from "@/components/layout/PageHeader";

import { Badge } from "@/components/ui/Badge";

import { GlassCard } from "@/components/ui/GlassCard";

import { PageTransition } from "@/components/ui/PageTransition";

import { getExerciseById, getRelatedExercises } from "@/lib/data/exercises";

import {

  MUSCLE_GROUP_LABELS,

  DIFFICULTY_LABELS,

} from "@/lib/types";

import { cn } from "@/lib/utils/cn";



export default function ExerciseDetailPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = use(params);

  const exercise = getExerciseById(id);



  if (!exercise) {

    notFound();

  }



  const images = exercise.images?.length

    ? exercise.images

    : [exercise.thumbnail];

  const [activeImage, setActiveImage] = useState(0);



  const related = getRelatedExercises(exercise, 3);



  return (

    <AuthGuard>

      <MobileShell>

        <PageTransition>

          <PageHeader

            title={exercise.name}

            subtitle={MUSCLE_GROUP_LABELS[exercise.muscleGroup]}

            backHref="/exercises"

          />



          <div className="relative mb-3 aspect-video overflow-hidden rounded-2xl">

            <Image

              src={images[activeImage]}

              alt={exercise.name}

              fill

              className="object-cover"

              sizes="(max-width: 448px) 100vw, 448px"

              unoptimized

            />

          </div>



          {images.length > 1 && (

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">

              {images.map((src, i) => (

                <button

                  key={src}

                  type="button"

                  onClick={() => setActiveImage(i)}

                  className={cn(

                    "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition-all",

                    activeImage === i

                      ? "ring-[#f0b48a]"

                      : "ring-transparent opacity-70 hover:opacity-100"

                  )}

                >

                  <Image

                    src={src}

                    alt={`${exercise.name} step ${i + 1}`}

                    fill

                    className="object-cover"

                    sizes="96px"

                    unoptimized

                  />

                </button>

              ))}

            </div>

          )}



          <div className="mb-5 flex flex-wrap gap-2">

            <Badge variant="accent">{exercise.equipment}</Badge>

            {exercise.level && (

              <Badge>{DIFFICULTY_LABELS[exercise.level]}</Badge>

            )}

            {exercise.category && (

              <Badge className="capitalize">{exercise.category}</Badge>

            )}

            {exercise.sets && (

              <Badge>

                <Repeat className="mr-1 h-3 w-3" />

                {exercise.sets} sets

              </Badge>

            )}

            {exercise.reps && (

              <Badge>

                <Dumbbell className="mr-1 h-3 w-3" />

                {exercise.reps}

              </Badge>

            )}

            {exercise.duration && (

              <Badge>

                <Clock className="mr-1 h-3 w-3" />

                {exercise.duration}

              </Badge>

            )}

          </div>



          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (

            <GlassCard className="mb-5">

              <h3 className="mb-2 text-sm font-semibold text-text-primary">

                Muscles worked

              </h3>

              <div className="flex flex-wrap gap-1.5">

                {exercise.primaryMuscles.map((m) => (

                  <Badge key={m} variant="accent" className="capitalize">

                    {m}

                  </Badge>

                ))}

                {exercise.secondaryMuscles?.map((m) => (

                  <Badge key={m} className="capitalize opacity-75">

                    {m}

                  </Badge>

                ))}

              </div>

            </GlassCard>

          )}



          <GlassCard className="mb-5">

            <h3 className="mb-3 font-semibold text-text-primary">Instructions</h3>

            <ol className="space-y-3">

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



          {related.length > 0 && (

            <>

              <h3 className="mb-3 font-semibold text-text-primary">

                Related Exercises

              </h3>

              <div className="space-y-2">

                {related.map((rel) => (

                  <Link key={rel.id} href={`/exercises/${rel.id}`}>

                    <GlassCard padding="sm" hover className="flex items-center gap-3">

                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">

                        <Image

                          src={rel.thumbnail}

                          alt={rel.name}

                          fill

                          className="object-cover"

                          sizes="48px"

                          unoptimized

                        />

                      </div>

                      <div>

                        <p className="font-medium text-text-primary">{rel.name}</p>

                        <p className="text-xs text-text-muted">{rel.equipment}</p>

                      </div>

                    </GlassCard>

                  </Link>

                ))}

              </div>

            </>

          )}

        </PageTransition>

      </MobileShell>

    </AuthGuard>

  );

}

