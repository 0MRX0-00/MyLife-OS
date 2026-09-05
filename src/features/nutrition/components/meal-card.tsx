"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Utensils } from "lucide-react";
import { FoodLogWithFood } from "@/types/nutrition";
import { deleteLogAction } from "../actions";
import { toast } from "sonner";

interface MealCardProps {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  title: string;
  logs: FoodLogWithFood[];
  onAddClick: (mealType: "breakfast" | "lunch" | "dinner" | "snack") => void;
}

export function MealCard({ mealType, title, logs, onAddClick }: MealCardProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const totalCalories = Math.round(logs.reduce((acc, l) => acc + l.calories, 0));
  const totalProtein = Math.round(logs.reduce((acc, l) => acc + l.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(logs.reduce((acc, l) => acc + l.carbohydrates, 0) * 10) / 10;
  const totalFat = Math.round(logs.reduce((acc, l) => acc + l.fat, 0) * 10) / 10;

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await deleteLogAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Item removed");
      }
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-500" />
          <CardTitle className="text-base font-semibold capitalize">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">
            {totalCalories} kcal · P:{totalProtein}g · C:{totalCarbs}g · F:{totalFat}g
          </span>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onAddClick(mealType)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-border">
        {logs.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No items logged for {title.toLowerCase()} yet.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <span className="text-sm font-medium block">{log.food.name}</span>
                <span className="text-xs text-muted-foreground block">
                  {log.quantity}x ({log.food.servingSize}{log.food.servingUnit}) · P:{log.protein}g C:{log.carbohydrates}g F:{log.fat}g
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">{Math.round(log.calories)} kcal</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  disabled={isDeleting === log.id}
                  onClick={() => handleDelete(log.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
