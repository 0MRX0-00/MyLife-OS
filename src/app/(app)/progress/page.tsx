import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { getUserBodyMetrics } from "@/services/progress/body-metric-service";
import { computeWeightTrends } from "@/services/progress/trend-calculator";
import { ProgressContent } from "@/features/progress/components";
import { format } from "date-fns";

export const metadata: Metadata = { title: "Body Metrics & Progress — LifeFit OS" };

export default async function ProgressPage() {
  const userId = await requireAuth();

  const [profile, metrics] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    getUserBodyMetrics(userId),
  ]);

  const trends = computeWeightTrends(metrics, profile?.weight || null);

  const chartData = [...metrics]
    .reverse()
    .filter((m) => m.weight !== null)
    .map((m) => ({
      date: format(new Date(m.date), "MMM d"),
      weight: m.weight!,
    }));

  return (
    <ProgressContent
      trends={trends}
      metrics={metrics}
      chartData={chartData}
      goalWeight={profile?.weight || null}
    />
  );
}
