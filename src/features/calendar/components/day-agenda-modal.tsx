"use client";

import { useState } from "react";
import { DayCalendarData } from "@/services/calendar/calendar-service";
import { createCalendarTaskAction, toggleCalendarTaskAction } from "../actions";
import { deleteTaskAction } from "@/features/tasks/actions";
import { format, parseISO } from "date-fns";
import {
  X,
  Plus,
  CheckCircle2,
  Circle,
  Dumbbell,
  Target,
  Flame,
  Calendar as CalendarIcon,
  Loader2,
  Trash2,
} from "lucide-react";

interface DayAgendaModalProps {
  day: DayCalendarData | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function DayAgendaModal({ day, onClose, onRefresh }: DayAgendaModalProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [newCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  if (!day) return null;

  const dateObj = parseISO(day.dateStr);
  const formattedDate = format(dateObj, "EEEE, MMMM d, yyyy");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    const res = await createCalendarTaskAction({
      title: newTitle.trim(),
      dueDate: day.dateStr,
      priority: newPriority,
      category: newCategory,
    });
    setLoading(false);

    if (res.success) {
      setNewTitle("");
      setIsAddingTask(false);
      onRefresh();
    }
  };

  const handleToggleTask = async (taskId: string) => {
    setTogglingId(taskId);
    await toggleCalendarTaskAction(taskId);
    setTogglingId(null);
    onRefresh();
  };

  const handleDeleteTask = async (taskId: string) => {
    setTogglingId(taskId);
    await deleteTaskAction(taskId);
    setTogglingId(null);
    onRefresh();
  };

  const tasks = day.events.filter((e) => e.type === "task");
  const workouts = day.events.filter((e) => e.type === "workout");
  const habits = day.events.filter((e) => e.type === "habit");
  const isCheat = day.isCheatDay;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {formattedDate}
              </h2>
              <p className="text-xs text-muted-foreground">
                {day.isToday ? "Today's Schedule & Logs" : "Day Overview"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          {/* Cheat Day Banner if applicable */}
          {isCheat && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-4 text-amber-500 shadow-sm">
              <span className="text-2xl">🍕</span>
              <div>
                <h4 className="text-sm font-bold">Designated Cheat Day</h4>
                <p className="text-xs text-amber-500/80">
                  Enjoy your favorite food today! Your calorie allowance is boosted.
                </p>
              </div>
            </div>
          )}

          {/* Calorie & Macro Summary Pill */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-accent/40 p-4">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Nutrition Logged</p>
                <p className="text-base font-bold text-foreground">
                  {day.caloriesLogged} <span className="text-xs font-normal text-muted-foreground">/ {day.calorieTarget} kcal</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (day.caloriesLogged / (day.calorieTarget || 2000)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Workouts Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workouts ({workouts.length})
              </h3>
            </div>
            {workouts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic pl-6">No workouts logged on this date.</p>
            ) : (
              <div className="space-y-2">
                {workouts.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{w.title}</p>
                        <p className="text-xs text-muted-foreground">{w.subtitle}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-500">
                      Logged
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habits Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Habits Completed ({habits.length})
              </h3>
            </div>
            {habits.length === 0 ? (
              <p className="text-xs text-muted-foreground italic pl-6">No habits completed on this date.</p>
            ) : (
              <div className="space-y-2">
                {habits.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-foreground">{h.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tasks ({tasks.length})
                </h3>
              </div>
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Quick Add Task
              </button>
            </div>

            {/* Quick Add Form */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="mb-3 space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !newTitle.trim()}
                      className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Task"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic pl-6">No tasks scheduled for this date.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => {
                  const isDone = t.status === "done";
                  const isSyncing = togglingId === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-all ${
                        isDone
                          ? "border-border bg-muted/30 opacity-70"
                          : "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTask(t.id)}
                          disabled={isSyncing}
                          className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                        >
                          {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                        <span className={`font-medium ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.externalProvider && (
                          <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                            {t.externalProvider}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          disabled={isSyncing}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                          title="Delete task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
