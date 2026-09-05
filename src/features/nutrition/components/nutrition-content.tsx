"use client";

import { useState } from "react";
import { MacroSummary } from "./macro-summary";
import { MealCard } from "./meal-card";
import { FoodLogForm } from "./food-log-form";
import { NutritionChart } from "./nutrition-chart";
import { DailyMacroProgress, FoodLogWithFood } from "@/types/nutrition";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { useRouter } from "next/navigation";

interface NutritionContentProps {
  dateStr: string;
  progress: DailyMacroProgress;
  logs: FoodLogWithFood[];
  history: {
    date: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }[];
}

export function NutritionContent({ dateStr, progress, logs, history }: NutritionContentProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");

  const currentDate = new Date(dateStr);

  const handlePrevDay = () => {
    const prev = format(subDays(currentDate, 1), "yyyy-MM-dd");
    router.push(`/nutrition?date=${prev}`);
  };

  const handleNextDay = () => {
    const next = format(addDays(currentDate, 1), "yyyy-MM-dd");
    router.push(`/nutrition?date=${next}`);
  };

  const handleAddClick = (meal: "breakfast" | "lunch" | "dinner" | "snack") => {
    setSelectedMeal(meal);
    setModalOpen(true);
  };

  const breakfastLogs = logs.filter((l) => l.mealType === "breakfast");
  const lunchLogs = logs.filter((l) => l.mealType === "lunch");
  const dinnerLogs = logs.filter((l) => l.mealType === "dinner");
  const snackLogs = logs.filter((l) => l.mealType === "snack");

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nutrition & Macro Tracker</h1>
          <p className="text-sm text-muted-foreground">Track daily intake, macros, and server-recalculated energy balance.</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-sm font-medium">
            <CalendarIcon className="w-4 h-4 text-emerald-500" />
            {format(currentDate, "EEEE, MMM d, yyyy")}
          </div>
          <Button variant="outline" size="sm" onClick={handleNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Macro Summary Header Cards */}
      <MacroSummary progress={progress} />

      {/* Meals Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <MealCard mealType="breakfast" title="Breakfast" logs={breakfastLogs} onAddClick={handleAddClick} />
        <MealCard mealType="lunch" title="Lunch" logs={lunchLogs} onAddClick={handleAddClick} />
        <MealCard mealType="dinner" title="Dinner" logs={dinnerLogs} onAddClick={handleAddClick} />
        <MealCard mealType="snack" title="Snacks & Drinks" logs={snackLogs} onAddClick={handleAddClick} />
      </div>

      {/* Weekly History Chart */}
      <NutritionChart data={history} />

      {/* Add Food Modal */}
      {modalOpen && (
        <FoodLogForm
          open={modalOpen}
          onOpenChange={setModalOpen}
          date={dateStr}
          defaultMealType={selectedMeal}
        />
      )}
    </div>
  );
}
