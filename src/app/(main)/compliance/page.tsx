import { server } from "@/lib/server-api";
import ComplianceClient from "./ComplianceClient";
import { Lottery } from "@/types";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  let lotteries: Lottery[] = [];
  let complianceScores: any[] = [];

  try {
    const [lotteryResponse, scoresResponse] = await Promise.all([
      server.get<any>("/compliance/lotteries/?ordering=-draw_date&page_size=10"),
      server.get<any>("/compliance/scores/?ordering=-safe_driving_points&page_size=10"),
    ]);

    // Handle lotteries
    if (Array.isArray(lotteryResponse)) {
      lotteries = lotteryResponse;
    } else if (lotteryResponse && "results" in lotteryResponse) {
      lotteries = lotteryResponse.results || [];
    }

    // Handle compliance scores
    if (Array.isArray(scoresResponse)) {
      complianceScores = scoresResponse;
    } else if (scoresResponse && "results" in scoresResponse) {
      complianceScores = scoresResponse.results || [];
    }
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Failed to fetch compliance data:", error);
  }

  return (
    <ComplianceClient
      initialLotteries={lotteries}
      initialScores={complianceScores}
    />
  );
}
