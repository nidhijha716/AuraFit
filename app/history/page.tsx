"use client";

import Link from "next/link";
import { Calendar, ChevronLeft, Clock } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { MobileShell } from "@/components/layout/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { formatDate, formatDuration } from "@/lib/utils/formatDate";

export default function HistoryPage() {
  const sessions = useWorkoutStore((s) => s.sessions);

  return (
    <AuthGuard>
      <MobileShell>
        <PageTransition>
          <PageHeader
            title="Workout History"
            subtitle={`${sessions.length} completed session${sessions.length !== 1 ? "s" : ""}`}
            backHref="/dashboard"
          />

          {sessions.length > 0 ? (
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
              {sessions.map((session) => (
                <GlassCard key={session.id} padding="md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">
                        {session.workoutName}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(session.completedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(session.durationMinutes)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="success">
                      {session.exercisesCompleted.length} exercises
                    </Badge>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard padding="lg" className="text-center">
              <p className="mb-4 text-sm text-text-muted">
                No workout history yet. Complete your first training session!
              </p>
              <Link
                href="/workout/today"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#f5d4b8]"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
                Start a workout
              </Link>
            </GlassCard>
          )}
        </PageTransition>
      </MobileShell>
    </AuthGuard>
  );
}
