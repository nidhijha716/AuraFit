"use client";

import Image from "next/image";
import { Plus, Search } from "lucide-react";
import type { Exercise, MuscleGroup } from "@/lib/types";
import { MUSCLE_GROUP_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface ExercisePickerGridProps {
  exercises: Exercise[];
  totalCount?: number;
  search: string;
  onSearchChange: (value: string) => void;
  filter: MuscleGroup | "all";
  onFilterChange: (filter: MuscleGroup | "all") => void;
  onAdd: (exerciseId: string) => void;
}

const filters: (MuscleGroup | "all")[] = [
  "all",
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "full_body",
];

export function ExercisePickerGrid({
  exercises,
  totalCount,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onAdd,
}: ExercisePickerGridProps) {
  return (
    <div className="aura-card w-full max-w-full min-w-0 overflow-hidden rounded-[1.5rem] md:rounded-2xl">
      <div className="min-w-0 border-b border-white/8 p-3.5 md:p-5">
        <h3 className="text-sm font-semibold text-white md:text-base">
          Add exercises
        </h3>
        {totalCount !== undefined && (
          <p className="mt-0.5 text-xs text-white/45">
            {exercises.length === totalCount
              ? `${totalCount} available`
              : `Showing ${exercises.length} of ${totalCount}`}
          </p>
        )}

        <div className="relative mt-3 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            enterKeyHint="search"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="aura-input h-11 w-full max-w-full rounded-2xl pl-10 pr-3 text-sm"
          />
        </div>

        <div className="no-scrollbar mt-3 -mx-3.5 flex gap-2 overflow-x-auto px-3.5 pb-0.5 md:mx-0 md:px-0">
          {filters.map((mg) => (
            <button
              key={mg}
              type="button"
              onClick={() => onFilterChange(mg)}
              className={cn(
                "min-h-9 shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-all active:scale-[0.97]",
                filter === mg
                  ? "aura-choice-selected"
                  : "glass text-white/75"
              )}
            >
              {mg === "all" ? "All" : MUSCLE_GROUP_LABELS[mg]}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: vertical list (thumb-friendly). Desktop: image grid */}
      <div className="max-h-[min(50dvh,380px)] overflow-y-auto overscroll-contain md:max-h-[420px]">
        <ul className="divide-y divide-white/6 md:hidden">
          {exercises.map((ex) => (
            <li key={ex.id}>
              <button
                type="button"
                onClick={() => onAdd(ex.id)}
                className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left active:bg-white/5"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                  <Image
                    src={ex.thumbnail}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {ex.name}
                  </p>
                  <p className="truncate text-[11px] text-white/45">
                    {MUSCLE_GROUP_LABELS[ex.muscleGroup]} · {ex.equipment}
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0b48a] text-[#141820]">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden grid-cols-3 gap-2.5 p-4 md:grid lg:grid-cols-2 xl:grid-cols-3">
          {exercises.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => onAdd(ex.id)}
              className="group overflow-hidden rounded-2xl text-left ring-1 ring-white/10 transition-all hover:ring-[#f0b48a]/35"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={ex.thumbnail}
                  alt={ex.name}
                  fill
                  className="object-cover"
                  sizes="180px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f0b48a] text-[#141820]">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </div>
              <div className="bg-black/35 p-2.5">
                <p className="line-clamp-2 text-xs font-semibold text-white">
                  {ex.name}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-white/50">
                  {MUSCLE_GROUP_LABELS[ex.muscleGroup]}
                </p>
              </div>
            </button>
          ))}
        </div>

        {exercises.length === 0 && (
          <p className="py-10 text-center text-sm text-white/45">
            No exercises found.
          </p>
        )}
      </div>
    </div>
  );
}
