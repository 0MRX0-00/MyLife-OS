import { BodyMetric } from "@/types/progress";

export interface WeightTrendSummary {
  latestWeight: number | null;
  movingAvg7Day: number | null;
  change30Day: number | null;
  goalWeight: number | null;
  diffFromGoal: number | null;
}

export function computeWeightTrends(
  metrics: BodyMetric[],
  goalWeight?: number | null
): WeightTrendSummary {
  if (!metrics || metrics.length === 0) {
    return {
      latestWeight: null,
      movingAvg7Day: null,
      change30Day: null,
      goalWeight: goalWeight || null,
      diffFromGoal: null,
    };
  }

  // Sorted by date ascending
  const sorted = [...metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const validWeights = sorted.filter((m) => m.weight !== null && m.weight > 0);

  if (validWeights.length === 0) {
    return {
      latestWeight: null,
      movingAvg7Day: null,
      change30Day: null,
      goalWeight: goalWeight || null,
      diffFromGoal: null,
    };
  }

  const latest = validWeights[validWeights.length - 1].weight!;

  // 7-day moving average
  const last7 = validWeights.slice(-7);
  const avg7 = last7.reduce((acc, m) => acc + m.weight!, 0) / last7.length;

  // 30-day change
  const first30 = validWeights[0].weight!;
  const change30 = Math.round((latest - first30) * 10) / 10;

  const diffFromGoal = goalWeight ? Math.round((latest - goalWeight) * 10) / 10 : null;

  return {
    latestWeight: latest,
    movingAvg7Day: Math.round(avg7 * 10) / 10,
    change30Day: change30,
    goalWeight: goalWeight || null,
    diffFromGoal,
  };
}
