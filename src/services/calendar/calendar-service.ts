import prisma from "@/lib/prisma";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";

export interface CalendarEventItem {
  id: string;
  type: "task" | "workout" | "habit" | "cheat_day" | "nutrition";
  title: string;
  subtitle?: string;
  status?: "todo" | "in_progress" | "done";
  date: string; // "YYYY-MM-DD"
  category?: string;
  priority?: string;
  externalProvider?: string | null;
  completedAt?: Date | null;
  meta?: Record<string, unknown>;
}

export interface DayCalendarData {
  dateStr: string; // "YYYY-MM-DD"
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isCheatDay: boolean;
  events: CalendarEventItem[];
  caloriesLogged: number;
  calorieTarget: number;
}

export interface CalendarMonthResponse {
  year: number;
  month: number;
  days: DayCalendarData[];
  cheatDayName: string;
  summary: {
    totalTasks: number;
    completedTasks: number;
    totalWorkouts: number;
    cheatDaysCount: number;
  };
}
 
export async function getCalendarMonthData(
  userId: string,
  year: number,
  month: number // 1-12
): Promise<CalendarMonthResponse> {
  // Compute date range for month grid (including padding days for week start)
  const targetMonthDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(targetMonthDate);
  const monthEnd = endOfMonth(targetMonthDate);
  
  // Pad grid from Sunday of first week to Saturday of last week
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Get user profile for Cheat Day & Nutrition targets
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  const cheatDayDate = profile?.cheatDayDate ? new Date(profile.cheatDayDate) : null;
  const cheatDayName = profile?.cheatDay || "Saturday";
  const calorieTarget = profile?.calorieTarget || 2000;

  // 1. Fetch Todos with due dates in grid range
  const todos = await prisma.todo.findMany({
    where: {
      userId,
      dueDate: {
        gte: gridStart,
        lte: gridEnd,
      },
    },
    orderBy: { dueDate: "asc" },
  });

  // 2. Fetch Workouts in grid range
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      date: {
        gte: gridStart,
        lte: gridEnd,
      },
    },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // 3. Fetch Habit Logs in grid range
  const habitLogs = await prisma.habitLog.findMany({
    where: {
      userId,
      date: {
        gte: gridStart,
        lte: gridEnd,
      },
      completed: true,
    },
    include: {
      habit: true,
    },
  });

  // 4. Fetch Food Logs in grid range
  const foodLogs = await prisma.foodLog.findMany({
    where: {
      userId,
      date: {
        gte: gridStart,
        lte: gridEnd,
      },
    },
  });

  // Generate all grid days
  const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Group items by date string "YYYY-MM-DD"
  const eventsByDate = new Map<string, CalendarEventItem[]>();
  const caloriesByDate = new Map<string, number>();

  // Aggregate Food Logs
  for (const log of foodLogs) {
    const dStr = format(new Date(log.date), "yyyy-MM-dd");
    const current = caloriesByDate.get(dStr) || 0;
    caloriesByDate.set(dStr, current + (log.calories || 0));
  }

  // Map Todos to Events
  for (const todo of todos) {
    if (!todo.dueDate) continue;
    const dStr = format(new Date(todo.dueDate), "yyyy-MM-dd");
    const list = eventsByDate.get(dStr) || [];
    list.push({
      id: todo.id,
      type: "task",
      title: todo.title,
      subtitle: todo.category || todo.priority,
      status: todo.status as "todo" | "in_progress" | "done",
      date: dStr,
      priority: todo.priority,
      externalProvider: todo.externalProvider,
      completedAt: todo.completedAt,
    });
    eventsByDate.set(dStr, list);
  }

  // Map Workouts to Events
  for (const workout of workouts) {
    const dStr = format(new Date(workout.date), "yyyy-MM-dd");
    const list = eventsByDate.get(dStr) || [];
    const exerciseCount = workout.exercises.length;
    list.push({
      id: workout.id,
      type: "workout",
      title: workout.workoutName,
      subtitle: `${exerciseCount} exercise${exerciseCount === 1 ? "" : "s"}${workout.duration ? ` • ${workout.duration}m` : ""}`,
      status: "done",
      date: dStr,
    });
    eventsByDate.set(dStr, list);
  }

  // Map Habit Logs to Events
  for (const log of habitLogs) {
    const dStr = format(new Date(log.date), "yyyy-MM-dd");
    const list = eventsByDate.get(dStr) || [];
    list.push({
      id: log.id,
      type: "habit",
      title: log.habit.name,
      subtitle: "Habit Completed",
      status: "done",
      date: dStr,
      meta: { color: log.habit.color },
    });
    eventsByDate.set(dStr, list);
  }

  let totalTasks = 0;
  let completedTasks = 0;
  const totalWorkouts = workouts.length;
  let cheatDaysCount = 0;

  const days: DayCalendarData[] = gridDays.map((day) => {
    const dStr = format(day, "yyyy-MM-dd");
    const isCheat = cheatDayDate ? isSameDay(day, cheatDayDate) : false;
    const dayEvents = eventsByDate.get(dStr) || [];

    if (isCheat && isSameMonth(day, targetMonthDate)) {
      cheatDaysCount++;
    }

    // Add Cheat Day badge to day events if it matches
    if (isCheat) {
      dayEvents.unshift({
        id: `cheat-day-${dStr}`,
        type: "cheat_day",
        title: "🍕 Cheat Day",
        subtitle: "Enjoy your favorite food!",
        date: dStr,
      });
    }

    for (const ev of dayEvents) {
      if (ev.type === "task") {
        totalTasks++;
        if (ev.status === "done") completedTasks++;
      }
    }

    return {
      dateStr: dStr,
      dayNumber: day.getDate(),
      isCurrentMonth: isSameMonth(day, targetMonthDate),
      isToday: isToday(day),
      isCheatDay: isCheat,
      events: dayEvents,
      caloriesLogged: Math.round(caloriesByDate.get(dStr) || 0),
      calorieTarget,
    };
  });

  return {
    year,
    month,
    days,
    cheatDayName,
    summary: {
      totalTasks,
      completedTasks,
      totalWorkouts,
      cheatDaysCount,
    },
  };
}
