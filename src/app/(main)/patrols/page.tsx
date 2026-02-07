import { server } from "@/lib/server-api";
import { Patrol, PaginatedResponse } from "@/types";
import PatrolsClient from "./PatrolsClient";

export const dynamic = "force-dynamic";

interface PatrolsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PatrolsPage({ searchParams }: PatrolsPageProps) {
  const params = await searchParams;
  const page = typeof params?.page === "string" ? parseInt(params.page) : 1;

  // Extract filters
  const status = typeof params?.status === "string" ? params.status : "";
  const droneId =
    typeof params?.drone__drone_id === "string" ? params.drone__drone_id : "";
  const officerEmail =
    typeof params?.officer__email === "string" ? params.officer__email : "";

  let initialData: PaginatedResponse<Patrol> = {
    results: [],
    count: 0,
    next: null,
    previous: null,
  };

  try {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    if (status) queryParams.append("status", status);
    if (droneId) queryParams.append("drone__drone_id", droneId);
    if (officerEmail) queryParams.append("officer__email", officerEmail);

    const response = await server.get<PaginatedResponse<Patrol>>(
      `/patrols/?${queryParams.toString()}`,
    );
    initialData = response;
  } catch (error: any) {
    console.error("Failed to fetch patrols:", error.message);
  }

  return <PatrolsClient initialData={initialData} currentPage={page} />;
}
