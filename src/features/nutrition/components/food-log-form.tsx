"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FoodSearch } from "./food-search";
import { QuickAdd } from "./quick-add";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createFoodAction, logFoodAction } from "../actions";
import { Food } from "@prisma/client";
import { toast } from "sonner";

interface FoodLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  defaultMealType: "breakfast" | "lunch" | "dinner" | "snack";
}

export function FoodLogForm({ open, onOpenChange, date, defaultMealType }: FoodLogFormProps) {
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(defaultMealType);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Custom food form state
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [servingSize, setServingSize] = useState(100);
  const [servingUnit, setServingUnit] = useState("g");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);

  const handleLogSelected = async () => {
    if (!selectedFood) return;
    setLoading(true);
    try {
      const res = await logFoodAction({
        foodId: selectedFood.id,
        date,
        mealType,
        quantity,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Logged ${selectedFood.name}`);
        onOpenChange(false);
        setSelectedFood(null);
      }
    } catch {
      toast.error("Failed to log food");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndLogCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("brand", brand);
      formData.set("servingSize", servingSize.toString());
      formData.set("servingUnit", servingUnit);
      formData.set("calories", calories.toString());
      formData.set("protein", protein.toString());
      formData.set("carbohydrates", carbs.toString());
      formData.set("fat", fat.toString());

      const createRes = await createFoodAction(formData);
      if (createRes.error || !createRes.food) {
        toast.error(createRes.error || "Failed to create food");
        return;
      }

      const logRes = await logFoodAction({
        foodId: createRes.food.id,
        date,
        mealType,
        quantity,
      });

      if (logRes.error) {
        toast.error(logRes.error);
      } else {
        toast.success(`Created & logged ${name}`);
        onOpenChange(false);
      }
    } catch {
      toast.error("Error creating food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between pr-6">
          <DialogTitle>Log Food ({date})</DialogTitle>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as "breakfast" | "lunch" | "dinner" | "snack")}
            className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-3">
            <TabsTrigger value="search">Search DB</TabsTrigger>
            <TabsTrigger value="quick">Quick Add</TabsTrigger>
            <TabsTrigger value="custom">Custom Item</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {selectedFood ? (
              <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{selectedFood.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFood(null)}>
                    Change
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Quantity ({selectedFood.servingSize}{selectedFood.servingUnit} units)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex flex-col justify-end text-right">
                    <span className="text-sm font-bold">{Math.round(selectedFood.calories * quantity)} kcal</span>
                    <span className="text-xs text-muted-foreground">
                      P:{Math.round(selectedFood.protein * quantity)}g C:{Math.round(selectedFood.carbohydrates * quantity)}g F:{Math.round(selectedFood.fat * quantity)}g
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loading}
                  onClick={handleLogSelected}
                >
                  Log Entry
                </Button>
              </div>
            ) : (
              <FoodSearch onSelectFood={setSelectedFood} />
            )}
          </TabsContent>

          <TabsContent value="quick">
            <QuickAdd date={date} defaultMealType={mealType} onSuccess={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="custom">
            <form onSubmit={handleCreateAndLogCustomFood} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Food Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>Brand (Optional)</Label>
                  <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Kirkland" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Serving Size</Label>
                  <Input type="number" value={servingSize} onChange={(e) => setServingSize(parseFloat(e.target.value) || 100)} required />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={servingUnit} onChange={(e) => setServingUnit(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label>Calories</Label>
                  <Input type="number" value={calories} onChange={(e) => setCalories(parseFloat(e.target.value) || 0)} required />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input type="number" value={protein} onChange={(e) => setProtein(parseFloat(e.target.value) || 0)} required />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input type="number" value={carbs} onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)} required />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input type="number" value={fat} onChange={(e) => setFat(parseFloat(e.target.value) || 0)} required />
                </div>
              </div>
              <Button type="submit" disabled={loading || !name} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2">
                Save & Log Food
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
