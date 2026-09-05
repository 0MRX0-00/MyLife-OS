"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Apple,
  Dumbbell,
  Target,
  CheckSquare,
  Calendar,
} from "lucide-react";

const bottomNavItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Nutrition", href: "/nutrition", icon: Apple },
  { label: "Workout", href: "/workouts", icon: Dumbbell },
  { label: "Habits", href: "/habits", icon: Target },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/calendar", icon: Calendar },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg lg:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-safe">
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
