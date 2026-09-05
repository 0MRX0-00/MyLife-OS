"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Star } from "lucide-react";
import { searchFoodsAction } from "../actions";
import { Food } from "@prisma/client";

interface FoodSearchProps {
  onSelectFood: (food: Food) => void;
}

export function FoodSearch({ onSelectFood }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchFoodsAction(query);
        setFoods(results);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Search custom foods or favorites..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="max-h-60 overflow-y-auto divide-y divide-border border rounded-md">
        {loading ? (
          <div className="p-4 text-center text-xs text-muted-foreground">Searching...</div>
        ) : foods.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">No foods found. Create a custom food below.</div>
        ) : (
          foods.map((food) => (
            <div
              key={food.id}
              className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors cursor-pointer"
              onClick={() => onSelectFood(food)}
            >
              <div className="space-y-0.5">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  {food.name}
                  {food.isFavorite && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                </span>
                <span className="text-xs text-muted-foreground">
                  {food.servingSize}{food.servingUnit} · {food.calories} kcal (P:{food.protein}g C:{food.carbohydrates}g F:{food.fat}g)
                </span>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
