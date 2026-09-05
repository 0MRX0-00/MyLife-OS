export interface IntegrationConnectionResult {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

export interface IntegrationProviderStatus {
  provider: "todoist" | "habitica" | "nutrition_api" | "exercise_api";
  connected: boolean;
  lastSyncedAt?: Date | null;
  syncStatus: "idle" | "syncing" | "error" | "disconnected";
  syncError?: string | null;
}

export interface IntegrationProvider {
  connect(userId: string): Promise<IntegrationConnectionResult>;
  disconnect(userId: string): Promise<void>;
  testConnection(userId: string): Promise<boolean>;
  getStatus(userId: string): Promise<IntegrationProviderStatus>;
}
