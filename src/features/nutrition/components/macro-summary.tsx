"use client";

import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { DailyMacroProgress } from "@/types/nutrition";
import { Flame, Dumbbell, Wheat, Droplets, Settings2 } from "lucide-react";
import { MacroTargetEditor } from "./macro-target-editor";

interface MacroSummaryProps {
  progress: DailyMacroProgress;
}

export function MacroSummary({ progress }: MacroSummaryProps) {
  const { consumed, targets, remaining, percentages } = progress;

  const macros = [
    {
      name: "Protein",
      consumed: consumed.protein,
      target: targets.protein,
      unit: "g",
      color: "emerald" as const,
      icon: Dumbbell,
      percentage: percentages.protein,
    },
    {
      name: "Carbs",
      consumed: consumed.carbohydrates,
      target: targets.carbohydrates,
      unit: "g",
      color: "blue" as const,
      icon: Wheat,
      percentage: percentages.carbohydrates,
    },
    {
      name: "Fat",
      consumed: consumed.fat,
      target: targets.fat,
      unit: "g",
      color: "amber" as const,
      icon: Droplets,
      percentage: percentages.fat,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Calories Overview Card */}
      <Card className="md:col-span-1 flex flex-col justify-between p-4 relative group">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-emerald-500" /> Calories
          </span>
          <MacroTargetEditor
            currentCalorieTarget={targets.calories}
            currentProteinTarget={targets.protein}
            currentCarbTarget={targets.carbohydrates}
            currentFatTarget={targets.fat}
            triggerButton={
              <button
                type="button"
                className="text-[11px] text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                title="Manually set calorie target"
              >
                <Settings2 className="w-3 h-3" /> Edit Target
              </button>
            }
          />
        </div>
        <div className="flex items-center justify-center my-3">
          <ProgressRing
            value={percentages.calories}
            size={110}
            strokeWidth={10}
            color="emerald"
          >
            <div className="text-center">
              <span className="text-2xl font-bold">{consumed.calories}</span>
              <span className="text-xs block text-muted-foreground">/ {targets.calories} kcal</span>
            </div>
          </ProgressRing>
        </div>
        <div className="text-center pt-1 text-[11px] text-muted-foreground">
          <span>{remaining.calories} kcal remaining</span>
        </div>
      </Card>

      {/* Macro Cards */}
      <div className="md:col-span-3 grid grid-cols-3 gap-3">
        {macros.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.name} className="p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5 text-primary" /> {m.name}
                </span>
                <span className="text-xs font-semibold">{m.percentage}%</span>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold">
                  {m.consumed}
                  <span className="text-xs font-normal text-muted-foreground"> / {m.target}{m.unit}</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      m.color === "emerald"
                        ? "bg-emerald-500"
                        : m.color === "blue"
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, m.percentage)}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
