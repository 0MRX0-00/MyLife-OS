import { HabitLog } from "@prisma/client";
import { subDays, isSameDay } from "date-fns";

export interface HabitStreakStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // percentage 0-100
}

export function computeHabitStreak(logs: HabitLog[]): HabitStreakStats {
  if (!logs || logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completionRate: 0 };
  }

  // Filter completed logs sorted by date descending
  const completedDates = logs
    .filter((l) => l.completed)
    .map((l) => new Date(l.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completionRate: 0 };
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const yesterday = subDays(today, 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  let currentStreak = 0;
  let checkDate = isSameDay(completedDates[0], today) ? today : yesterday;

  // Compute current consecutive streak backwards
  for (let i = 0; i < 365; i++) {
    const hasLog = completedDates.some((d) => isSameDay(d, checkDate));
    if (hasLog) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Compute longest streak in all history
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  // Sorted ascending for longest streak calculation
  const ascDates = [...completedDates].sort((a, b) => a.getTime() - b.getTime());

  for (const d of ascDates) {
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const expectedNext = subDays(d, -1); // d - 1 day
      if (isSameDay(expectedNext, prevDate)) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = d;
  }

  const completionRate = Math.min(100, Math.round((completedDates.length / logs.length) * 100));

  return {
    currentStreak,
    longestStreak,
    completionRate,
  };
}
