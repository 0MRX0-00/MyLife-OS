"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Search, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg lg:px-8">
      {/* Mobile Logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <h1 className="text-base font-bold tracking-tight">LifeFit OS</h1>
      </div>

      {/* Greeting - desktop */}
      <div className="hidden lg:block">
        <p className="text-sm text-muted-foreground">
          Welcome back,{" "}
          <span className="font-medium text-foreground">
            {user.name || "there"}
          </span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => router.push("/search")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Search"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Toggle theme"
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </div>
    </header>
  );
}
