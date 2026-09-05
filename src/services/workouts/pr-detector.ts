import prisma from "@/lib/prisma";
import { estimateOneRM } from "./one-rm-estimator";
import { computeSetVolume } from "./volume-calculator";

export interface DetectedPR {
  exerciseId: string;
  exerciseName: string;
  type: "weight" | "reps" | "volume" | "one_rm";
  value: number;
  previousBest: number;
}

export async function detectPersonalRecords(
  userId: string,
  workoutId: string
): Promise<DetectedPR[]> {
  // Get current workout details
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
  });

  if (!workout) return [];

  const detectedPRs: DetectedPR[] = [];

  for (const item of workout.exercises) {
    const exerciseId = item.exerciseId;
    const exerciseName = item.exercise.name;
    const completedSets = item.sets.filter((s) => s.completed && s.weight && s.reps);

    if (completedSets.length === 0) continue;

    // Highest values in current workout for this exercise
    const currentMaxWeight = Math.max(...completedSets.map((s) => s.weight || 0));
    const currentMaxReps = Math.max(...completedSets.map((s) => s.reps || 0));
    const currentMaxVolume = Math.max(...completedSets.map((s) => computeSetVolume(s.weight, s.reps)));
    const currentMax1RM = Math.max(...completedSets.map((s) => estimateOneRM(s.weight || 0, s.reps || 0)));

    // Query all historical sets for this user & exercise BEFORE this workout
    const historicalSets = await prisma.exerciseSet.findMany({
      where: {
        completed: true,
        workoutExercise: {
          exerciseId,
          workout: {
            userId,
            id: { not: workoutId },
          },
        },
      },
      select: {
        weight: true,
        reps: true,
      },
    });

    if (historicalSets.length === 0) {
      // First time performing exercise — optional PRs
      if (currentMaxWeight > 0) {
        detectedPRs.push({
          exerciseId,
          exerciseName,
          type: "weight",
          value: currentMaxWeight,
          previousBest: 0,
        });
      }
      continue;
    }

    const prevMaxWeight = Math.max(0, ...historicalSets.map((s) => s.weight || 0));
    const prevMaxReps = Math.max(0, ...historicalSets.map((s) => s.reps || 0));
    const prevMaxVolume = Math.max(0, ...historicalSets.map((s) => computeSetVolume(s.weight, s.reps)));
    const prevMax1RM = Math.max(0, ...historicalSets.map((s) => estimateOneRM(s.weight || 0, s.reps || 0)));

    if (currentMaxWeight > prevMaxWeight) {
      detectedPRs.push({
        exerciseId,
        exerciseName,
        type: "weight",
        value: currentMaxWeight,
        previousBest: prevMaxWeight,
      });
    }

    if (currentMaxReps > prevMaxReps && currentMaxWeight >= prevMaxWeight) {
      detectedPRs.push({
        exerciseId,
        exerciseName,
        type: "reps",
        value: currentMaxReps,
        previousBest: prevMaxReps,
      });
    }

    if (currentMaxVolume > prevMaxVolume) {
      detectedPRs.push({
        exerciseId,
        exerciseName,
        type: "volume",
        value: currentMaxVolume,
        previousBest: prevMaxVolume,
      });
    }

    if (currentMax1RM > prevMax1RM && currentMaxWeight <= prevMaxWeight) {
      detectedPRs.push({
        exerciseId,
        exerciseName,
        type: "one_rm",
        value: currentMax1RM,
        previousBest: prevMax1RM,
      });
    }
  }

  return detectedPRs;
}
