"use server";

import { requireAuth } from "@/lib/auth-utils";
import { createHabit, toggleHabitLog, deleteHabit } from "@/services/habits/habit-service";
import { habitSchema as createHabitSchema } from "@/utils/validation";
import { revalidatePath } from "next/cache";

import { HabiticaIntegrationProvider } from "@/services/integrations/composio/habitica";

export async function createHabitAction(formData: FormData) {
  const userId = await requireAuth();
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    frequency: (formData.get("frequency") as "daily" | "weekly") || "daily",
    target: parseInt(formData.get("target") as string) || 1,
    color: (formData.get("color") as string) || "#10b981",
    icon: (formData.get("icon") as string) || "target",
  };

  const parsed = createHabitSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid habit input" };
  }

  try {
    const habit = await createHabit(userId, parsed.data);
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return { success: true, habit };
  } catch {
    return { error: "Failed to create habit" };
  }
}

export async function toggleHabitAction(habitId: string, dateStr: string) {
  const userId = await requireAuth();
  try {
    const log = await toggleHabitLog(userId, habitId, dateStr);
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return { success: true, log };
  } catch {
    return { error: "Failed to toggle habit" };
  }
}

export async function deleteHabitAction(habitId: string) {
  const userId = await requireAuth();
  try {
    await deleteHabit(userId, habitId);
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to delete habit" };
  }
}

export async function syncHabiticaAction() {
  const userId = await requireAuth();
  try {
    const provider = new HabiticaIntegrationProvider();
    const res = await provider.syncHabitsFromHabitica(userId);
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return res;
  } catch {
    return { success: false, reason: "Failed to sync Habitica habits" };
  }
}
