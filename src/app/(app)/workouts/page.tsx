import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { WorkoutsContent } from "@/features/workouts/components/workouts-content";

export const metadata: Metadata = {
  title: "Workouts",
};

export default async function WorkoutsPage() {
  const userId = await requireAuth();

  const [recentWorkouts, exercises] = await Promise.all([
    prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.exercise.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const workoutsWithVolume = recentWorkouts.map((w) => ({
    id: w.id,
    date: w.date.toISOString().split("T")[0],
    workoutName: w.workoutName,
    duration: w.duration,
    exerciseCount: w.exercises.length,
    totalVolume: w.exercises.reduce(
      (total, we) =>
        total +
        we.sets
          .filter((s) => s.completed)
          .reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0),
      0
    ),
    exercises: w.exercises.map((we) => ({
      name: we.exercise.name,
      muscleGroup: we.exercise.muscleGroup,
      sets: we.sets.map((s) => ({
        weight: s.weight,
        reps: s.reps,
        completed: s.completed,
      })),
    })),
  }));

  return (
    <WorkoutsContent
      workouts={workoutsWithVolume}
      exerciseCount={exercises.length}
    />
  );
}
