"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Settings2, Flame, Save, Loader2 } from "lucide-react";
import { updateMacroTargetsAction } from "../actions";
import { toast } from "sonner";

interface MacroTargetEditorProps {
  currentCalorieTarget: number;
  currentProteinTarget: number;
  currentCarbTarget: number;
  currentFatTarget: number;
  triggerButton?: React.ReactNode;
}

export function MacroTargetEditor({
  currentCalorieTarget,
  currentProteinTarget,
  currentCarbTarget,
  currentFatTarget,
  triggerButton,
}: MacroTargetEditorProps) {
  const [open, setOpen] = useState(false);
  const [calories, setCalories] = useState(currentCalorieTarget || 2000);
  const [protein, setProtein] = useState(currentProteinTarget || 150);
  const [carbs, setCarbs] = useState(currentCarbTarget || 250);
  const [fat, setFat] = useState(currentFatTarget || 65);
  const [saving, setSaving] = useState(false);

  const handleCalorieChange = (val: number) => {
    setCalories(val);
    // Auto-recalculate macro ratios (30% protein, 40% carbs, 30% fat)
    setProtein(Math.round((val * 0.3) / 4));
    setCarbs(Math.round((val * 0.4) / 4));
    setFat(Math.round((val * 0.3) / 9));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateMacroTargetsAction({
        calorieTarget: calories,
        proteinTarget: protein,
        carbTarget: carbs,
        fatTarget: fat,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Updated daily target to ${calories} kcal!`);
        setOpen(false);
      }
    } catch {
      toast.error("Failed to save calorie target");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1.5 h-8 font-medium"
          onClick={() => setOpen(true)}
        >
          <Settings2 className="w-3.5 h-3.5 text-emerald-500" />
          Set Calorie Target
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Flame className="w-4 h-4" />
              </div>
              <span>Set Manual Calorie & Macro Target</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Daily Calorie Intake Target (kcal) *
              </Label>
              <Input
                type="number"
                min="500"
                max="10000"
                step="50"
                className="h-10 text-base font-bold text-emerald-500"
                value={calories}
                onChange={(e) => handleCalorieChange(parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Enter your exact custom target. Changing calories automatically recalculates recommended macro ratios below.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-foreground">Protein (g)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-medium"
                  value={protein}
                  onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-foreground">Carbs (g)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-medium"
                  value={carbs}
                  onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-foreground">Fat (g)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-medium"
                  value={fat}
                  onChange={(e) => setFat(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5"
                disabled={saving || !calories}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Custom Target
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
