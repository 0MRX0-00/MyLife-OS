import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { getUserHabitsWithLogs } from "@/services/habits/habit-service";
import { HabitsContent } from "@/features/habits/components/habits-content";
import { format } from "date-fns";

export const metadata: Metadata = { title: "Habits — LifeFit OS" };

export default async function HabitsPage() {
  const userId = await requireAuth();
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const habits = await getUserHabitsWithLogs(userId, today);

  return <HabitsContent habits={habits} todayStr={todayStr} />;
}
