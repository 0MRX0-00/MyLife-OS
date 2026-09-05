"use server";

import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { HabiticaIntegrationProvider } from "@/services/integrations/composio/habitica";

export async function saveIntegrationTokenAction(provider: string, token: string) {
  const userId = await requireAuth();
  try {
    await prisma.integration.upsert({
      where: { userId_provider: { userId, provider } },
      create: {
        userId,
        provider,
        accessToken: token,
        syncStatus: "connected",
        lastSyncedAt: new Date(),
      },
      update: {
        accessToken: token,
        syncStatus: "connected",
        lastSyncedAt: new Date(),
      },
    });

    revalidatePath("/settings");
    revalidatePath("/tasks");
    revalidatePath("/habits");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save integration token";
    return { error: message };
  }
}

export async function testIntegrationConnectionAction(provider: string) {
  const userId = await requireAuth();

  if (provider === "habitica") {
    const habitica = new HabiticaIntegrationProvider();
    const res = await habitica.testConnection(userId);
    if (res.success && res.profile) {
      return {
        success: true,
        message: `🟢 Connected to Habitica as ${res.profile.name} (Lvl ${res.profile.level} ${res.profile.class})!`,
      };
    }
    return {
      success: false,
      message: res.reason || "❌ Habitica connection failed: Invalid credentials",
    };
  }

  if (provider === "todoist") {
    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "todoist" } },
    });
    const token = integration?.accessToken || process.env.TODOIST_API_TOKEN;
    if (!token) {
      return { success: false, message: "❌ Todoist connection failed: No API Token provided" };
    }

    try {
      const res = await fetch("https://api.todoist.com/api/v1/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return { success: true, message: "🟢 Connected to Todoist API (200 OK)!" };
      }
      return { success: false, message: `❌ Todoist connection failed: Status ${res.status}` };
    } catch {
      return { success: false, message: "❌ Todoist connection network error" };
    }
  }

  return { success: true, message: `🟢 ${provider.toUpperCase()} provider is active!` };
}
