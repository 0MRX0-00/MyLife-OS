"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Apple,
  Dumbbell,
  TrendingUp,
  Target,
  CheckSquare,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  Activity,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Nutrition", href: "/nutrition", icon: Apple },
  { label: "Workout", href: "/workouts", icon: Dumbbell },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Habits", href: "/habits", icon: Target },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">LifeFit OS</h1>
          <p className="text-[11px] text-muted-foreground">
            Fitness & Productivity
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{user.name || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
