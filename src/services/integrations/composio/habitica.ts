import prisma from "@/lib/prisma";

export class HabiticaIntegrationProvider {
  async getCredentials(userId: string) {
    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "habitica" } },
    });

    const token = integration?.accessToken || process.env.HABITICA_API_TOKEN;
    if (!token) return null;

    // Token format can be "USER_ID:API_KEY" or single token
    const parts = token.split(":");
    if (parts.length >= 2) {
      return { apiUser: parts[0].trim(), apiKey: parts[1].trim() };
    }
    return { apiUser: token.trim(), apiKey: token.trim() };
  }

  async testConnection(userId: string) {
    const creds = await this.getCredentials(userId);
    if (!creds) {
      return { success: false, reason: "No Habitica User ID & API Key configured" };
    }

    try {
      const res = await fetch("https://habitica.com/api/v3/user", {
        headers: {
          "x-api-user": creds.apiUser,
          "x-api-key": creds.apiKey,
          "x-client": "lifefit-os-app",
        },
      });

      if (!res.ok) {
        return { success: false, reason: `Habitica returned status ${res.status}` };
      }

      const body = await res.json();
      if (body.success && body.data) {
        const stats = body.data.stats || {};
        const profile = body.data.profile || {};
        return {
          success: true,
          profile: {
            name: profile.name || "Habitican",
            level: stats.lvl || 1,
            hp: stats.hp || 50,
            maxHealth: stats.maxHealth || 50,
            exp: stats.exp || 0,
            class: stats.class || "warrior",
          },
        };
      }

      return { success: false, reason: "Invalid response from Habitica" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Habitica connection failed";
      return { success: false, reason: msg };
    }
  }

  async syncHabitsFromHabitica(userId: string) {
    const creds = await this.getCredentials(userId);
    if (!creds) {
      return { success: false, reason: "Habitica credentials missing" };
    }

    try {
      const res = await fetch("https://habitica.com/api/v3/tasks/user?type=habits", {
        headers: {
          "x-api-user": creds.apiUser,
          "x-api-key": creds.apiKey,
          "x-client": "lifefit-os-app",
        },
      });

      if (!res.ok) {
        return { success: false, reason: `Habitica API status ${res.status}` };
      }

      const body = await res.json();
      const habits = body.data || [];
      let syncedCount = 0;

      for (const h of habits) {
        const extId = String(h.id);
        const existing = await prisma.habit.findFirst({
          where: { userId, externalId: extId },
        });

        if (!existing) {
          await prisma.habit.create({
            data: {
              userId,
              name: h.text || "Mobile Habitica Habit",
              description: h.notes || null,
              frequency: "daily",
              externalId: extId,
              externalProvider: "habitica",
              color: "#f59e0b",
            },
          });
          syncedCount++;
        }
      }

      return { success: true, syncedCount };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Habitica sync error";
      return { success: false, reason: msg };
    }
  }

  async scoreHabitUp(userId: string, habiticaTaskId: string) {
    return this.scoreHabitTask(userId, habiticaTaskId, "up");
  }

  async scoreHabitTask(userId: string, habiticaTaskId: string, direction: "up" | "down" = "up") {
    const creds = await this.getCredentials(userId);
    if (!creds) return { success: false };

    try {
      const res = await fetch(`https://habitica.com/api/v3/tasks/${habiticaTaskId}/score/${direction}`, {
        method: "POST",
        headers: {
          "x-api-user": creds.apiUser,
          "x-api-key": creds.apiKey,
          "x-client": "lifefit-os-app",
        },
      });
      return { success: res.ok };
    } catch {
      return { success: false };
    }
  }

  async createHabitOnHabitica(userId: string, name: string, notes?: string) {
    const creds = await this.getCredentials(userId);
    if (!creds) return null;

    try {
      const res = await fetch("https://habitica.com/api/v3/tasks/user", {
        method: "POST",
        headers: {
          "x-api-user": creds.apiUser,
          "x-api-key": creds.apiKey,
          "x-client": "lifefit-os-app",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: name,
          notes: notes || undefined,
          type: "habit",
          up: true,
          down: true,
        }),
      });

      if (res.ok) {
        const body = await res.json();
        return body.data?.id ? String(body.data.id) : null;
      }
      return null;
    } catch {
      return null;
    }
  }
}
