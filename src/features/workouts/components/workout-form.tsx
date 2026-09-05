"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, Plus, Save, Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { ExercisePicker } from "./exercise-picker";
import { SetLogger, LoggedSet } from "./set-logger";
import { PRBadge } from "./pr-badge";
import { saveWorkoutAction } from "../actions";
import { Exercise } from "@prisma/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ExerciseState {
  exercise: Exercise;
  sets: LoggedSet[];
}

interface PRRecord {
  type: "weight" | "reps" | "volume" | "one_rm";
  value: number;
  exerciseName: string;
}

export function WorkoutForm() {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState("Push Workout");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState("");

  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detectedPRs, setDetectedPRs] = useState<PRRecord[]>([]);

  const handleAddExercise = (exercise: Exercise) => {
    // Prevent duplicate exercises in same workout
    if (exercises.some((e) => e.exercise.id === exercise.id)) {
      toast.info(`${exercise.name} is already added`);
      return;
    }

    setExercises((prev) => [
      ...prev,
      {
        exercise,
        sets: [
          { setNumber: 1, weight: 60, reps: 10, rpe: 8, completed: true },
          { setNumber: 2, weight: 60, reps: 10, rpe: 8, completed: true },
          { setNumber: 3, weight: 60, reps: 8, rpe: 9, completed: true },
        ],
      },
    ]);
  };

  const handleUpdateSets = (exerciseId: string, sets: LoggedSet[]) => {
    setExercises((prev) =>
      prev.map((e) => (e.exercise.id === exerciseId ? { ...e, sets } : e))
    );
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.exercise.id !== exerciseId));
  };

  const handleSave = async () => {
    if (exercises.length === 0) {
      toast.error("Please add at least one exercise to your workout");
      return;
    }

    setSaving(true);
    setDetectedPRs([]);

    try {
      const payload = {
        workoutName,
        date,
        duration,
        notes,
        exercises: exercises.map((e) => ({
          exerciseId: e.exercise.id,
          sets: e.sets,
        })),
      };

      const res = await saveWorkoutAction(payload);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Workout saved successfully!");
        if (res.prs && res.prs.length > 0) {
          setDetectedPRs(res.prs as PRRecord[]);
          toast.success(`🎉 ${res.prs.length} Personal Record(s) achieved!`);
        } else {
          router.push("/workouts");
        }
      }
    } catch {
      toast.error("Failed to save workout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Detected PR Celebrations */}
      {detectedPRs.length > 0 && (
        <div className="space-y-2 p-4 border rounded-xl bg-amber-500/5 border-amber-500/20">
          <h3 className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
            🏆 Personal Record Achievements!
          </h3>
          {detectedPRs.map((pr, i) => (
            <PRBadge key={i} type={pr.type} value={pr.value} exerciseName={pr.exerciseName} />
          ))}
          <Button
            size="sm"
            className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => router.push("/workouts")}
          >
            Continue to Workouts List
          </Button>
        </div>
      )}

      {/* Basic Workout Info Form */}
      <div className="border rounded-xl p-4 bg-card space-y-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Workout Name</Label>
          <Input
            className="font-bold text-lg"
            placeholder="e.g. Upper Body Hypertrophy"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" /> Date
            </Label>
            <Input
              type="date"
              className="text-xs mt-1"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Duration (mins)
            </Label>
            <Input
              type="number"
              className="text-xs mt-1"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold">Session Notes (Optional)</Label>
          <Textarea
            placeholder="Felt great, energy was high. Bench press felt smooth."
            className="text-xs mt-1"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Exercises Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-blue-500" /> Exercises ({exercises.length})
          </h2>
          <Button
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={() => setPickerOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Add Exercise
          </Button>
        </div>

        {exercises.length === 0 ? (
          <div className="py-12 text-center border rounded-xl bg-muted/10 space-y-2">
            <Dumbbell className="w-8 h-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No exercises added yet.</p>
            <Button size="sm" onClick={() => setPickerOpen(true)} className="mt-2">
              Select First Exercise
            </Button>
          </div>
        ) : (
          exercises.map((item) => (
            <SetLogger
              key={item.exercise.id}
              exercise={item.exercise}
              sets={item.sets}
              onChangeSets={(sets) => handleUpdateSets(item.exercise.id, sets)}
              onRemoveExercise={() => handleRemoveExercise(item.exercise.id)}
            />
          ))
        )}
      </div>

      {/* Save Workout CTA */}
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-11 text-base font-semibold"
        disabled={saving || exercises.length === 0}
        onClick={handleSave}
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Save Completed Workout
      </Button>

      {/* Exercise Picker Dialog */}
      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelectExercise={handleAddExercise}
      />
    </div>
  );
}
