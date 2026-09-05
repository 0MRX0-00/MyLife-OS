import { z } from "zod";
import {
  MEAL_TYPES,
  MUSCLE_GROUPS,
  EXERCISE_CATEGORIES,
  DIFFICULTIES,
  PRIORITIES,
  TASK_STATUSES,
  HABIT_FREQUENCIES,
  ACTIVITY_LEVELS,
  GOALS,
  SERVING_UNITS,
  RECURRING_PATTERNS,
} from "@/lib/constants";

// ─── Auth ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ─── Profile ─────────────────────────────────────────────────────────

export const profileSchema = z.object({
  height: z.number().positive().max(300).optional().nullable(),
  weight: z.number().positive().max(500).optional().nullable(),
  age: z.number().int().positive().max(150).optional().nullable(),
  sex: z.enum(["male", "female", "other"]).optional().nullable(),
  activityLevel: z.enum(ACTIVITY_LEVELS).optional().nullable(),
  goal: z.enum(GOALS).optional().nullable(),
  calorieTarget: z.number().int().positive().max(10000).optional().nullable(),
  proteinTarget: z.number().int().positive().max(1000).optional().nullable(),
  carbTarget: z.number().int().positive().max(2000).optional().nullable(),
  fatTarget: z.number().int().positive().max(1000).optional().nullable(),
  timezone: z.string().default("UTC"),
});

// ─── Food ────────────────────────────────────────────────────────────

export const foodSchema = z.object({
  name: z.string().min(1, "Food name is required").max(200),
  brand: z.string().max(200).optional().nullable(),
  servingSize: z.number().positive("Serving size must be positive"),
  servingUnit: z.enum(SERVING_UNITS),
  calories: z.number().min(0, "Calories cannot be negative"),
  protein: z.number().min(0, "Protein cannot be negative"),
  carbohydrates: z.number().min(0, "Carbs cannot be negative"),
  fat: z.number().min(0, "Fat cannot be negative"),
  fiber: z.number().min(0, "Fiber cannot be negative").default(0),
});

export const foodLogSchema = z.object({
  foodId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  mealType: z.enum(MEAL_TYPES),
  quantity: z.number().positive("Quantity must be positive"),
  notes: z.string().max(500).optional().nullable(),
});

export const quickAddSchema = z.object({
  text: z.string().min(1, "Enter food description").max(1000),
  mealType: z.enum(MEAL_TYPES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

// ─── Workout ─────────────────────────────────────────────────────────

export const exerciseSetSchema = z.object({
  setNumber: z.number().int().positive(),
  weight: z.number().min(0).optional().nullable(),
  reps: z.number().int().min(0).optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  distance: z.number().min(0).optional().nullable(),
  rpe: z.number().min(1).max(10).optional().nullable(),
  completed: z.boolean().default(true),
});

export const workoutExerciseSchema = z.object({
  exerciseId: z.string().cuid(),
  order: z.number().int().min(0),
  sets: z.array(exerciseSetSchema),
});

export const workoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  workoutName: z.string().min(1, "Workout name is required").max(200),
  duration: z.number().int().positive().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  exercises: z.array(workoutExerciseSchema).min(1, "Add at least one exercise"),
});

export const exerciseSchema = z.object({
  name: z.string().min(1).max(200),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  category: z.enum(EXERCISE_CATEGORIES),
  difficulty: z.enum(DIFFICULTIES).default("intermediate"),
  instructions: z.string().max(2000).optional().nullable(),
});

// ─── Body Metrics ────────────────────────────────────────────────────

export const bodyMetricSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  weight: z.number().positive().max(500).optional().nullable(),
  bodyFat: z.number().min(0).max(100).optional().nullable(),
  waist: z.number().positive().max(300).optional().nullable(),
  chest: z.number().positive().max(300).optional().nullable(),
  arms: z.number().positive().max(100).optional().nullable(),
  thighs: z.number().positive().max(200).optional().nullable(),
});

// ─── Habits ──────────────────────────────────────────────────────────

export const habitSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(200),
  description: z.string().max(500).optional().nullable(),
  frequency: z.enum(HABIT_FREQUENCIES).default("daily"),
  target: z.number().int().positive().default(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#10b981"),
  icon: z.string().max(50).optional().nullable(),
});

export const habitLogSchema = z.object({
  habitId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  completed: z.boolean(),
  value: z.number().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// ─── Tasks ───────────────────────────────────────────────────────────

export const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(2000).optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  priority: z.enum(PRIORITIES).default("normal"),
  status: z.enum(TASK_STATUSES).default("todo"),
  category: z.string().max(100).optional().nullable(),
  recurringPattern: z.enum(RECURRING_PATTERNS).optional().nullable(),
});

// ─── Search ──────────────────────────────────────────────────────────

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
  type: z
    .enum(["all", "foods", "exercises", "workouts", "habits", "tasks"])
    .default("all"),
});

// ─── Type exports ────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type FoodInput = z.infer<typeof foodSchema>;
export type FoodLogInput = z.infer<typeof foodLogSchema>;
export type QuickAddInput = z.infer<typeof quickAddSchema>;
export type ExerciseSetInput = z.infer<typeof exerciseSetSchema>;
export type WorkoutExerciseInput = z.infer<typeof workoutExerciseSchema>;
export type WorkoutInput = z.infer<typeof workoutSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type BodyMetricInput = z.infer<typeof bodyMetricSchema>;
export type HabitInput = z.infer<typeof habitSchema>;
export type HabitLogInput = z.infer<typeof habitLogSchema>;
export type TodoInput = z.infer<typeof todoSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
