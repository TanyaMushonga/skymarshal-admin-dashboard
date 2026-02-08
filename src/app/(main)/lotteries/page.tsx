import { server } from "@/lib/server-api";
import { Lottery, PaginatedResponse } from "@/types";
import LotteriesClient from "./LotteriesClient";

export const dynamic = "force-dynamic";

interface LotteriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LotteriesPage({
  searchParams,
}: LotteriesPageProps) {
  const params = await searchParams;

  let initialData: PaginatedResponse<Lottery> = {
    results: [],
    count: 0,
    next: null,
    previous: null,
  };

  try {
    const queryParams = new URLSearchParams();

    // Add filters from URL params
    if (params.status && typeof params.status === "string") {
      queryParams.append("status", params.status);
    }
    if (params.search && typeof params.search === "string") {
      queryParams.append("search", params.search);
    }
    if (params.page && typeof params.page === "string") {
      queryParams.append("page", params.page);
    }
    queryParams.append("ordering", "-draw_date");

    const data = await server.get<any>(
      `/compliance/lotteries/?${queryParams.toString()}`,
    );

    // Handle both array and paginated responses
    if (Array.isArray(data)) {
      initialData = {
        count: data.length,
        next: null,
        previous: null,
        results: data,
      };
    } else if (data && typeof data === "object" && "results" in data) {
      initialData = data;
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
    console.error("Failed to fetch lotteries:", error);
  }

  return <LotteriesClient initialData={initialData} />;
}
