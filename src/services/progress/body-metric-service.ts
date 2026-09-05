import prisma from "@/lib/prisma";
import { CreateBodyMetricInput } from "@/types/progress";

export async function getUserBodyMetrics(userId: string, limit = 90) {
  return prisma.bodyMetric.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function upsertBodyMetric(userId: string, input: CreateBodyMetricInput) {
  const dateObj = new Date(input.date);
  dateObj.setUTCHours(0, 0, 0, 0);

  return prisma.bodyMetric.upsert({
    where: {
      userId_date: {
        userId,
        date: dateObj,
      },
    },
    create: {
      userId,
      date: dateObj,
      weight: input.weight ?? null,
      bodyFat: input.bodyFat ?? null,
      waist: input.waist ?? null,
      chest: input.chest ?? null,
      arms: input.arms ?? null,
      thighs: input.thighs ?? null,
    },
    update: {
      weight: input.weight ?? undefined,
      bodyFat: input.bodyFat ?? undefined,
      waist: input.waist ?? undefined,
      chest: input.chest ?? undefined,
      arms: input.arms ?? undefined,
      thighs: input.thighs ?? undefined,
    },
  });
}

export async function deleteBodyMetric(userId: string, id: string) {
  const item = await prisma.bodyMetric.findFirst({
    where: { id, userId },
  });

  if (!item) {
    throw new Error("Metric entry not found");
  }

  return prisma.bodyMetric.delete({
    where: { id },
  });
}
