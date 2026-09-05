"use server";

import { auth } from "@/lib/auth";
import { getCalendarMonthData } from "@/services/calendar/calendar-service";
import { createTask, toggleTaskStatus } from "@/services/tasks/task-service";
import { revalidatePath } from "next/cache";

export async function getCalendarEventsAction(year: number, month: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const data = await getCalendarMonthData(session.user.id, year, month);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load calendar data";
    return { success: false, error: message };
  }
}

export async function createCalendarTaskAction(input: {
  title: string;
  dueDate: string; // YYYY-MM-DD
  priority?: string;
  category?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const priorityVal = (input.priority as "normal" | "high" | "urgent") || "normal";

    const task = await createTask(session.user.id, {
      title: input.title,
      dueDate: input.dueDate,
      priority: priorityVal,
      category: input.category || "General",
    });

    revalidatePath("/calendar");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");

    return { success: true, task };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create task";
    return { success: false, error: message };
  }
}

export async function toggleCalendarTaskAction(taskId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await toggleTaskStatus(session.user.id, taskId);

    revalidatePath("/calendar");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");

    return { success: true, task: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle task";
    return { success: false, error: message };
  }
}
