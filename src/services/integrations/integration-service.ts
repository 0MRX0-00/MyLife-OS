import { isComposioConfigured } from "./composio/client";
import prisma from "@/lib/prisma";

export async function getAllIntegrationsStatus(userId: string) {
  const isConfigured = isComposioConfigured();

  // 1. Todoist env token auto-upsert
  const envTodoistToken = process.env.TODOIST_API_TOKEN;
  if (envTodoistToken) {
    await prisma.integration.upsert({
      where: { userId_provider: { userId, provider: "todoist" } },
      create: {
        userId,
        provider: "todoist",
        accessToken: envTodoistToken,
        syncStatus: "connected",
        lastSyncedAt: new Date(),
      },
      update: {
        accessToken: envTodoistToken,
        syncStatus: "connected",
      },
    }).catch(() => {});
  }

  // 2. Habitica env token auto-upsert
  const envHabiticaToken = process.env.HABITICA_API_TOKEN;
  if (envHabiticaToken) {
    await prisma.integration.upsert({
      where: { userId_provider: { userId, provider: "habitica" } },
      create: {
        userId,
        provider: "habitica",
        accessToken: envHabiticaToken,
        syncStatus: "connected",
        lastSyncedAt: new Date(),
      },
      update: {
        accessToken: envHabiticaToken,
        syncStatus: "connected",
      },
    }).catch(() => {});
  }

  // 3. USDA Food API env token auto-upsert
  const envUsdaToken = process.env.USDA_API_KEY || process.env.USDA_FOOD_API_KEY;
  if (envUsdaToken) {
    await prisma.integration.upsert({
      where: { userId_provider: { userId, provider: "nutrition_api" } },
      create: {
        userId,
        provider: "nutrition_api",
        accessToken: envUsdaToken,
        syncStatus: "connected",
        lastSyncedAt: new Date(),
      },
      update: {
        accessToken: envUsdaToken,
        syncStatus: "connected",
      },
    }).catch(() => {});
  }

  // 4. WGER / Apify Exercise DB API env token auto-upsert
  const envExerciseToken = process.env.WGER_API_KEY || process.env.APIFY_API_KEY;
  if (envExerciseToken) {
    await prisma.integration.upsert({
      where: { userId_provider: { userId, provider: "exercise_api" } },
      create: {
        userId,
        provider: "exercise_api",
        accessToken: envExerciseToken,
        syncStatus: "connected",
        lastSyncedAt: new Date(),
      },
      update: {
        accessToken: envExerciseToken,
        syncStatus: "connected",
      },
    }).catch(() => {});
  }

  const userIntegrations = await prisma.integration.findMany({
    where: { userId },
  });

  const providers = [
    {
      id: "todoist",
      name: "Todoist",
      description: "Bi-directional task synchronization via Composio SDK",
      category: "Tasks & Productivity",
    },
    {
      id: "habitica",
      name: "Habitica",
      description: "Gamified habit completion & streak sync via Composio SDK",
      category: "Habits & Gamification",
    },
    {
      id: "nutrition_api",
      name: "USDA Food Database API",
      description: "Freeform text nutrition parsing and food lookup",
      category: "Nutrition",
    },
    {
      id: "exercise_api",
      name: "WGER Exercise DB API",
      description: "Exercise library cache and muscle group taxonomy",
      category: "Workouts",
    },
  ];

return providers.map((p) => {
     const found = userIntegrations.find((u: { provider: string }) => u.provider === p.id);
    const envToken =
      p.id === "todoist"
        ? envTodoistToken
        : p.id === "habitica"
        ? envHabiticaToken
        : p.id === "nutrition_api"
        ? envUsdaToken
        : p.id === "exercise_api"
        ? envExerciseToken
        : null;
    const token = found?.accessToken || envToken;
    const isConnected = !!token;

    return {
      ...p,
      isConfigured: isConfigured || isConnected,
      connected: isConnected,
      accessToken: token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : null,
      syncStatus: found?.syncStatus || (isConnected ? "connected" : "idle"),
      lastSyncedAt: found?.lastSyncedAt || null,
      syncError: found?.syncError || null,
    };
  });
}
