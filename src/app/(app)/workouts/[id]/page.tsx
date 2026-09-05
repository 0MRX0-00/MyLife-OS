import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";

export const metadata: Metadata = { title: "Workout Detail" };

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Workout Detail</h1>
      <p className="text-sm text-muted-foreground">Workout ID: {id}</p>
    </div>
  );
}
