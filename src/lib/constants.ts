// ─── Meal Types ──────────────────────────────────────────────────────
export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

// ─── Muscle Groups ───────────────────────────────────────────────────
export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "core",
  "cardio",
  "full_body",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

// ─── Exercise Categories ─────────────────────────────────────────────
export const EXERCISE_CATEGORIES = [
  "compound",
  "isolation",
  "cardio",
  "bodyweight",
  "machine",
] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

// ─── Difficulty ──────────────────────────────────────────────────────
export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

// ─── Priority ────────────────────────────────────────────────────────
export const PRIORITIES = ["normal", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

// ─── Task Status ─────────────────────────────────────────────────────
export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// ─── Habit Frequency ─────────────────────────────────────────────────
export const HABIT_FREQUENCIES = ["daily", "weekly", "custom"] as const;
export type HabitFrequency = (typeof HABIT_FREQUENCIES)[number];

// ─── Activity Level ──────────────────────────────────────────────────
export const ACTIVITY_LEVELS = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

// ─── Goals ───────────────────────────────────────────────────────────
export const GOALS = ["lose", "maintain", "gain"] as const;
export type Goal = (typeof GOALS)[number];

// ─── Integration Providers ───────────────────────────────────────────
export const INTEGRATION_PROVIDERS = [
  "todoist",
  "habitica",
  "nutrition_api",
  "exercise_api",
] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

// ─── Sync Status ─────────────────────────────────────────────────────
export const SYNC_STATUSES = [
  "idle",
  "syncing",
  "error",
  "disconnected",
] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

// ─── Recurring Patterns ──────────────────────────────────────────────
export const RECURRING_PATTERNS = [
  "daily",
  "weekdays",
  "weekly",
  "monthly",
] as const;
export type RecurringPattern = (typeof RECURRING_PATTERNS)[number];

// ─── Serving Units ───────────────────────────────────────────────────
export const SERVING_UNITS = [
  "g",
  "ml",
  "oz",
  "cup",
  "tbsp",
  "tsp",
  "piece",
  "slice",
  "serving",
] as const;
export type ServingUnit = (typeof SERVING_UNITS)[number];

// ─── Navigation ──────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Nutrition", href: "/nutrition", icon: "Apple" },
  { label: "Workout", href: "/workouts", icon: "Dumbbell" },
  { label: "Progress", href: "/progress", icon: "TrendingUp" },
  { label: "Habits", href: "/habits", icon: "Target" },
  { label: "Tasks", href: "/tasks", icon: "CheckSquare" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

// ─── RPE Scale ───────────────────────────────────────────────────────
export const RPE_SCALE = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10] as const;

// ─── Activity Level Multipliers (Harris-Benedict) ────────────────────
export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// ─── Goal Adjustments (calories) ─────────────────────────────────────
export const GOAL_ADJUSTMENTS: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};
