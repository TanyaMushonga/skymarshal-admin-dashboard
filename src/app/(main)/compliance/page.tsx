import { mockApi } from "@/lib/mockApi";
import ComplianceClient from "./ComplianceClient";

export default async function CompliancePage() {
  const [lotteries, vehicles] = await Promise.all([
    mockApi.getLotteryEvents(),
    mockApi.getVehicles(),
  ]);

  const leaders = (vehicles || []).sort(
    (a, b) => b.compliance_points - a.compliance_points,
  );

  return (
    <ComplianceClient
      initialLotteries={lotteries || []}
      initialLeaders={leaders}
    />
  );
}
