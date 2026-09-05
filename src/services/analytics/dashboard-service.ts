import prisma from "@/lib/prisma";
import { computeDailyTotals, computeProgress } from "../nutrition/macro-calculator";
import { getUserHabitsWithLogs } from "../habits/habit-service";
import { getUserTasks } from "../tasks/task-service";
import { getUserBodyMetrics } from "../progress/body-metric-service";
import { computeWeightTrends } from "../progress/trend-calculator";
import { computeWorkoutTotalVolume } from "../workouts/volume-calculator";
import { getStreakMaintainerData } from "./streak-maintainer";

export async function getDashboardData(userId: string, targetDateStr?: string) {
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  targetDate.setUTCHours(0, 0, 0, 0);

  const [profile, logs, workouts, habits, tasks, metrics, streakData] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.foodLog.findMany({ where: { userId, date: targetDate }, include: { food: true } }),
    prisma.workout.findMany({
      where: { userId, date: targetDate },
      include: {
        exercises: {
          include: { exercise: true, sets: true },
        },
      },
    }),
    getUserHabitsWithLogs(userId, targetDate),
    getUserTasks(userId, "today"),
    getUserBodyMetrics(userId, 30),
    getStreakMaintainerData(userId),
  ]);

  // Compute Nutrition Totals & Progress
  const totals = computeDailyTotals(logs);
  const nutritionProgress = computeProgress(totals, profile);

  // Compute Workout Stats
  const workoutCount = workouts.length;
  const totalVolume = computeWorkoutTotalVolume(
    workouts.flatMap((w) => w.exercises)
  );

  // Compute Habits Stats
  const completedHabits = habits.filter((h) => h.isCompletedToday).length;
  const totalHabits = habits.length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 100;

  // Compute Tasks Stats
  const pendingTasksCount = tasks.length;

  // Weight trends
  const weightTrends = computeWeightTrends(metrics, profile?.weight || null);

  // Calculate Overall LifeFit Daily Score (0-100)
  // Weights: Nutrition (35%), Workouts (25%), Habits (25%), Tasks (15%)
  const nutritionScore = Math.min(100, nutritionProgress.percentages.calories);
  const workoutScore = workoutCount > 0 ? 100 : 0;
  const habitScore = habitCompletionRate;
  const taskScore = pendingTasksCount === 0 ? 100 : Math.max(0, 100 - pendingTasksCount * 20);

  const overallScore = Math.round(
    nutritionScore * 0.35 + workoutScore * 0.25 + habitScore * 0.25 + taskScore * 0.15
  );

  return {
    date: targetDate,
    overallScore,
    nutritionProgress,
    workoutCount,
    totalVolume,
    workouts,
    habits,
    completedHabits,
    totalHabits,
    tasks,
    pendingTasksCount,
    weightTrends,
    streakData,
  };
}
