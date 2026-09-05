"use client";

import { useState } from "react";
import { StatCard } from "@/components/shared/stat-card";
import { WeightChart } from "./weight-chart";
import { BodyMetricForm } from "./body-metric-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { WeightTrendSummary } from "@/services/progress/trend-calculator";
import { BodyMetric } from "@/types/progress";
import { format } from "date-fns";
import { deleteBodyMetricAction } from "../actions";
import { toast } from "sonner";

interface ProgressContentProps {
  trends: WeightTrendSummary;
  metrics: BodyMetric[];
  chartData: { date: string; weight: number }[];
  goalWeight: number | null;
}

export function ProgressContent({ trends, metrics, chartData, goalWeight }: ProgressContentProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deleteBodyMetricAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Metric entry removed");
      }
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Body Metrics & Progress</h1>
          <p className="text-sm text-muted-foreground">Track weight, body fat %, and tape measurements with 7-day moving averages.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" /> Log Body Metric
        </Button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Weight"
          value={trends.latestWeight ? `${trends.latestWeight} kg` : "No data"}
          change={trends.diffFromGoal ? `${trends.diffFromGoal > 0 ? "+" : ""}${trends.diffFromGoal} kg to goal` : undefined}
          changeType={trends.diffFromGoal && trends.diffFromGoal <= 0 ? "positive" : "neutral"}
          iconName="scale"
        />
        <StatCard
          title="7-Day Moving Avg"
          value={trends.movingAvg7Day ? `${trends.movingAvg7Day} kg` : "No data"}
          description="Smoothed trend line"
          iconName="trending"
        />
        <StatCard
          title="30-Day Change"
          value={trends.change30Day !== null ? `${trends.change30Day > 0 ? "+" : ""}${trends.change30Day} kg` : "No data"}
          changeType={trends.change30Day && trends.change30Day < 0 ? "positive" : "neutral"}
          iconName="scale"
        />
        <StatCard
          title="Target Goal"
          value={goalWeight ? `${goalWeight} kg` : "Not set"}
          description="Set in Settings"
          iconName="trending"
        />
      </div>

      {/* Weight Chart */}
      <WeightChart data={chartData} goalWeight={goalWeight} />

      {/* History Table */}
      <div className="border rounded-xl p-4 bg-card space-y-3">
        <h3 className="text-sm font-bold">Measurement History</h3>
        {metrics.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No measurements recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {metrics.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                <div>
                  <span className="font-semibold text-sm block">
                    {format(new Date(item.date), "MMM d, yyyy")}
                  </span>
                  <span className="text-muted-foreground">
                    {item.weight} kg {item.bodyFat ? `· ${item.bodyFat}% Body Fat` : ""}
                    {item.waist ? ` · Waist: ${item.waist}cm` : ""}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BodyMetricForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

export default ProgressContent;
