"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Flame, Dumbbell, TrendingUp, Scale, Target, CheckSquare, Activity } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  iconName?: "flame" | "dumbbell" | "trending" | "scale" | "target" | "check";
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

function renderIconByName(name?: string) {
  const iconProps = { className: "w-5 h-5 text-muted-foreground" };
  switch (name) {
    case "flame": return <Flame {...iconProps} />;
    case "dumbbell": return <Dumbbell {...iconProps} />;
    case "trending": return <TrendingUp {...iconProps} />;
    case "scale": return <Scale {...iconProps} />;
    case "target": return <Target {...iconProps} />;
    case "check": return <CheckSquare {...iconProps} />;
    default: return <Activity {...iconProps} />;
  }
}

function renderCustomIcon(Icon: unknown) {
  if (!Icon) return null;
  if (React.isValidElement(Icon)) return Icon;
  if (typeof Icon === "function" || (typeof Icon === "object" && Icon !== null)) {
    const CustomComponent = Icon as React.ComponentType<{ className?: string }>;
    return <CustomComponent className="w-5 h-5 text-muted-foreground" />;
  }
  return null;
}

export function StatCard({
  title,
  value,
  subtitle,
  description,
  change,
  changeType,
  icon: Icon,
  iconName,
  trend,
  color,
  className,
  children,
}: StatCardProps) {
  const hasIcon = iconName || Icon;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p
            className="text-2xl font-bold tracking-tight"
            style={color ? { color } : undefined}
          >
            {value}
          </p>
          {(subtitle || description) && (
            <p className="text-xs text-muted-foreground">{subtitle || description}</p>
          )}
          {change && (
            <p
              className={cn(
                "text-xs font-medium",
                changeType === "positive" ? "text-emerald-500" : changeType === "negative" ? "text-rose-500" : "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        {hasIcon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
            {iconName ? renderIconByName(iconName) : renderCustomIcon(Icon)}
          </div>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
