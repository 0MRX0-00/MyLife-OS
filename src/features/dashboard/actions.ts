"use server";

import { requireAuth } from "@/lib/auth-utils";
import { rollRandomCheatDay, markCheatDayCompleted } from "@/services/analytics/streak-maintainer";
import { revalidatePath } from "next/cache";

export async function rollCheatDayAction() {
  const userId = await requireAuth();
  try {
    const newCheatDay = await rollRandomCheatDay(userId);
    revalidatePath("/dashboard");
    revalidatePath("/nutrition");
    revalidatePath("/analytics");
    return { success: true, cheatDay: newCheatDay };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to roll random Cheat Day";
    return { error: msg };
  }
}

export async function markCheatDayCompletedAction() {
  const userId = await requireAuth();
  try {
    await markCheatDayCompleted(userId);
    revalidatePath("/dashboard");
    revalidatePath("/nutrition");
    revalidatePath("/analytics");
    return { success: true };
  } catch {
    return { error: "Failed to mark Cheat Day as completed" };
  }
}
