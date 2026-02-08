import { server } from "@/lib/server-api";
import { Lottery, PaginatedResponse } from "@/types";
import ComplianceClient from "./ComplianceClient";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  let lotteries: Lottery[] = [];

  try {
    // Fetch active lotteries (OPEN and DRAWN)
    const lotteriesData = await server.get<any>(
      "/compliance/lotteries/?ordering=-draw_date&page_size=10",
    );

    if (Array.isArray(lotteriesData)) {
      lotteries = lotteriesData;
    } else if (lotteriesData && "results" in lotteriesData) {
      lotteries = lotteriesData.results || [];
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to fetch compliance data:", error);
  }

  return <ComplianceClient initialLotteries={lotteries} />;
}
