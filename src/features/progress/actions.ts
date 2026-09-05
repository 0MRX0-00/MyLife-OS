"use server";

import { requireAuth } from "@/lib/auth-utils";
import { upsertBodyMetric, deleteBodyMetric } from "@/services/progress/body-metric-service";
import { bodyMetricSchema as createBodyMetricSchema } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function logBodyMetricAction(input: {
  date: string;
  weight?: number;
  bodyFat?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
}) {
  const userId = await requireAuth();
  const parsed = createBodyMetricSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid metric data" };
  }

  try {
    const metric = await upsertBodyMetric(userId, parsed.data);
    revalidatePath("/progress");
    revalidatePath("/dashboard");
    return { success: true, metric };
  } catch {
    return { error: "Failed to log body metric" };
  }
}

export async function deleteBodyMetricAction(id: string) {
  const userId = await requireAuth();
  try {
    await deleteBodyMetric(userId, id);
    revalidatePath("/progress");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to delete metric entry" };
  }
}
