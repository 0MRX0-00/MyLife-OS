import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { getUserTasks } from "@/services/tasks/task-service";
import { TasksContent } from "@/features/tasks/components/tasks-content";

export const metadata: Metadata = { title: "Tasks — LifeFit OS" };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: "inbox" | "today" | "upcoming" | "completed" }>;
}) {
  const userId = await requireAuth();
  const params = await searchParams;
  const filter = params.filter || "today";

  const tasks = await getUserTasks(userId, filter);

  return <TasksContent tasks={tasks} activeFilter={filter} />;
}
