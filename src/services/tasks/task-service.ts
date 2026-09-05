import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateTodoInput } from "@/types/task";

export async function getUserTasks(userId: string, filter: "inbox" | "today" | "upcoming" | "completed" = "today") {
  // Auto-sync tasks from mobile Todoist API
  await syncFromTodoistAPI(userId).catch(() => {});

  const endOfToday = new Date();
  endOfToday.setUTCHours(23, 59, 59, 999);

  const where: Prisma.TodoWhereInput = { userId };

  if (filter === "completed") {
    where.status = "done";
  } else {
    where.status = { in: ["todo", "in_progress"] };
    if (filter === "today") {
      where.OR = [
        { dueDate: { lte: endOfToday } },
        { dueDate: null },
      ];
    } else if (filter === "upcoming") {
      where.dueDate = { gt: endOfToday };
    }
  }

  return prisma.todo.findMany({
    where,
    orderBy: [
      { priority: "desc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function createTask(userId: string, input: CreateTodoInput) {
  const dueDateObj = input.dueDate ? new Date(input.dueDate) : null;
  if (dueDateObj) dueDateObj.setUTCHours(0, 0, 0, 0);

  // 1. Save task locally
  const task = await prisma.todo.create({
    data: {
      userId,
      title: input.title,
      description: input.description || null,
      dueDate: dueDateObj,
      priority: input.priority || "normal",
      status: "todo",
      category: input.category || null,
      recurringPattern: input.recurringPattern || null,
    },
  });

  // 2. Sync to Todoist via REST API v1
  try {
    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "todoist" } },
    });
    const token = integration?.accessToken || process.env.TODOIST_API_TOKEN;

    if (token) {
      const res = await fetch("https://api.todoist.com/api/v1/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input.title,
          description: input.description || undefined,
          due_date: input.dueDate || undefined,
        }),
      });

      if (res.ok) {
        const body = await res.json();
        if (body.id) {
          await prisma.todo.update({
            where: { id: task.id },
            data: { externalId: String(body.id), externalProvider: "todoist" },
          });
        }
      }
    }
  } catch (err) {
    console.warn("Todoist push sync warning:", err);
  }

  return task;
}

export async function toggleTaskStatus(userId: string, taskId: string) {
  const task = await prisma.todo.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const nextStatus = task.status === "done" ? "todo" : "done";
  const completedAt = nextStatus === "done" ? new Date() : null;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Sync to mobile Todoist API if externalId exists
  if (task.externalId && task.externalProvider === "todoist") {
    try {
      const integration = await prisma.integration.findUnique({
        where: { userId_provider: { userId, provider: "todoist" } },
      });
      const token = integration?.accessToken || process.env.TODOIST_API_TOKEN;

      if (token) {
        const endpoint = nextStatus === "done"
          ? `https://api.todoist.com/api/v1/tasks/${task.externalId}/close`
          : `https://api.todoist.com/api/v1/tasks/${task.externalId}/reopen`;
        await fetch(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Todoist toggle status sync warning:", err);
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.todo.update({
      where: { id: taskId },
      data: {
        status: nextStatus,
        completedAt,
      },
    });

    const completedToday = await tx.todo.count({
      where: { userId, status: "done", completedAt: { gte: today } },
    });

    const totalToday = await tx.todo.count({
      where: { userId, OR: [{ dueDate: { lte: today } }, { dueDate: null }] },
    });

    await tx.dailySummary.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        tasksCompleted: completedToday,
        tasksTotal: totalToday,
      },
      update: {
        tasksCompleted: completedToday,
        tasksTotal: totalToday,
      },
    });

    return updated;
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await prisma.todo.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Delete from mobile Todoist API if externalId exists
  if (task.externalId && task.externalProvider === "todoist") {
    try {
      const integration = await prisma.integration.findUnique({
        where: { userId_provider: { userId, provider: "todoist" } },
      });
      const token = integration?.accessToken || process.env.TODOIST_API_TOKEN;

      if (token) {
        await fetch(`https://api.todoist.com/api/v1/tasks/${task.externalId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Todoist delete task API warning:", err);
    }
  }

  return prisma.todo.delete({
    where: { id: taskId },
  });
}

export async function syncFromTodoistAPI(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "todoist" } },
  });

  const token = integration?.accessToken || process.env.TODOIST_API_TOKEN;
  if (!token) {
    return { success: false, reason: "No Todoist API key found" };
  }

  try {
    const res = await fetch("https://api.todoist.com/api/v1/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return { success: false, reason: `Todoist API returned status ${res.status}` };
    }

    const body = await res.json();
    const todoistTasks: Record<string, unknown>[] = Array.isArray(body) ? body : (body.results || []);

    const activeExternalIds: string[] = [];
    let syncedCount = 0;
    for (const t of todoistTasks) {
      const extId = String(t.id);
      activeExternalIds.push(extId);

      const existing = await prisma.todo.findFirst({
        where: { userId, externalId: extId },
      });

      const isCompleted = t.checked === true || t.is_completed === true;
      const priorityStr = t.priority === 4 ? "urgent" : t.priority === 3 ? "high" : "normal";

      if (!existing) {
        await prisma.todo.create({
          data: {
            userId,
            title: (t.content as string) || (t.title as string) || "Mobile Todoist Task",
            description: (t.description as string) || null,
            status: isCompleted ? "done" : "todo",
            priority: priorityStr,
            externalId: extId,
            externalProvider: "todoist",
            dueDate: (t.due as { date?: string })?.date ? new Date((t.due as { date: string }).date) : new Date(),
          },
        });
        syncedCount++;
      } else {
        // Update existing if status changed on mobile
        await prisma.todo.update({
          where: { id: existing.id },
          data: {
            title: (t.content as string) || existing.title,
            description: (t.description as string) || existing.description,
            status: isCompleted ? "done" : "todo",
          },
        });
      }
    }

    // Clean up local Todoist-synced tasks that were deleted on mobile
    if (activeExternalIds.length > 0) {
      await prisma.todo.deleteMany({
        where: {
          userId,
          externalProvider: "todoist",
          externalId: {
            notIn: activeExternalIds,
          },
        },
      });
    }

    if (integration) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { lastSyncedAt: new Date(), syncStatus: "connected" },
      });
    }

    return { success: true, syncedCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync error";
    return { success: false, reason: message };
  }
}
