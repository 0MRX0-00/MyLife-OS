"use client";

import { cn } from "@/lib/utils";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
  className?: string;
}

export function MacroBar({
  label,
  current,
  target,
  unit = "g",
  color,
  className,
}: MacroBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const remaining = Math.max(target - current, 0);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {Math.round(current)}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {remaining > 0
          ? `${Math.round(remaining)}${unit} remaining`
          : "Target reached!"}
      </p>
    </div>
  );
}
