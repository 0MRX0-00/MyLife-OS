"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { StreakHeatmap } from "@/components/shared/streak-heatmap";
import { Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DailyMacroProgress } from "@/types/nutrition";
import { StreakMaintainerData } from "@/services/analytics/streak-maintainer";

interface DashboardContentProps {
  data: {
    overallScore: number;
    workoutCount: number;
    totalVolume: number;
    habits: Array<{ id: string; name: string; isCompletedToday: boolean; stats: { currentStreak: number } }>;
    completedHabits: number;
    totalHabits: number;
    tasks: { id: string; title: string; status: string }[];
    pendingTasksCount: number;
    nutritionProgress: DailyMacroProgress;
    streakData: StreakMaintainerData;
  };
}

export function DashboardContent({ data }: DashboardContentProps) {
  const {
    workoutCount,
    totalVolume,
    habits,
    completedHabits,
    totalHabits,
    tasks,
    pendingTasksCount,
    nutritionProgress,
    streakData,
  } = data;

  const now = new Date();
  const hoursPassed = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const dayProgressPercent = Math.round((hoursPassed / 24) * 100);

  const consumedCalories = nutritionProgress.consumed.calories;
  const targetCalories = nutritionProgress.targets.calories;
  const caloriePercent = Math.round((consumedCalories / targetCalories) * 100);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Score Card */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2 flex flex-col justify-between p-6 bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Welcome Back to LifeFit OS</h2>
            <p className="text-xs text-muted-foreground">
              Track your real‑time day completion, nutrition, and stay on top of your habits and workouts.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-full bg-muted/20 rounded-full h-4">
              <div className="bg-emerald-500 h-4 rounded-full" style={{ width: `${dayProgressPercent}%` }}></div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{hoursPassed.toFixed(1)}h / 24h</p>
          </div>
        </Card>

        <StatCard
          title="Calories Today"
          value={`${consumedCalories} / ${targetCalories} kcal`}
          description={`${caloriePercent}% of daily target`}
          iconName="flame"
        />

        <StatCard
          title="Training Volume Today"
          value={`${totalVolume} kg`}
          description={`${workoutCount} workouts recorded`}
          iconName="dumbbell"
        />
      </div>

      {/* LeetCode & GitHub Style Streak Counter & Activity Maintainer Heatmap */}
      {streakData && <StreakHeatmap data={streakData} />}

      {/* Main Grid: Habits & Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Habits Quick Checklist Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" /> Todays Habits
            </CardTitle>
            <Link href="/habits">
              <Button size="sm" variant="ghost" className="h-8 text-xs gap-1">
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {habits.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No habits created yet.</p>
            ) : (
              habits.slice(0, 4).map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2 text-xs">
                  <span className={`font-medium ${h.isCompletedToday ? "line-through text-muted-foreground" : ""}`}>
                    {h.name}
                  </span>
                  <span className="text-amber-500 font-bold">🔥 {h.stats.currentStreak}d streak</span>
                </div>
              ))
            )}
            <div className="pt-2 text-xs text-muted-foreground flex justify-between items-center">
              <span>Habit Completion</span>
              <span className="font-semibold text-foreground">{completedHabits} / {totalHabits} completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Quick Checklist Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-500" /> Todays Tasks
            </CardTitle>
            <Link href="/tasks">
              <Button size="sm" variant="ghost" className="h-8 text-xs gap-1">
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No tasks created yet.</p>
            ) : (
              tasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 text-xs">
                  <span className={`font-medium ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {t.title}
                  </span>
                  <span className="text-amber-500 font-bold">{t.status}</span>
                </div>
              ))
            )}
            <div className="pt-2 text-xs text-muted-foreground flex justify-between items-center">
              <span>Task Completion</span>
              <span className="font-semibold text-foreground">{pendingTasksCount} pending</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}