import prisma from "@/lib/prisma";
import { format, subDays, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, differenceInCalendarDays } from "date-fns";

export interface DailyActivitySquare {
  date: string; // yyyy-MM-dd
  level: 0 | 1 | 2 | 3 | 4;
  activityCount: number;
  isShielded: boolean;
  workouts: number;
  habits: number;
  tasks: number;
  calories: number;
}

export interface StreakMaintainerData {
  currentStreak: number;
  longestStreak: number;
  daysUntilNextShield: number;
  isShieldActiveToday: boolean;
  totalActiveDays: number;
  activityMatrix: DailyActivitySquare[];
  cheatDayInfo: {
    cheatDay: string;
    cheatDayDate: Date | null;
    isCheatDayToday: boolean;
    daysUntilCheatDay: number;
    isCheatDayUsedThisMonth: boolean;
    isCheatDayPassed: boolean;
    lastUsedMonth?: string | null;
  };
}

export async function getStreakMaintainerData(userId: string, daysToFetch: number = 364): Promise<StreakMaintainerData> {
  const today = startOfDay(new Date());
  const currentMonthStr = format(today, "yyyy-MM");

  // Fetch last 365 days of summaries for streak calculations
  const startDate = subDays(today, Math.max(365, daysToFetch));
  
  const summaries = await prisma.dailySummary.findMany({
    where: {
      userId,
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });

  // Create lookup map by YYYY-MM-DD
  const summaryMap = new Map<string, typeof summaries[0]>();
  for (const s of summaries) {
    const key = format(new Date(s.date), "yyyy-MM-dd");
    summaryMap.set(key, s);
  }

  // Calculate activity level (0-4) for each date
  const getActivityStats = (dateObj: Date): DailyActivitySquare => {
    const key = format(dateObj, "yyyy-MM-dd");
    const summary = summaryMap.get(key);

    if (!summary) {
      return {
        date: key,
        level: 0,
        activityCount: 0,
        isShielded: false,
        workouts: 0,
        habits: 0,
        tasks: 0,
        calories: 0,
      };
    }

    let count = 0;
    if (summary.calories > 0) count++;
    if (summary.workoutsCompleted > 0) count++;
    if (summary.habitsCompleted > 0) count++;
    if (summary.tasksCompleted > 0) count++;

    const level: 0 | 1 | 2 | 3 | 4 = count >= 4 ? 4 : (count as 0 | 1 | 2 | 3);

    return {
      date: key,
      level,
      activityCount: count,
      isShielded: false,
      workouts: summary.workoutsCompleted,
      habits: summary.habitsCompleted,
      tasks: summary.tasksCompleted,
      calories: Math.round(summary.calories),
    };
  };

  // Build matrix for displayed days (e.g. 112 days = 16 weeks)
  const matrix: DailyActivitySquare[] = [];
  for (let i = daysToFetch - 1; i >= 0; i--) {
    const d = subDays(today, i);
    matrix.push(getActivityStats(d));
  }

  // Calculate Current Streak & Longest Streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let totalActiveDays = 0;

  const todayStats = getActivityStats(today);
  const yesterdayStats = getActivityStats(subDays(today, 1));

  const hasTodayActivity = todayStats.activityCount > 0;
  const hasYesterdayActivity = yesterdayStats.activityCount > 0;

  const checkDate = hasTodayActivity ? today : (hasYesterdayActivity ? subDays(today, 1) : null);

  if (checkDate) {
    let curr = checkDate;
    while (true) {
      const stats = getActivityStats(curr);
      if (stats.activityCount > 0) {
        currentStreak++;
        curr = subDays(curr, 1);
      } else {
        break;
      }
    }
  }

  // Calculate all-time longest streak
  for (let i = 365; i >= 0; i--) {
    const stats = getActivityStats(subDays(today, i));
    if (stats.activityCount > 0) {
      tempStreak++;
      totalActiveDays++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Ensure longest streak is at least as large as current streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Fetch user profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { 
      cheatDay: true, 
      cheatDayLastUsedMonth: true, 
      cheatDayDate: true, 
    },
  });

  const cheatDay = profile?.cheatDay || "Saturday";
  const cheatDayDate = profile?.cheatDayDate ? new Date(profile.cheatDayDate) : null;
  const isCheatDayUsedThisMonth = profile?.cheatDayLastUsedMonth === currentMonthStr;
  const daysUntilNextShield = 7 - (currentStreak % 7);

  let isCheatDayToday = false;
  let daysUntilCheatDay = 0;

  if (cheatDayDate) {
    const diff = differenceInCalendarDays(cheatDayDate, today);
    if (diff === 0) {
      isCheatDayToday = true;
      daysUntilCheatDay = 0;
    } else if (diff > 0) {
      daysUntilCheatDay = diff;
    } else {
      // cheat day already passed this month
      daysUntilCheatDay = 0;
    }
  } else {
    // fallback to weekday calculation
    const todayDayName = format(today, "EEEE");
    isCheatDayToday = todayDayName.toLowerCase() === cheatDay.toLowerCase();

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayIdx = today.getDay();
    const cheatIdx = daysOfWeek.findIndex((d) => d.toLowerCase() === cheatDay.toLowerCase());
    daysUntilCheatDay = cheatIdx >= todayIdx ? cheatIdx - todayIdx : 7 - (todayIdx - cheatIdx);
  }

  return {
    currentStreak,
    longestStreak,
    daysUntilNextShield,
    isShieldActiveToday: false,
    totalActiveDays,
    activityMatrix: matrix,
    cheatDayInfo: {
      cheatDay,
      cheatDayDate: profile?.cheatDayDate || null,
      isCheatDayToday,
      daysUntilCheatDay: daysUntilCheatDay === 0 ? 0 : daysUntilCheatDay,
      isCheatDayUsedThisMonth,
      isCheatDayPassed: cheatDayDate ? differenceInCalendarDays(cheatDayDate, today) < 0 : false,
      lastUsedMonth: profile?.cheatDayLastUsedMonth || null,
    },
  };
}

export async function rollRandomCheatDay(userId: string) {
  const today = new Date();
  const currentMonthStr = format(today, "yyyy-MM");

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { cheatDayLastUsedMonth: true },
  });

  if (profile?.cheatDayLastUsedMonth === currentMonthStr) {
    throw new Error("Your Cheat Day for this month has already been logged and used! You cannot roll another Cheat Day this month.");
  }

  const targetMonthStart = startOfMonth(today);
  const targetMonthEnd = endOfMonth(today);
  const monthDays = eachDayOfInterval({ start: targetMonthStart, end: targetMonthEnd });

  // Pick a random date within the month
  const randomDate = monthDays[Math.floor(Math.random() * monthDays.length)];
  const randomDay = format(randomDate, "EEEE"); // full day name

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      cheatDay: randomDay,
      cheatDayDate: randomDate,
    },
    update: {
      cheatDay: randomDay,
      cheatDayDate: randomDate,
    },
  });

  return randomDay;
}

export async function markCheatDayCompleted(userId: string) {
  const today = new Date();
  const currentMonthStr = format(today, "yyyy-MM");

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      cheatDayLastUsedMonth: currentMonthStr,
      cheatDayLastUsedDate: today,
    },
    update: {
      cheatDayLastUsedMonth: currentMonthStr,
      cheatDayLastUsedDate: today,
    },
  });

  return { success: true };
}
