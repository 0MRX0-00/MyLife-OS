import { MacroTotals, DailyMacroProgress } from "@/types/nutrition";
import { Profile } from "@prisma/client";

export function computeMacros(
  calories: number,
  protein: number,
  carbohydrates: number,
  fat: number,
  quantity: number
): MacroTotals {
  const qty = Math.max(0, quantity);
  return {
    calories: Math.round(calories * qty),
    protein: Math.round(protein * qty * 10) / 10,
    carbohydrates: Math.round(carbohydrates * qty * 10) / 10,
    fat: Math.round(fat * qty * 10) / 10,
  };
}

export function computeDailyTotals(
  logs: { calories: number; protein: number; carbohydrates: number; fat: number }[]
): MacroTotals {
  return logs.reduce(
    (acc, log) => ({
      calories: Math.round(acc.calories + log.calories),
      protein: Math.round((acc.protein + log.protein) * 10) / 10,
      carbohydrates: Math.round((acc.carbohydrates + log.carbohydrates) * 10) / 10,
      fat: Math.round((acc.fat + log.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );
}

export function estimateTargets(profile?: Partial<Profile> | null) {
  const weight = profile?.weight || 70; // kg
  const height = profile?.height || 175; // cm
  const age = profile?.age || 25;
  const sex = profile?.sex || "male";
  const activityLevel = profile?.activityLevel || "moderate";
  const goal = profile?.goal || "maintain";

  // Mifflin-St Jeor BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = sex === "female" ? bmr - 161 : bmr + 5;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  let targetCalories = tdee;
  if (goal === "lose") targetCalories -= 500;
  if (goal === "gain") targetCalories += 300;

  targetCalories = Math.max(1200, Math.round(targetCalories));

  // Default macro split: 30% protein, 40% carbs, 30% fat
  const proteinTarget = Math.round((targetCalories * 0.3) / 4);
  const carbTarget = Math.round((targetCalories * 0.4) / 4);
  const fatTarget = Math.round((targetCalories * 0.3) / 9);

  return {
    calorieTarget: profile?.calorieTarget || targetCalories,
    proteinTarget: profile?.proteinTarget || proteinTarget,
    carbTarget: profile?.carbTarget || carbTarget,
    fatTarget: profile?.fatTarget || fatTarget,
  };
}

export function computeProgress(
  totals: MacroTotals,
  profile?: Partial<Profile> | null
): DailyMacroProgress {
  const targets = estimateTargets(profile);

  return {
    consumed: totals,
    targets: {
      calories: targets.calorieTarget,
      protein: targets.proteinTarget,
      carbohydrates: targets.carbTarget,
      fat: targets.fatTarget,
    },
    remaining: {
      calories: Math.max(0, targets.calorieTarget - totals.calories),
      protein: Math.max(0, Math.round((targets.proteinTarget - totals.protein) * 10) / 10),
      carbohydrates: Math.max(0, Math.round((targets.carbTarget - totals.carbohydrates) * 10) / 10),
      fat: Math.max(0, Math.round((targets.fatTarget - totals.fat) * 10) / 10),
    },
    percentages: {
      calories: Math.min(100, Math.round((totals.calories / targets.calorieTarget) * 100)),
      protein: Math.min(100, Math.round((totals.protein / targets.proteinTarget) * 100)),
      carbohydrates: Math.min(100, Math.round((totals.carbohydrates / targets.carbTarget) * 100)),
      fat: Math.min(100, Math.round((totals.fat / targets.fatTarget) * 100)),
    },
  };
}
