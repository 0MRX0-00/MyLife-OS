import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { User, Flame } from "lucide-react";
import { MacroTargetEditor } from "@/features/nutrition/components/macro-target-editor";
import { IntegrationsContent } from "@/features/settings/components/integrations-content";
import { getAllIntegrationsStatus } from "@/services/integrations/integration-service";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const userId = await requireAuth();

  const [user, profile, integrations] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.profile.findUnique({ where: { userId } }),
    getAllIntegrationsStatus(userId),
  ]);

  const calorieTarget = profile?.calorieTarget || 2000;
  const proteinTarget = profile?.proteinTarget || 150;
  const carbTarget = profile?.carbTarget || 250;
  const fatTarget = profile?.fatTarget || 65;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, custom preferences, and mobile app integrations</p>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Profile Overview</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <p className="text-sm font-medium">{user?.name || "Not set"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Timezone</label>
            <p className="text-sm font-medium">{profile?.timezone || "UTC"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Goal</label>
            <p className="text-sm font-medium capitalize">{profile?.goal || "Not set"}</p>
          </div>
        </div>
      </div>

      {/* Custom Nutrition Targets Section */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-base">Custom Daily Nutrition Targets</h2>
          </div>
          <MacroTargetEditor
            currentCalorieTarget={calorieTarget}
            currentProteinTarget={proteinTarget}
            currentCarbTarget={carbTarget}
            currentFatTarget={fatTarget}
          />
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <div className="p-3 rounded-lg bg-muted/40 border">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">Calories</label>
            <p className="text-lg font-bold text-emerald-500 mt-1">{calorieTarget} kcal</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">Protein</label>
            <p className="text-lg font-bold mt-1">{proteinTarget}g</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">Carbs</label>
            <p className="text-lg font-bold mt-1">{carbTarget}g</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">Fat</label>
            <p className="text-lg font-bold mt-1">{fatTarget}g</p>
          </div>
        </div>
      </div>

      {/* External App & Mobile Integrations Section */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <IntegrationsContent integrations={integrations} />
      </div>
    </div>
  );
}
