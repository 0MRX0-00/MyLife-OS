"use server";

import { requireAuth } from "@/lib/auth-utils";
import { foodSchema as createFoodSchema, foodLogSchema as createFoodLogSchema, quickAddSchema } from "@/utils/validation";
import { getUserFoods, createFood } from "@/services/nutrition/food-service";
import { logFoodItem, deleteFoodLogItem } from "@/services/nutrition/food-log-service";
import { parseQuickEntryText } from "@/services/nutrition/text-parser";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function searchFoodsAction(query?: string) {
  const userId = await requireAuth();
  return getUserFoods(userId, query);
}

export async function createFoodAction(formData: FormData) {
  const userId = await requireAuth();
  const raw = {
    name: formData.get("name") as string,
    brand: (formData.get("brand") as string) || undefined,
    servingSize: parseFloat(formData.get("servingSize") as string) || 100,
    servingUnit: (formData.get("servingUnit") as string) || "g",
    calories: parseFloat(formData.get("calories") as string) || 0,
    protein: parseFloat(formData.get("protein") as string) || 0,
    carbohydrates: parseFloat(formData.get("carbohydrates") as string) || 0,
    fat: parseFloat(formData.get("fat") as string) || 0,
    fiber: parseFloat(formData.get("fiber") as string) || 0,
    isFavorite: formData.get("isFavorite") === "true",
  };

  const parsed = createFoodSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid food data" };
  }

  try {
    const food = await createFood(userId, parsed.data);
    revalidatePath("/nutrition");
    return { success: true, food };
  } catch {
    return { error: "Failed to create food" };
  }
}

export async function logFoodAction(input: {
  foodId: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  quantity: number;
  notes?: string;
}) {
  const userId = await requireAuth();
  const parsed = createFoodLogSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid food log input" };
  }

  try {
    const log = await logFoodItem(userId, parsed.data);
    revalidatePath("/nutrition");
    revalidatePath("/dashboard");
    return { success: true, log };
  } catch {
    return { error: "Failed to log food" };
  }
}

export async function deleteLogAction(logId: string) {
  const userId = await requireAuth();
  try {
    await deleteFoodLogItem(userId, logId);
    revalidatePath("/nutrition");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to delete food log" };
  }
}

export async function parseQuickEntryAction(text: string) {
  await requireAuth();
  const parsed = quickAddSchema.safeParse({ text, mealType: "lunch", date: new Date().toISOString().split("T")[0] });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Text cannot be empty" };
  }

  const items = await parseQuickEntryText(parsed.data.text);
  return { success: true, items };
}

export async function confirmQuickAddEntriesAction(entries: {
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  date: string;
  quantity: number;
}[]) {
  const userId = await requireAuth();
  try {
    for (const entry of entries) {
      // 1. Create or find food
      const food = await createFood(userId, {
        name: entry.name,
        servingSize: 100,
        servingUnit: "g",
        calories: entry.calories,
        protein: entry.protein,
        carbohydrates: entry.carbohydrates,
        fat: entry.fat,
      });

      // 2. Log food item
      await logFoodItem(userId, {
        foodId: food.id,
        date: entry.date,
        mealType: entry.mealType,
        quantity: entry.quantity,
      });
    }

    revalidatePath("/nutrition");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to save quick add entries" };
  }
}

export async function updateMacroTargetsAction(input: {
  calorieTarget: number;
  proteinTarget?: number;
  carbTarget?: number;
  fatTarget?: number;
}) {
  const userId = await requireAuth();
  try {
    const calorieTarget = Math.max(500, Math.min(10000, Math.round(input.calorieTarget)));
    const proteinTarget = input.proteinTarget ? Math.max(0, Math.round(input.proteinTarget)) : Math.round((calorieTarget * 0.3) / 4);
    const carbTarget = input.carbTarget ? Math.max(0, Math.round(input.carbTarget)) : Math.round((calorieTarget * 0.4) / 4);
    const fatTarget = input.fatTarget ? Math.max(0, Math.round(input.fatTarget)) : Math.round((calorieTarget * 0.3) / 9);

    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        calorieTarget,
        proteinTarget,
        carbTarget,
        fatTarget,
      },
      update: {
        calorieTarget,
        proteinTarget,
        carbTarget,
        fatTarget,
      },
    });

    revalidatePath("/nutrition");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "Failed to update calorie and macro targets" };
  }
}
