"use client";

import { useState } from "react";
import { getCalendarEventsAction } from "../actions";
import { CalendarMonthResponse, DayCalendarData } from "@/services/calendar/calendar-service";
import { DayAgendaModal } from "./day-agenda-modal";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  Dumbbell,
  CheckCircle2,
  Target,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface CalendarContentProps {
  initialYear: number;
  initialMonth: number;
  initialData: CalendarMonthResponse;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarContent({
  initialYear,
  initialMonth,
  initialData,
}: CalendarContentProps) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth); // 1-12
  const [data, setData] = useState<CalendarMonthResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayCalendarData | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Filters
  const [showTasks, setShowTasks] = useState(true);
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [showHabits, setShowHabits] = useState(true);
  const [showCheatDays, setShowCheatDays] = useState(true);
  const [showCalories, setShowCalories] = useState(true);

  const fetchCalendar = async (y: number, m: number) => {
    setLoading(true);
    const res = await getCalendarEventsAction(y, m);
    setLoading(false);
    if (res.success && res.data) {
      setData(res.data);
    }
  };

  const handlePrevMonth = () => {
    let newM = currentMonth - 1;
    let newY = currentYear;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setCurrentMonth(newM);
    setCurrentYear(newY);
    fetchCalendar(newY, newM);
  };

  const handleNextMonth = () => {
    let newM = currentMonth + 1;
    let newY = currentYear;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setCurrentMonth(newM);
    setCurrentYear(newY);
    fetchCalendar(newY, newM);
  };

  const handleJumpToToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    setCurrentYear(y);
    setCurrentMonth(m);
    fetchCalendar(y, m);
  };

  const activeDateLabel = format(new Date(currentYear, currentMonth - 1, 1), "MMMM yyyy");

  // Filter grid days for week view if needed
  const displayDays = viewMode === "week"
    ? data.days.filter((d) => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const idx = data.days.findIndex((item) => item.dateStr === todayStr);
        if (idx === -1) return d.isCurrentMonth;
        const weekStartIdx = Math.floor(idx / 7) * 7;
        const dayIdx = data.days.indexOf(d);
        return dayIdx >= weekStartIdx && dayIdx < weekStartIdx + 7;
      })
    : data.days;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & View Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Live Interactive Calendar
              </h1>
              <p className="text-xs text-muted-foreground">
                All your tasks, workouts, habits, calories, and designated Cheat Days in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleJumpToToday}
            className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
          >
            Today
          </button>

          <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              disabled={loading}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[120px] text-center text-xs font-bold text-foreground">
              {activeDateLabel}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={loading}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-sm">
            <button
              onClick={() => setViewMode("month")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week View
            </button>
          </div>

          <button
            onClick={() => fetchCalendar(currentYear, currentMonth)}
            className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Refresh events"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
            Tasks Completed
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {data.summary.completedTasks} <span className="text-xs font-normal text-muted-foreground">/ {data.summary.totalTasks}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Dumbbell className="h-4 w-4 text-blue-500" />
            Workouts Logged
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {data.summary.totalWorkouts}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Cheat Day ({data.cheatDayName})
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {data.summary.cheatDaysCount} <span className="text-xs font-normal text-muted-foreground">this month</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Target className="h-4 w-4 text-emerald-500" />
            Sync Status
          </div>
          <p className="mt-2 text-sm font-bold text-emerald-500 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Connected
          </p>
        </div>
      </div>

      {/* Interactive Filter Toggles */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-2">
          <Filter className="h-3.5 w-3.5" /> Filter Calendar:
        </span>
        
        <button
          onClick={() => setShowCheatDays(!showCheatDays)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            showCheatDays
              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
              : "bg-muted/50 text-muted-foreground opacity-60"
          }`}
        >
          🍕 Cheat Days
        </button>

        <button
          onClick={() => setShowWorkouts(!showWorkouts)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            showWorkouts
              ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
              : "bg-muted/50 text-muted-foreground opacity-60"
          }`}
        >
          <Dumbbell className="h-3.5 w-3.5" /> Workouts
        </button>

        <button
          onClick={() => setShowTasks(!showTasks)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            showTasks
              ? "bg-purple-500/15 text-purple-500 border border-purple-500/30"
              : "bg-muted/50 text-muted-foreground opacity-60"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Tasks
        </button>

        <button
          onClick={() => setShowHabits(!showHabits)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            showHabits
              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
              : "bg-muted/50 text-muted-foreground opacity-60"
          }`}
        >
          <Target className="h-3.5 w-3.5" /> Habits
        </button>

        <button
          onClick={() => setShowCalories(!showCalories)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            showCalories
              ? "bg-orange-500/15 text-orange-500 border border-orange-500/30"
              : "bg-muted/50 text-muted-foreground opacity-60"
          }`}
        >
          <Flame className="h-3.5 w-3.5" /> Calories
        </button>
      </div>

      {/* Main Calendar Grid */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Date Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {displayDays.map((day) => {
            const tasksList = day.events.filter((e) => e.type === "task");
            const workoutsList = day.events.filter((e) => e.type === "workout");
            const habitsList = day.events.filter((e) => e.type === "habit");

            return (
              <div
                key={day.dateStr}
                onClick={() => setSelectedDay(day)}
                className={`group relative min-h-[110px] cursor-pointer p-2 transition-all hover:bg-accent/40 ${
                  !day.isCurrentMonth ? "bg-muted/10 opacity-40" : ""
                } ${day.isToday ? "bg-primary/5 ring-2 ring-primary ring-inset" : ""}`}
              >
                {/* Date Header inside cell */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      day.isToday
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Calorie Indicator */}
                  {showCalories && day.caloriesLogged > 0 && (
                    <span className="text-[10px] font-semibold text-orange-500 flex items-center gap-0.5">
                      <Flame className="h-2.5 w-2.5" />
                      {day.caloriesLogged}k
                    </span>
                  )}
                </div>

                {/* Event Badges List */}
                <div className="space-y-1">
                  {/* Cheat Day Pill */}
                  {showCheatDays && day.isCheatDay && (
                    <div className="flex items-center gap-1 truncate rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                      <span>🍕 Cheat Day</span>
                    </div>
                  )}

                  {/* Workout Pills */}
                  {showWorkouts &&
                    workoutsList.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center gap-1 truncate rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-500"
                      >
                        <Dumbbell className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{w.title}</span>
                      </div>
                    ))}

                  {/* Tasks Pills */}
                  {showTasks &&
                    tasksList.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center gap-1 truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
                          t.status === "done"
                            ? "border-border bg-muted/40 text-muted-foreground line-through"
                            : "border-purple-500/30 bg-purple-500/10 text-purple-500 font-semibold"
                        }`}
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}

                  {/* Tasks Overflow Count */}
                  {showTasks && tasksList.length > 2 && (
                    <span className="block text-[10px] font-medium text-muted-foreground pl-1">
                      +{tasksList.length - 2} more tasks
                    </span>
                  )}

                  {/* Habits Count Pill */}
                  {showHabits && habitsList.length > 0 && (
                    <div className="flex items-center gap-1 truncate rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">
                      <Target className="h-2.5 w-2.5 shrink-0" />
                      <span>{habitsList.length} habit{habitsList.length > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Agenda Modal Drawer */}
      {selectedDay && (
        <DayAgendaModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onRefresh={() => fetchCalendar(currentYear, currentMonth)}
        />
      )}
    </div>
  );
}
