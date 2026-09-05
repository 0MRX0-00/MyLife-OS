"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

interface WeightChartProps {
  data: {
    date: string;
    weight: number;
  }[];
  goalWeight?: number | null;
}

export function WeightChart({ data, goalWeight }: WeightChartProps) {
  if (!data || data.length === 0) return null;

  const weights = data.map((d) => d.weight);
  const minW = Math.floor(Math.min(...weights) - 2);
  const maxW = Math.ceil(Math.max(...weights) + 2);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Body Weight Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis domain={[minW, maxW]} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            {goalWeight && (
              <ReferenceLine y={goalWeight} label={{ value: `Goal: ${goalWeight}kg`, fill: "#10b981", fontSize: 10 }} stroke="#10b981" strokeDasharray="3 3" />
            )}
            <Line
              type="monotone"
              dataKey="weight"
              name="Weight (kg)"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
