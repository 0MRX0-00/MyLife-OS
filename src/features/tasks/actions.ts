"use server";

import { requireAuth } from "@/lib/auth-utils";
import { createTask, toggleTaskStatus, deleteTask, syncFromTodoistAPI } from "@/services/tasks/task-service";
import { todoSchema as createTodoSchema } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function createTaskAction(formData: FormData) {
  const userId = await requireAuth();
  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    priority: (formData.get("priority") as "low" | "normal" | "high" | "urgent") || "normal",
    category: (formData.get("category") as string) || undefined,
    recurringPattern: (formData.get("recurringPattern") as string) || undefined,
  };

  const parsed = createTodoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid task input" };
  }

  try {
    const task = await createTask(userId, parsed.data);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch {
    return { error: "Failed to create task" };
  }
}

export async function toggleTaskAction(taskId: string) {
  const userId = await requireAuth();
  try {
    const task = await toggleTaskStatus(userId, taskId);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch {
    return { error: "Failed to toggle task" };
  }
}

export async function deleteTaskAction(taskId: string) {
  const userId = await requireAuth();
  try {
    await deleteTask(userId, taskId);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    return { success: true };
  } catch {
    return { error: "Failed to delete task" };
  }
}

export async function syncTodoistTasksAction() {
  const userId = await requireAuth();
  try {
    const res = await syncFromTodoistAPI(userId);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return res;
  } catch {
    return { success: false, reason: "Failed to sync Todoist tasks" };
  }
}
