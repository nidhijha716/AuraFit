"use client";



import { useState, useMemo } from "react";

import Link from "next/link";

import Image from "next/image";

import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { AuthGuard } from "@/components/layout/AuthGuard";

import { MobileShell } from "@/components/layout/MobileShell";

import { PageHeader } from "@/components/layout/PageHeader";

import { Badge } from "@/components/ui/Badge";

import { GlassCard } from "@/components/ui/GlassCard";

import { PageTransition } from "@/components/ui/PageTransition";

import { allExercises, searchExercises } from "@/lib/data/exercises";

import {

  MUSCLE_GROUP_LABELS,

  DIFFICULTY_LABELS,

  type MuscleGroup,

} from "@/lib/types";

import { cn } from "@/lib/utils/cn";



const PAGE_SIZE = 24;



const muscleGroups: (MuscleGroup | "all")[] = [

  "all",

  "chest",

  "back",

  "legs",

  "shoulders",

  "arms",

  "core",

  "full_body",

];



export default function ExerciseLibraryPage() {

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<MuscleGroup | "all">("all");

  const [page, setPage] = useState(0);



  const { items: filtered, total } = useMemo(() => {

    return searchExercises({

      search,

      muscleGroup: filter,

      limit: PAGE_SIZE,

      offset: page * PAGE_SIZE,

    });

  }, [search, filter, page]);



  const totalPages = Math.ceil(total / PAGE_SIZE);



  const handleFilterChange = (mg: MuscleGroup | "all") => {

    setFilter(mg);

    setPage(0);

  };



  const handleSearchChange = (value: string) => {

    setSearch(value);

    setPage(0);

  };



  return (

    <AuthGuard>

      <MobileShell>

        <PageTransition>

          <PageHeader

            title="Exercise Library"

            subtitle={`${allExercises.length} exercises with photos`}

          />



          <div className="relative mb-4">

            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

            <input

              type="text"

              placeholder="Search exercises..."

              value={search}

              onChange={(e) => handleSearchChange(e.target.value)}

              className="aura-input h-12 w-full rounded-2xl pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted"

            />

          </div>



          <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">

            {muscleGroups.map((mg) => (

              <button

                key={mg}

                type="button"

                onClick={() => handleFilterChange(mg)}

                className={cn(

                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",

                  filter === mg

                    ? "aura-btn-primary text-sm font-semibold"

                    : "glass text-text-primary hover:bg-[var(--glass-hover)]"

                )}

              >

                {mg === "all" ? "All" : MUSCLE_GROUP_LABELS[mg]}

              </button>

            ))}

          </div>



          <p className="mb-3 text-xs text-text-muted">

            Showing {total === 0 ? 0 : page * PAGE_SIZE + 1}–

            {Math.min((page + 1) * PAGE_SIZE, total)} of {total}

          </p>



          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">

            {filtered.map((exercise) => (

              <Link key={exercise.id} href={`/exercises/${exercise.id}`}>

                <GlassCard padding="none" hover className="overflow-hidden">

                  <div className="relative aspect-[4/3]">

                    <Image

                      src={exercise.thumbnail}

                      alt={exercise.name}

                      fill

                      className="object-cover"

                      sizes="200px"

                      unoptimized

                    />

                  </div>

                  <div className="p-3">

                    <p className="truncate text-sm font-semibold text-text-primary">

                      {exercise.name}

                    </p>

                    <div className="mt-1.5 flex flex-wrap gap-1">

                      <Badge>{MUSCLE_GROUP_LABELS[exercise.muscleGroup]}</Badge>

                      {exercise.level && (

                        <Badge variant="accent">

                          {DIFFICULTY_LABELS[exercise.level]}

                        </Badge>

                      )}

                    </div>

                  </div>

                </GlassCard>

              </Link>

            ))}

          </div>



          {filtered.length === 0 && (

            <GlassCard padding="lg" className="mt-4 text-center">

              <p className="text-sm text-text-muted">No exercises found.</p>

            </GlassCard>

          )}



          {totalPages > 1 && (

            <div className="mt-6 flex items-center justify-center gap-3">

              <button

                type="button"

                onClick={() => setPage((p) => Math.max(0, p - 1))}

                disabled={page === 0}

                className="aura-btn-primary flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40"

                aria-label="Previous page"

              >

                <ChevronLeft className="h-5 w-5" />

              </button>

              <span className="text-sm text-text-secondary">

                Page {page + 1} of {totalPages}

              </span>

              <button

                type="button"

                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}

                disabled={page >= totalPages - 1}

                className="aura-btn-primary flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40"

                aria-label="Next page"

              >

                <ChevronRight className="h-5 w-5" />

              </button>

            </div>

          )}

        </PageTransition>

      </MobileShell>

    </AuthGuard>

  );

}

