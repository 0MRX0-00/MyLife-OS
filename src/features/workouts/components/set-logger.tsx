"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Exercise } from "@prisma/client";

export interface LoggedSet {
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

interface SetLoggerProps {
  exercise: Exercise;
  sets: LoggedSet[];
  onChangeSets: (sets: LoggedSet[]) => void;
  onRemoveExercise: () => void;
}

export function SetLogger({ exercise, sets, onChangeSets, onRemoveExercise }: SetLoggerProps) {
  const updateSet = <K extends keyof LoggedSet>(index: number, field: K, value: LoggedSet[K]) => {
    const next = [...sets];
    next[index] = { ...next[index], [field]: value };
    onChangeSets(next);
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSet: LoggedSet = {
      setNumber: sets.length + 1,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      rpe: lastSet ? lastSet.rpe : 8,
      completed: true,
    };
    onChangeSets([...sets, newSet]);
  };

  const removeSet = (index: number) => {
    const filtered = sets.filter((_, i) => i !== index);
    const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    onChangeSets(renumbered);
  };

  return (
    <div className="border rounded-lg p-3 bg-card space-y-3">
      {/* Exercise Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-sm font-bold text-foreground">{exercise.name}</h3>
          <span className="text-xs text-muted-foreground capitalize">
            {exercise.muscleGroup} · {exercise.category}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          onClick={onRemoveExercise}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Set Header Labels */}
      <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-muted-foreground px-1 text-center">
        <span className="col-span-2 text-left">SET</span>
        <span className="col-span-3">KG</span>
        <span className="col-span-3">REPS</span>
        <span className="col-span-2">RPE</span>
        <span className="col-span-2">DONE</span>
      </div>

      {/* Sets List */}
      <div className="space-y-2">
        {sets.map((set, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center text-center">
            <span className="col-span-2 text-xs font-bold text-left pl-1">
              #{set.setNumber}
            </span>
            <div className="col-span-3">
              <Input
                type="number"
                step="0.5"
                className="h-8 text-center text-xs font-medium"
                value={set.weight || ""}
                onChange={(e) => updateSet(idx, "weight", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                className="h-8 text-center text-xs font-medium"
                value={set.reps || ""}
                onChange={(e) => updateSet(idx, "reps", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                step="0.5"
                min="1"
                max="10"
                className="h-8 text-center text-xs text-muted-foreground"
                value={set.rpe || ""}
                onChange={(e) => updateSet(idx, "rpe", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2 flex items-center justify-center gap-1">
              <Checkbox
                checked={set.completed}
                onCheckedChange={(checked) => updateSet(idx, "completed", !!checked)}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeSet(idx)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Set Action */}
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs h-8 flex items-center justify-center gap-1"
        onClick={addSet}
      >
        <Plus className="w-3.5 h-3.5" /> Add Set
      </Button>
    </div>
  );
}
