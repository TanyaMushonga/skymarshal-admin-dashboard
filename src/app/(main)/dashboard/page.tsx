import { server } from "@/lib/server-api";
import { DashboardOverview } from "@/types";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let initialData: DashboardOverview | null = null;

  try {
    const data = await server.get<DashboardOverview>(
      "/analytics/admin/dashboard/",
    );
    initialData = data;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to fetch dashboard data:", error);
  }

  return <DashboardClient initialData={initialData} />;
}
