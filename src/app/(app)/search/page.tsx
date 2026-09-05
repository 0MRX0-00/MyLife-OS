import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage() {
  await requireAuth();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">
          Find foods, exercises, workouts, habits, and tasks
        </p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search everything..."
          className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    </div>
  );
}
