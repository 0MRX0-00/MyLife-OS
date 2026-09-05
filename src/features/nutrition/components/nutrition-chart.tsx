"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface NutritionChartProps {
  data: {
    date: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }[];
}

export function NutritionChart({ data }: NutritionChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Macro History (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Bar dataKey="protein" name="Protein (g)" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="carbohydrates" name="Carbs (g)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fat" name="Fat (g)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
