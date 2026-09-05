"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Plus, Dumbbell, ArrowLeft, X } from "lucide-react";
import { searchExercisesAction, createCustomExerciseAction } from "../actions";
import { Exercise } from "@prisma/client";
import { toast } from "sonner";

interface ExercisePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: Exercise) => void;
}

const MUSCLE_GROUPS = [
  "all",
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "core",
  "cardio",
  "full_body",
];

function formatLabel(str: string): string {
  if (str === "all") return "All Muscles";
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ExercisePicker({ open, onOpenChange, onSelectExercise }: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Custom exercise state
  const [customName, setCustomName] = useState("");
  const [customMuscle, setCustomMuscle] = useState("chest");
  const [customCategory, setCustomCategory] = useState("compound");
  const [savingCustom, setSavingCustom] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchExercisesAction(
          query,
          selectedMuscle === "all" ? undefined : selectedMuscle
        );
        setExercises(results);
      } catch {
        // ignore error gracefully
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [open, query, selectedMuscle]);

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    setSavingCustom(true);
    try {
      const res = await createCustomExerciseAction({
        name: customName.trim(),
        muscleGroup: customMuscle,
        category: customCategory,
      });

      if (res.error || !res.exercise) {
        toast.error(res.error || "Failed to create exercise");
      } else {
        toast.success(`Created exercise: ${res.exercise.name}`);
        onSelectExercise(res.exercise);
        setShowCustomForm(false);
        setCustomName("");
        onOpenChange(false);
      }
    } catch {
      toast.error("Error creating custom exercise");
    } finally {
      setSavingCustom(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-6 gap-4">
        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-center justify-between pr-6 space-y-0 pb-1 border-b border-border/40">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span>{showCustomForm ? "Create Custom Exercise" : "Select Exercise"}</span>
          </DialogTitle>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 gap-1.5 h-8 px-2.5 font-medium rounded-lg"
            onClick={() => setShowCustomForm(!showCustomForm)}
          >
            {showCustomForm ? (
              <>
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Search
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Custom Exercise
              </>
            )}
          </Button>
        </DialogHeader>

        {showCustomForm ? (
          <form onSubmit={handleCreateCustom} className="space-y-4 py-1 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Exercise Name *</Label>
              <Input
                placeholder="e.g. Single-Arm Cable Lat Pulldown"
                className="h-9 text-xs"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Target Muscle Group</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs capitalize text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value)}
                >
                  {MUSCLE_GROUPS.filter((m) => m !== "all").map((m) => (
                    <option key={m} value={m}>
                      {formatLabel(m)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Category</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs capitalize text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                >
                  <option value="compound">Compound</option>
                  <option value="isolation">Isolation</option>
                  <option value="machine">Machine</option>
                  <option value="bodyweight">Bodyweight</option>
                  <option value="cardio">Cardio</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-9 text-xs"
                disabled={savingCustom || !customName.trim()}
              >
                {savingCustom ? "Saving..." : "Save & Select Exercise"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 min-h-0 flex-1">
            {/* Search input with clear button */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search 110+ exercises by name..."
                className="pl-9 pr-8 text-xs h-9 bg-muted/30 focus-visible:bg-background transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Muscle group filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none -mx-1 px-1 shrink-0">
              {MUSCLE_GROUPS.map((muscle) => {
                const isActive = selectedMuscle === muscle;
                return (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() => setSelectedMuscle(muscle)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                    }`}
                  >
                    {formatLabel(muscle)}
                  </button>
                );
              })}
            </div>

            {/* Exercise list container */}
            <div className="flex-1 overflow-y-auto border border-border/60 rounded-xl divide-y divide-border/40 min-h-[260px] max-h-[320px]">
              {loading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Searching exercises...</span>
                </div>
              ) : exercises.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-3 flex flex-col items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-muted-foreground/30" />
                  <p className="font-medium text-foreground">No exercises found</p>
                  <p className="text-muted-foreground text-[11px]">
                    Try adjusting your search query or filter group.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 gap-1.5 text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                    onClick={() => setShowCustomForm(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Custom Exercise
                  </Button>
                </div>
              ) : (
                exercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => {
                      onSelectExercise(ex);
                      onOpenChange(false);
                    }}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="space-y-1 pr-3">
                      <span className="text-xs font-semibold text-foreground group-hover:text-blue-500 transition-colors block">
                        {ex.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-500 uppercase tracking-wider">
                          {formatLabel(ex.muscleGroup)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground capitalize">
                          {ex.category}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-full text-muted-foreground group-hover:text-blue-500 group-hover:bg-blue-500/10 shrink-0 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
