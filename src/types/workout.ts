import { Workout, Exercise, WorkoutExercise, ExerciseSet } from "@prisma/client";

export type WorkoutExerciseWithDetails = WorkoutExercise & {
  exercise: Exercise;
  sets: ExerciseSet[];
};

export type WorkoutWithDetails = Workout & {
  exercises: WorkoutExerciseWithDetails[];
};

export interface CreateExerciseSetInput {
  setNumber: number;
  weight?: number | null;
  reps?: number | null;
  duration?: number | null;
  distance?: number | null;
  rpe?: number | null;
  completed?: boolean;
}

export interface CreateWorkoutExerciseInput {
  exerciseId: string;
  order?: number;
  sets: CreateExerciseSetInput[];
}

export interface CreateWorkoutInput {
  workoutName: string;
  date: string;
  duration?: number | null;
  notes?: string | null;
  exercises: CreateWorkoutExerciseInput[];
}
