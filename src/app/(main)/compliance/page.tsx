import { api } from "@/lib/api";
import ComplianceClient from "./ComplianceClient";
import { Lottery } from "@/types";

export default async function CompliancePage() {
  let lotteries: Lottery[] = [];

  try {
    const response = await api.get<any>(
      "/compliance/lotteries/?ordering=-draw_date&page_size=10",
    );

    if (Array.isArray(response)) {
      lotteries = response;
    } else if (response && "results" in response) {
      lotteries = response.results || [];
    }
  } catch (error) {
    console.error("Failed to fetch lotteries:", error);
    // lotteries will remain empty array
  }

  return <ComplianceClient initialLotteries={lotteries} />;
}
