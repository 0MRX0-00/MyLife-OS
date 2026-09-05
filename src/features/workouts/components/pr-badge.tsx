"use client";

import { Trophy } from "lucide-react";

interface PRBadgeProps {
  type: "weight" | "reps" | "volume" | "one_rm";
  value: number;
  exerciseName: string;
}

export function PRBadge({ type, value, exerciseName }: PRBadgeProps) {
  const typeLabels = {
    weight: `New Max Weight: ${value} kg`,
    reps: `New Max Reps: ${value}`,
    volume: `New Volume Record: ${value} kg`,
    one_rm: `New Est. 1RM: ${value} kg`,
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold animate-pulse">
      <Trophy className="w-4 h-4 text-amber-400" />
      <span>
        <strong>{exerciseName}</strong> — {typeLabels[type]}! 🎉
      </span>
    </div>
  );
}
