import prisma from "@/lib/prisma";
import { CreateFoodLogInput } from "@/types/nutrition";
import { computeMacros, computeDailyTotals } from "./macro-calculator";

export async function getFoodLogsForDate(userId: string, date: Date) {
  return prisma.foodLog.findMany({
    where: {
      userId,
      date,
    },
    include: {
      food: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function logFoodItem(userId: string, input: CreateFoodLogInput) {
  const food = await prisma.food.findUnique({
    where: { id: input.foodId },
  });

  if (!food) {
    throw new Error("Food not found");
  }

  const macros = computeMacros(
    food.calories,
    food.protein,
    food.carbohydrates,
    food.fat,
    input.quantity
  );

  const dateObj = new Date(input.date);
  dateObj.setUTCHours(0, 0, 0, 0);

  return prisma.$transaction(async (tx) => {
    // 1. Create log
    const log = await tx.foodLog.create({
      data: {
        userId,
        foodId: input.foodId,
        date: dateObj,
        mealType: input.mealType,
        quantity: input.quantity,
        calories: macros.calories,
        protein: macros.protein,
        carbohydrates: macros.carbohydrates,
        fat: macros.fat,
        notes: input.notes || null,
      },
      include: { food: true },
    });

    // 2. Recalculate daily totals for this date
    await syncDailySummary(tx, userId, dateObj);

    return log;
  });
}

export async function deleteFoodLogItem(userId: string, logId: string) {
  const log = await prisma.foodLog.findFirst({
    where: { id: logId, userId },
  });

  if (!log) {
    throw new Error("Food log item not found");
  }

  const dateObj = new Date(log.date);

  return prisma.$transaction(async (tx) => {
    await tx.foodLog.delete({
      where: { id: logId },
    });

    await syncDailySummary(tx, userId, dateObj);
  });
}

export async function syncDailySummary(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  userId: string,
  date: Date
) {
  const allLogs = await tx.foodLog.findMany({
    where: { userId, date },
  });

  const totals = computeDailyTotals(allLogs);

  await tx.dailySummary.upsert({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    create: {
      userId,
      date,
      calories: totals.calories,
      protein: totals.protein,
      carbohydrates: totals.carbohydrates,
      fat: totals.fat,
    },
    update: {
      calories: totals.calories,
      protein: totals.protein,
      carbohydrates: totals.carbohydrates,
      fat: totals.fat,
    },
  });
}
