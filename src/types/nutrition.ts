export interface FoodItem {
  id: string;
  userId: string;
  name: string;
  brand?: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  isFavorite?: boolean;
  createdAt?: Date;
}

export interface FoodLogWithFood {
  id: string;
  userId: string;
  foodId: string;
  date: Date | string;
  mealType: string;
  quantity: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  notes?: string | null;
  createdAt?: Date;
  food: FoodItem;
}

export type FoodLogItem = FoodLogWithFood;

export interface MacroTotals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface DailyMacroProgress {
  consumed: MacroTotals;
  targets: MacroTotals;
  remaining: MacroTotals;
  percentages: MacroTotals;
}

export interface CreateFoodInput {
  name: string;
  brand?: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  isFavorite?: boolean;
}

export interface CreateFoodLogInput {
  foodId: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  quantity: number;
  notes?: string | null;
}

export interface ParsedQuickEntryItem {
  rawText: string;
  name: string;
  quantity: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  confidence: number;
}
