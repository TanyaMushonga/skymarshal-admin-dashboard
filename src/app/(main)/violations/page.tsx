import { server } from "@/lib/server-api";
import { Violation, PaginatedResponse } from "@/types";
import ViolationsClient from "./ViolationsClient";

export const dynamic = "force-dynamic";

interface ViolationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ViolationsPage({
  searchParams,
}: ViolationsPageProps) {
  const params = await searchParams;

  let initialData: PaginatedResponse<Violation> = {
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
    if (params.violation_type && typeof params.violation_type === "string") {
      queryParams.append("violation_type", params.violation_type);
    }
    if (params.search && typeof params.search === "string") {
      queryParams.append("search", params.search);
    }
    if (params.page && typeof params.page === "string") {
      queryParams.append("page", params.page);
    }

    const data = await server.get<any>(
      `/violations/events/?${queryParams.toString()}`,
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
    console.error("Failed to fetch violations:", error);
  }

  return <ViolationsClient initialData={initialData} />;
}
