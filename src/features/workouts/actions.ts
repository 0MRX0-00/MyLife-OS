"use server";

import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { getExercises } from "@/services/workouts/exercise-service";
import { createWorkout, deleteWorkout } from "@/services/workouts/workout-service";
import { detectPersonalRecords } from "@/services/workouts/pr-detector";
import { workoutSchema as createWorkoutSchema } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function searchExercisesAction(query?: string, muscleGroup?: string, category?: string) {
  await requireAuth();
  return getExercises({ query, muscleGroup, category });
}

export async function saveWorkoutAction(input: {
  workoutName: string;
  date: string;
  duration?: number;
  notes?: string;
  exercises: {
    exerciseId: string;
    sets: {
      setNumber: number;
      weight?: number;
      reps?: number;
      rpe?: number;
      completed: boolean;
    }[];
  }[];
}) {
  const userId = await requireAuth();
  const parsed = createWorkoutSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid workout data" };
  }

  try {
    const workout = await createWorkout(userId, parsed.data);
    const prs = await detectPersonalRecords(userId, workout.id);

    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    return { success: true, workoutId: workout.id, prs };
  } catch {
    return { error: "Failed to save workout" };
  }
}

export async function deleteWorkoutAction(workoutId: string) {
  const userId = await requireAuth();
  try {
    await deleteWorkout(userId, workoutId);
    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to delete workout" };
  }
}

export async function createCustomExerciseAction(input: {
  name: string;
  muscleGroup: string;
  category: string;
}) {
  await requireAuth();
  try {
    const exercise = await prisma.exercise.create({
      data: {
        name: input.name,
        muscleGroup: input.muscleGroup,
        category: input.category,
        difficulty: "intermediate",
        isCustom: true,
      },
    });
    return { success: true, exercise };
  } catch {
    return { error: "Failed to create custom exercise" };
  }
}
