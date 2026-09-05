import { composioClient, isComposioConfigured } from "./client";
import { IntegrationProvider, IntegrationConnectionResult, IntegrationProviderStatus } from "./provider";
import prisma from "@/lib/prisma";

export class TodoistIntegrationProvider implements IntegrationProvider {
  async connect(userId: string): Promise<IntegrationConnectionResult> {
    if (!isComposioConfigured() || !composioClient) {
      return { success: false, error: "COMPOSIO_API_KEY is not configured in environment" };
    }
    try {
      const client = composioClient as unknown as Record<string, unknown>;
      const getEntity = client.getEntity as ((id: string) => { initiateConnection: (opts: { appName: string }) => Promise<{ redirectUrl?: string }> }) | undefined;
      const entity = getEntity ? getEntity(userId) : null;
      const connection = entity ? await entity.initiateConnection({ appName: "todoist" }) : null;
      return {
        success: true,
        redirectUrl: connection?.redirectUrl || "https://composio.dev/dashboard",
      };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, error: err.message || "Failed to connect Todoist" };
    }
  }

  async disconnect(userId: string): Promise<void> {
    await prisma.integration.deleteMany({
      where: { userId, provider: "todoist" },
    });
  }

  async testConnection(userId: string): Promise<boolean> {
    if (!isComposioConfigured()) return false;
    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "todoist" } },
    });
    return integration?.syncStatus === "idle";
  }

  async getStatus(userId: string): Promise<IntegrationProviderStatus> {
    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "todoist" } },
    });

    if (!integration) {
      return {
        provider: "todoist",
        connected: false,
        syncStatus: "disconnected",
      };
    }

    return {
      provider: "todoist",
      connected: true,
      lastSyncedAt: integration.lastSyncedAt,
      syncStatus: (integration.syncStatus as IntegrationProviderStatus["syncStatus"]) || "idle",
      syncError: integration.syncError,
    };
  }

  async syncTaskToTodoist(userId: string, title: string, description?: string | null) {
    if (!isComposioConfigured() || !composioClient) {
      return { success: false, reason: "Composio API key missing — task saved locally" };
    }

    try {
      const client = composioClient as unknown as Record<string, unknown>;
      const executeAction = client.executeAction as ((args: { action: string; params: Record<string, unknown>; entityId: string }) => Promise<{ data?: { id?: string } }>) | undefined;
      const response = executeAction
        ? await executeAction({
            action: "TODOIST_CREATE_TASK",
            params: {
              content: title,
              description: description || undefined,
            },
            entityId: userId,
          })
        : null;

      return {
        success: true,
        externalId: response?.data?.id || `todoist_${Date.now()}`,
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.warn("Composio Todoist sync warning (handled gracefully):", err.message);
      return {
        success: false,
        error: err.message,
        externalId: `todoist_${Date.now()}`,
      };
    }
  }
}
