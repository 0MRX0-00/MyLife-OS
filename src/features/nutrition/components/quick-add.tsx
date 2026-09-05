"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { parseQuickEntryAction, confirmQuickAddEntriesAction } from "../actions";
import { FoodConfirmationDialog } from "./food-confirmation-dialog";
import { toast } from "sonner";
import { ParsedQuickEntryItem } from "@/types/nutrition";

interface QuickAddProps {
  date: string;
  defaultMealType?: "breakfast" | "lunch" | "dinner" | "snack";
  onSuccess?: () => void;
}

export function QuickAdd({ date, defaultMealType = "lunch", onSuccess }: QuickAddProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedQuickEntryItem[] | null>(null);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await parseQuickEntryAction(text);
      if (res.error) {
        toast.error(res.error);
      } else if (res.items) {
        setParsedItems(res.items);
      }
    } catch {
      toast.error("Failed to parse text entry");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (confirmedEntries: Array<{ name: string; calories: number; protein: number; carbohydrates: number; fat: number; quantity?: number }>) => {
    try {
      const formatted = confirmedEntries.map((item) => ({
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbohydrates: item.carbohydrates,
        fat: item.fat,
        mealType: defaultMealType,
        date,
        quantity: item.quantity || 1,
      }));

      const res = await confirmQuickAddEntriesAction(formatted);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Food logged successfully!");
        setText("");
        setParsedItems(null);
        if (onSuccess) onSuccess();
      }
    } catch {
      toast.error("Failed to save entries");
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Type meals like: 200g chicken breast + 150g rice + 2 eggs"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
        disabled={loading || !text.trim()}
        onClick={handleParse}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Parse & Preview Macros
      </Button>

      {parsedItems && (
        <FoodConfirmationDialog
          open={!!parsedItems}
          onOpenChange={(open) => !open && setParsedItems(null)}
          parsedItems={parsedItems}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
