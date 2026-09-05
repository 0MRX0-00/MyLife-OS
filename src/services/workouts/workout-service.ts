import prisma from "@/lib/prisma";
import { CreateWorkoutInput } from "@/types/workout";

export async function getUserWorkouts(userId: string, limit = 20) {
  return prisma.workout.findMany({
    where: { userId },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getWorkoutById(userId: string, id: string) {
  return prisma.workout.findFirst({
    where: { id, userId },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function createWorkout(userId: string, input: CreateWorkoutInput) {
  const dateObj = new Date(input.date);
  dateObj.setUTCHours(0, 0, 0, 0);

  return prisma.$transaction(async (tx) => {
    // 1. Create Workout
    const workout = await tx.workout.create({
      data: {
        userId,
        date: dateObj,
        workoutName: input.workoutName,
        duration: input.duration || null,
        notes: input.notes || null,
      },
    });

    // 2. Create WorkoutExercises & ExerciseSets
    for (let i = 0; i < input.exercises.length; i++) {
      const ex = input.exercises[i];
      const workoutExercise = await tx.workoutExercise.create({
        data: {
          workoutId: workout.id,
          exerciseId: ex.exerciseId,
          order: i,
        },
      });

      for (let j = 0; j < ex.sets.length; j++) {
        const s = ex.sets[j];
        await tx.exerciseSet.create({
          data: {
            workoutExerciseId: workoutExercise.id,
            setNumber: j + 1,
            weight: s.weight ?? null,
            reps: s.reps ?? null,
            duration: s.duration ?? null,
            distance: s.distance ?? null,
            rpe: s.rpe ?? null,
            completed: s.completed ?? true,
          },
        });
      }
    }

    // 3. Increment daily summaries workout count
    const existingSummary = await tx.dailySummary.findUnique({
      where: { userId_date: { userId, date: dateObj } },
    });

    await tx.dailySummary.upsert({
      where: { userId_date: { userId, date: dateObj } },
      create: {
        userId,
        date: dateObj,
        workoutsCompleted: 1,
      },
      update: {
        workoutsCompleted: (existingSummary?.workoutsCompleted || 0) + 1,
      },
    });

    return workout;
  });
}

export async function deleteWorkout(userId: string, id: string) {
  const workout = await prisma.workout.findFirst({
    where: { id, userId },
  });

  if (!workout) {
    throw new Error("Workout not found");
  }

  return prisma.workout.delete({
    where: { id },
  });
}
