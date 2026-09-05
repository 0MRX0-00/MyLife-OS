import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { WorkoutForm } from "@/features/workouts/components/workout-form";

export const metadata: Metadata = { title: "Log Workout — LifeFit OS" };

export default async function NewWorkoutPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log New Workout</h1>
        <p className="text-sm text-muted-foreground">Track sets, weights, reps, and automatic progressive overload PRs.</p>
      </div>

      <WorkoutForm />
    </div>
  );
}
