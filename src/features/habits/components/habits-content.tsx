"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, Flame, Plus, Trash2, Target, Loader2, Gamepad2 } from "lucide-react";
import { toggleHabitAction, createHabitAction, deleteHabitAction, syncHabiticaAction } from "../actions";
import { toast } from "sonner";

interface HabitWithStats {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  target: number;
  color: string;
  isCompletedToday: boolean;
  stats: {
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
  };
}

interface HabitsContentProps {
  habits: HabitWithStats[];
  todayStr: string;
}

export function HabitsContent({ habits, todayStr }: HabitsContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncingHabitica, setSyncingHabitica] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [color, setColor] = useState("#10b981");

  const handleSyncHabitica = async () => {
    setSyncingHabitica(true);
    try {
      const res = await syncHabiticaAction();
      if (res.success) {
        toast.success(`🎮 Habitica sync complete! Imported ${res.syncedCount || 0} mobile habits.`);
      } else {
        toast.error(res.reason || "Failed to sync Habitica habits");
      }
    } catch {
      toast.error("Failed to connect to Habitica");
    } finally {
      setSyncingHabitica(false);
    }
  };

  const handleToggle = async (habitId: string) => {
    try {
      const res = await toggleHabitAction(habitId, todayStr);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Habit status updated!");
      }
    } catch {
      toast.error("Failed to toggle habit");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description);
      formData.set("frequency", frequency);
      formData.set("color", color);

      const res = await createHabitAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Habit created successfully!");
        setModalOpen(false);
        setName("");
        setDescription("");
      }
    } catch {
      toast.error("Failed to create habit");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteHabitAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Habit removed");
      }
    } catch {
      toast.error("Failed to delete habit");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-sm text-muted-foreground">Build consistency with daily streaks, targets, and automatic streak calculation.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            disabled={syncingHabitica}
            onClick={handleSyncHabitica}
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex items-center gap-1.5 text-xs font-semibold"
          >
            {syncingHabitica ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gamepad2 className="w-3.5 h-3.5" />}
            Sync Mobile Habitica
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 text-xs" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Habit
          </Button>
        </div>
      </div>

      {/* Habits List */}
      <div className="grid gap-4 md:grid-cols-2">
        {habits.length === 0 ? (
          <div className="md:col-span-2 py-12 text-center border rounded-xl bg-muted/10 space-y-2">
            <Target className="w-8 h-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No active habits yet.</p>
            <Button size="sm" onClick={() => setModalOpen(true)}>Create Your First Habit</Button>
          </div>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id} className="p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(habit.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      habit.isCompletedToday
                        ? "bg-amber-500 text-black shadow-md scale-105"
                        : "border-2 border-muted-foreground/30 hover:border-amber-500"
                    }`}
                  >
                    {habit.isCompletedToday && <Check className="w-5 h-5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1">
                    <span className={`text-base font-semibold block ${habit.isCompletedToday ? "line-through text-muted-foreground" : ""}`}>
                      {habit.name}
                    </span>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{habit.description}</p>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(habit.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Streak Footer */}
              <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Flame className="w-4 h-4 fill-amber-500" /> {habit.stats.currentStreak} Day Streak
                </span>
                <span className="text-muted-foreground">
                  Best: {habit.stats.longestStreak} days · {habit.stats.completionRate}%
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Dialog for New Habit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create New Habit</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <Label className="text-xs">Habit Name *</Label>
              <Input
                placeholder="e.g. Read 20 pages, Drink 3L water"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label className="text-xs">Description (Optional)</Label>
              <Input
                placeholder="e.g. Non-fiction or technical books"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Frequency</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Accent Color</Label>
                <Input
                  type="color"
                  className="h-9 p-1"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading || !name} className="bg-amber-600 hover:bg-amber-700 text-white">
                Create Habit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
