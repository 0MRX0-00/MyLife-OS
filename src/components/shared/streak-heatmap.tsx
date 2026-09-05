"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Calendar, Loader2, Dice5, UtensilsCrossed, CheckCircle2, Lock, CalendarSync } from "lucide-react";
import { StreakMaintainerData, DailyActivitySquare } from "@/services/analytics/streak-maintainer";
import { rollCheatDayAction, markCheatDayCompletedAction } from "@/features/dashboard/actions";
import { toast } from "sonner";

interface StreakHeatmapProps {
  data: StreakMaintainerData;
}

export function StreakHeatmap({ data }: StreakHeatmapProps) {
  const {
    currentStreak,
    longestStreak,
    totalActiveDays,
    activityMatrix,
    cheatDayInfo,
  } = data;

  const [rollingCheatDay, setRollingCheatDay] = useState(false);
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DailyActivitySquare | null>(null);

  const handleRollCheatDay = async () => {
    if (cheatDayInfo.isCheatDayUsedThisMonth) {
      toast.error("🔒 Cheat Day already completed this month! You cannot roll another Cheat Day until next month.");
      return;
    }

    setRollingCheatDay(true);
    try {
      const res = await rollCheatDayAction();
      if (res.error) {
        toast.error(res.error);
      } else if (res.cheatDay) {
        toast.success(`🎲 New Cheat Day assigned: ${res.cheatDay}! Enjoy your junk food on ${res.cheatDay}s 🍕`);
      }
    } catch {
      toast.error("Failed to roll random Cheat Day");
    } finally {
      setRollingCheatDay(false);
    }
  };

  const handleMarkCompleted = async () => {
    setMarkingCompleted(true);
    try {
      const res = await markCheatDayCompletedAction();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("🎉 Cheat Day logged & completed for this month! No further cheat days permitted this month.");
      }
    } catch {
      toast.error("Failed to mark Cheat Day as completed");
    } finally {
      setMarkingCompleted(false);
    }
  };

  const handleDownloadCalendar = () => {
    window.open("/api/calendar/cheat-day", "_blank");
    toast.success("📅 Downloaded Cheat Day iCal (.ics) calendar file!");
  };

  // Organize 112 days into 16 weeks (7 days per week)
  const weeks: DailyActivitySquare[][] = [];
  for (let i = 0; i < activityMatrix.length; i += 7) {
    weeks.push(activityMatrix.slice(i, i + 7));
  }

  const getSquareColor = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 0:
        return "bg-muted/40 border border-border/20 hover:border-foreground/30";
      case 1:
        return "bg-emerald-500/25 border border-emerald-500/30 hover:bg-emerald-500/40";
      case 2:
        return "bg-emerald-500/50 border border-emerald-500/60 hover:bg-emerald-500/70";
      case 3:
        return "bg-emerald-500/80 border border-emerald-500/90 hover:bg-emerald-500";
      case 4:
        return "bg-gradient-to-br from-amber-400 to-emerald-400 text-black border border-amber-300 shadow-xs hover:scale-110";
      default:
        return "bg-muted/40";
    }
  };

  return (
    <Card className="p-5 border-border bg-card shadow-sm space-y-4">
      {/* Cheat Day Special Notification Banner */}
      {cheatDayInfo.isCheatDayUsedThisMonth ? (
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-700/60 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-zinc-300 font-medium">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Monthly Cheat Day Status:</strong>{" "}
              <span className="text-emerald-400 font-bold">Completed & Locked for this Month</span>{" "}
              <span className="text-zinc-400 text-[11px] block sm:inline">
                (Logged in {cheatDayInfo.lastUsedMonth}. Next Cheat Day available next month!)
              </span>
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadCalendar}
            className="h-7 text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1.5 font-medium"
          >
            <CalendarSync className="w-3.5 h-3.5 text-blue-400" />
            Sync Mobile Calendar
          </Button>
        </div>
      ) : cheatDayInfo.isCheatDayToday ? (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/10 border border-amber-500/30 text-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-extrabold text-sm text-amber-400 block">
                🍕 IT&apos;S YOUR CHEAT DAY TODAY!
              </span>
              <span className="text-xs text-amber-200/90">
                Enjoy your junk food today! Once completed, click below to lock in your monthly cheat day.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              disabled={markingCompleted}
              onClick={handleMarkCompleted}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1"
            >
              {markingCompleted ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Complete Cheat Day
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadCalendar}
              className="h-7 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/20 gap-1"
            >
              <CalendarSync className="w-3 h-3 text-blue-400" />
              Sync Mobile Calendar
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-orange-400 shrink-0" />
            <span>
              <strong>Designated Cheat Day:</strong>{" "}
              <span className="text-orange-400 font-bold">{cheatDayInfo.cheatDay}</span>{" "}
              <span className="text-muted-foreground text-[11px]">
                ({cheatDayInfo.daysUntilCheatDay === 1 ? "Tomorrow!" : `In ${cheatDayInfo.daysUntilCheatDay} days`})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={rollingCheatDay || cheatDayInfo.isCheatDayUsedThisMonth}
              onClick={handleRollCheatDay}
              className="h-7 text-xs text-orange-400 hover:bg-orange-500/10 gap-1.5 font-medium"
            >
              {rollingCheatDay ? <Loader2 className="w-3 h-3 animate-spin" /> : <Dice5 className="w-3 h-3 text-orange-400" />}
              Roll Random Cheat Day
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadCalendar}
              className="h-7 text-xs border-border/60 text-muted-foreground hover:text-foreground gap-1.5"
            >
              <CalendarSync className="w-3.5 h-3.5 text-blue-400" />
              Sync Mobile Calendar
            </Button>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-500/5 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 animate-pulse fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold tracking-tight text-foreground">
                {currentStreak} Day Active Streak
              </h3>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Active streak: {currentStreak} days</span>
            </p>
          </div>
        </div>

        {/* Action & Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40 text-xs">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Trophy className="w-3.5 h-3.5" /> Best: {longestStreak}d
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1 text-emerald-500 font-semibold">
              <Calendar className="w-3.5 h-3.5" /> {totalActiveDays} Days Total
            </div>
          </div>
        </div>
      </div>

      {/* GitHub / LeetCode Contribution Heatmap Grid */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          
          <div className="flex items-center gap-1 text-[11px]">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-muted/40 border border-border/20" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/25 border border-emerald-500/30" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/50 border border-emerald-500/60" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/80 border border-emerald-500/90" />
            <div className="w-2.5 h-2.5 rounded-xs bg-gradient-to-br from-amber-400 to-emerald-400 border border-amber-300" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <div className="flex gap-1.5 min-w-max">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`w-3.5 h-3.5 rounded-xs transition-all duration-150 cursor-pointer ${getSquareColor(
                      day.level
                    )}`}
                    title={`${day.date}: ${day.activityCount} domains completed (${day.workouts} workouts, ${day.habits} habits, ${day.tasks} tasks, ${day.calories} kcal)`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day Activity Details Popup (if selected) */}
      {selectedDay && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border/60 text-xs flex items-center justify-between animate-fade-in">
          <div className="space-y-0.5">
            <span className="font-bold text-foreground block">
              {selectedDay.date} — {selectedDay.activityCount} of 4 LifeFit Domains Completed
            </span>
            <span className="text-muted-foreground text-[11px]">
              🏋️ {selectedDay.workouts} Workouts · 🎯 {selectedDay.habits} Habits · ✅ {selectedDay.tasks} Tasks · 🔥 {selectedDay.calories} kcal logged
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] text-muted-foreground"
            onClick={() => setSelectedDay(null)}
          >
            Close
          </Button>
        </div>
      )}
    </Card>
  );
}
