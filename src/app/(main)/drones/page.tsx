import DronesClient from "./DronesClient";
import { server } from "@/lib/server-api";
import { Drone, PaginatedResponse } from "@/types";

export const dynamic = "force-dynamic";

interface DronesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DronesPage({ searchParams }: DronesPageProps) {
  const params = await searchParams;
  const page = typeof params?.page === "string" ? parseInt(params.page) : 1;

  // Extract filters
  const status =
    typeof params?.status__status === "string" ? params.status__status : "";
  const model = typeof params?.model === "string" ? params.model : "";
  const isActive =
    typeof params?.is_active === "string" ? params.is_active : "";
  const search = typeof params?.search === "string" ? params.search : "";

  let initialData = {
    results: [] as Drone[],
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  };

  try {
    // Construct query string
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    if (status) queryParams.append("status__status", status);
    if (model) queryParams.append("model", model);
    if (isActive) queryParams.append("is_active", isActive);
    if (search) queryParams.append("search", search);

    const response = await server.get<PaginatedResponse<Drone> | Drone[]>(
      `/drones/?${queryParams.toString()}`,
    );
    // Check if response has results (paginated) or is just array (flat - though user showed paginated)
    if ("results" in response) {
      initialData = response;
    } else if (Array.isArray(response)) {
      initialData.results = response;
      initialData.count = response.length;
    }
  } catch (error: any) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error(
      "Failed to fetch drones:",
      error.message,
      error.data || error.response?.data,
    );
  }

  return <DronesClient initialData={initialData} currentPage={page} />;
}
