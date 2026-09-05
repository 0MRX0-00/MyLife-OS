"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface ParsedItem {
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

interface FoodConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsedItems: ParsedItem[];
  onConfirm: (items: ParsedItem[]) => void;
}

export function FoodConfirmationDialog({
  open,
  onOpenChange,
  parsedItems,
  onConfirm,
}: FoodConfirmationDialogProps) {
  const [items, setItems] = useState<ParsedItem[]>(parsedItems);

  const updateItem = <K extends keyof ParsedItem>(index: number, field: K, value: ParsedItem[K]) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Confirm Parsed Nutrition Data</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No items remaining.</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="p-3 border rounded-lg bg-muted/20 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    className="font-medium text-sm h-8"
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Calories</Label>
                    <Input
                      type="number"
                      className="h-7 text-xs"
                      value={item.calories}
                      onChange={(e) => updateItem(idx, "calories", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Protein (g)</Label>
                    <Input
                      type="number"
                      className="h-7 text-xs"
                      value={item.protein}
                      onChange={(e) => updateItem(idx, "protein", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Carbs (g)</Label>
                    <Input
                      type="number"
                      className="h-7 text-xs"
                      value={item.carbohydrates}
                      onChange={(e) => updateItem(idx, "carbohydrates", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Fat (g)</Label>
                    <Input
                      type="number"
                      className="h-7 text-xs"
                      value={item.fat}
                      onChange={(e) => updateItem(idx, "fat", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={items.length === 0}
            onClick={() => onConfirm(items)}
          >
            Save All Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
