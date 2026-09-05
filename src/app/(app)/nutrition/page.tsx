import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { getFoodLogsForDate } from "@/services/nutrition/food-log-service";
import { computeDailyTotals, computeProgress } from "@/services/nutrition/macro-calculator";
import { NutritionContent } from "@/features/nutrition/components/nutrition-content";
import { format, subDays } from "date-fns";

export const metadata: Metadata = { title: "Nutrition — LifeFit OS" };

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const userId = await requireAuth();
  const params = await searchParams;
  const dateStr = params.date || format(new Date(), "yyyy-MM-dd");

  const targetDate = new Date(dateStr);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Fetch user profile for macro targets
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  // Fetch food logs for target date
  const logs = await getFoodLogsForDate(userId, targetDate);

  // Calculate daily totals & progress
  const totals = computeDailyTotals(logs);
  const progress = computeProgress(totals, profile);

  // Fetch last 7 days of daily summaries for chart
  const sevenDaysAgo = subDays(targetDate, 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  const summaries = await prisma.dailySummary.findMany({
    where: {
      userId,
      date: {
        gte: sevenDaysAgo,
        lte: targetDate,
      },
    },
    orderBy: { date: "asc" },
  });

  const history = summaries.map((s) => ({
    date: format(new Date(s.date), "MMM d"),
    calories: Math.round(s.calories),
    protein: Math.round(s.protein),
    carbohydrates: Math.round(s.carbohydrates),
    fat: Math.round(s.fat),
  }));

  return (
    <NutritionContent
      dateStr={dateStr}
      progress={progress}
      logs={logs}
      history={history}
    />
  );
}
