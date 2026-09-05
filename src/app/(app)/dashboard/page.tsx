import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { getDashboardData } from "@/services/analytics/dashboard-service";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

export const metadata: Metadata = { title: "Dashboard — LifeFit OS" };

export default async function DashboardPage() {
  const userId = await requireAuth();
  const data = await getDashboardData(userId);

  return <DashboardContent data={data} />;
}
