import { server } from "@/lib/server-api";
import ComplianceClient from "./ComplianceClient";
import { Lottery } from "@/types";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  let lotteries: Lottery[] = [];

  try {
    const response = await server.get<any>(
      "/compliance/lotteries/?ordering=-draw_date&page_size=10",
    );

    if (Array.isArray(response)) {
      lotteries = response;
    } else if (response && "results" in response) {
      lotteries = response.results || [];
    }
  } catch (error: any) {
    // If it's a Next.js redirect (authentication error), re-throw it
    if (error?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Failed to fetch lotteries:", error);
    // lotteries will remain empty array
  }

  return <ComplianceClient initialLotteries={lotteries} />;
}
