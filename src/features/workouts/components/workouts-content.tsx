"use client";

import Link from "next/link";
import { Plus, Dumbbell, Clock, Flame } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDuration, formatVolume } from "@/utils/format";
import { formatDisplayDate } from "@/utils/date";

interface WorkoutSummary {
  id: string;
  date: string;
  workoutName: string;
  duration: number | null;
  exerciseCount: number;
  totalVolume: number;
  exercises: {
    name: string;
    muscleGroup: string;
    sets: { weight: number | null; reps: number | null; completed: boolean }[];
  }[];
}

export function WorkoutsContent({
  workouts,
  exerciseCount,
}: {
  workouts: WorkoutSummary[];
  exerciseCount: number;
}) {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workouts</h1>
          <p className="text-sm text-muted-foreground">
            {exerciseCount} exercises in database
          </p>
        </div>
        <Link
          href="/workouts/new"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Workout</span>
        </Link>
      </div>

      {/* Workout History */}
      {workouts.length > 0 ? (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/workouts/${workout.id}`}
              className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{workout.workoutName}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDisplayDate(workout.date)}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--workout)]/10">
                  <Dumbbell className="h-4 w-4 text-[var(--workout)]" />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                {workout.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(workout.duration)}
                  </span>
                )}
                <span>{workout.exerciseCount} exercises</span>
                {workout.totalVolume > 0 && (
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {formatVolume(workout.totalVolume)}
                  </span>
                )}
              </div>

              {/* Exercise pills */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {workout.exercises.slice(0, 4).map((ex, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {ex.name}
                  </span>
                ))}
                {workout.exercises.length > 4 && (
                  <span className="rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                    +{workout.exercises.length - 4} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Dumbbell className="h-6 w-6" />}
          title="No workouts yet"
          description="Start your first workout to track your progress and hit PRs."
          action={
            <Link
              href="/workouts/new"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Start Workout
            </Link>
          }
        />
      )}
    </div>
  );
}
