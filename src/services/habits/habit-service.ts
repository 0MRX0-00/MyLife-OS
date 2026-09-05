import prisma from "@/lib/prisma";
import { CreateHabitInput } from "@/types/habit";
import { computeHabitStreak } from "./streak-calculator";
import { HabiticaIntegrationProvider } from "@/services/integrations/composio/habitica";

export async function getUserHabitsWithLogs(userId: string, targetDate: Date) {
  // Auto-sync habits from mobile Habitica API
  const habitica = new HabiticaIntegrationProvider();
  await habitica.syncHabitsFromHabitica(userId).catch(() => {});

  const dateObj = new Date(targetDate);
  dateObj.setUTCHours(0, 0, 0, 0);

  const habits = await prisma.habit.findMany({
    where: { userId, active: true },
    include: {
      logs: {
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return habits.map((habit) => {
    const todayLog = habit.logs.find(
      (l) => new Date(l.date).getTime() === dateObj.getTime()
    );

    const stats = computeHabitStreak(habit.logs);

    return {
      ...habit,
      isCompletedToday: todayLog?.completed || false,
      todayLogId: todayLog?.id,
      stats,
    };
  });
}

export async function createHabit(userId: string, input: CreateHabitInput) {
  const habit = await prisma.habit.create({
    data: {
      userId,
      name: input.name,
      description: input.description || null,
      frequency: input.frequency || "daily",
      target: input.target || 1,
      color: input.color || "#10b981",
      icon: input.icon || "target",
    },
  });

  // Push to Habitica mobile app
  try {
    const habitica = new HabiticaIntegrationProvider();
    const extId = await habitica.createHabitOnHabitica(userId, input.name, input.description || undefined);
    if (extId) {
      await prisma.habit.update({
        where: { id: habit.id },
        data: { externalId: extId, externalProvider: "habitica" },
      });
    }
  } catch (err) {
    console.warn("Habitica creation sync warning:", err);
  }

  return habit;
}

export async function toggleHabitLog(userId: string, habitId: string, dateStr: string) {
  const dateObj = new Date(dateStr);
  dateObj.setUTCHours(0, 0, 0, 0);

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
  });

  const existingLog = await prisma.habitLog.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: dateObj,
      },
    },
  });

  const nextStatus = !existingLog?.completed;

  // Sync score up/down to mobile Habitica app if connected to Habitica task or provider
  if (habit) {
    try {
      const habitica = new HabiticaIntegrationProvider();
      const extId = habit.externalId;
      if (extId) {
        await habitica.scoreHabitTask(userId, extId, nextStatus ? "up" : "down");
      } else {
        // Fallback: try matching by Habitica tasks or scoring first available Habitica habit
        const creds = await habitica.getCredentials(userId);
        if (creds) {
          const res = await fetch("https://habitica.com/api/v3/tasks/user?type=habits", {
            headers: {
              "x-api-user": creds.apiUser,
              "x-api-key": creds.apiKey,
              "x-client": "lifefit-os-app",
            },
          });
          if (res.ok) {
            const body = await res.json();
            const habiticaHabits: Array<{ id: string; text: string }> = body.data || [];
            const match = habiticaHabits.find((h) =>
              h.text.toLowerCase().includes(habit.name.toLowerCase()) ||
              habit.name.toLowerCase().includes(h.text.toLowerCase())
            ) || habiticaHabits[0];

            if (match?.id) {
              await habitica.scoreHabitTask(userId, String(match.id), nextStatus ? "up" : "down");
              await prisma.habit.update({
                where: { id: habit.id },
                data: { externalId: String(match.id), externalProvider: "habitica" },
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Habitica toggle score sync warning:", err);
    }
  }

  return prisma.$transaction(async (tx) => {
    // Upsert HabitLog
    const log = await tx.habitLog.upsert({
      where: {
        habitId_date: {
          habitId,
          date: dateObj,
        },
      },
      create: {
        habitId,
        userId,
        date: dateObj,
        completed: true,
      },
      update: {
        completed: nextStatus,
      },
    });

    // Recompute DailySummary habit count
    const allLogsToday = await tx.habitLog.findMany({
      where: { userId, date: dateObj, completed: true },
    });

    const activeHabitsCount = await tx.habit.count({
      where: { userId, active: true },
    });

    await tx.dailySummary.upsert({
      where: { userId_date: { userId, date: dateObj } },
      create: {
        userId,
        date: dateObj,
        habitsCompleted: allLogsToday.length,
        habitsTotal: activeHabitsCount,
      },
      update: {
        habitsCompleted: allLogsToday.length,
        habitsTotal: activeHabitsCount,
      },
    });

    return log;
  });
}

export async function deleteHabit(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
  });

  if (!habit) {
    throw new Error("Habit not found");
  }

  return prisma.habit.delete({
    where: { id: habitId },
  });
}
