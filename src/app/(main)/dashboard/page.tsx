import { mockApi } from "@/lib/mockApi";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [metrics, violations, drones] = await Promise.all([
    mockApi.getMetrics(),
    mockApi.getViolations(),
    mockApi.getDrones(),
  ]);

  const idleDrones = drones.filter(
    (drone) => drone.status?.status === "offline",
  );

  return (
    <DashboardClient
      initialMetrics={metrics}
      initialViolations={violations}
      initialIdleDrones={idleDrones}
    />
  );
}
