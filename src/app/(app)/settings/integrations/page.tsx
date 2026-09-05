import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { getAllIntegrationsStatus } from "@/services/integrations/integration-service";
import { IntegrationsContent } from "@/features/settings/components/integrations-content";

export const metadata: Metadata = { title: "Integrations — LifeFit OS" };

export default async function IntegrationsSettingsPage() {
  const userId = await requireAuth();
  const integrations = await getAllIntegrationsStatus(userId);

  return <IntegrationsContent integrations={integrations} />;
}
