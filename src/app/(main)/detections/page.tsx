import { server } from "@/lib/server-api";
import DetectionsClient from "./DetectionsClient";
import { Detection, PaginatedResponse } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DetectionsPage({ searchParams }: PageProps) {
  const params_data = await searchParams;
  let detections: Detection[] = [];
  let pagination = { count: 0, next: null, previous: null };

  try {
    const params = new URLSearchParams();

    // Add filters from search params
    if (params_data.vehicle_type) {
      params.set("vehicle_type", String(params_data.vehicle_type));
    }
    if (params_data.drone__drone_id) {
      params.set("drone__drone_id", String(params_data.drone__drone_id));
    }
    if (params_data.patrol) {
      params.set("patrol", String(params_data.patrol));
    }
    if (params_data.track_id) {
      params.set("track_id", String(params_data.track_id));
    }
    if (params_data.search) {
      params.set("search", String(params_data.search));
    }
    if (params_data.ordering) {
      params.set("ordering", String(params_data.ordering));
    }
    if (params_data.page) {
      params.set("page", String(params_data.page));
    }
    if (params_data.page_size) {
      params.set("page_size", String(params_data.page_size));
    }

    const response = await server.get<any>(
      `/detections/events/?${params.toString()}`,
    );

    if (Array.isArray(response)) {
      detections = response;
      pagination = { count: response.length, next: null, previous: null };
    } else if (response && "results" in response) {
      detections = response.results || [];
      pagination = {
        count: response.count || 0,
        next: response.next,
        previous: response.previous,
      };
    }
  } catch (error: any) {
    // If it's a Next.js redirect (authentication error), re-throw it
    if (error?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Failed to fetch detections:", error);
    // detections will remain empty array, component will render with no data
  }

  return (
    <DetectionsClient
      initialDetections={detections}
      initialPagination={pagination}
    />
  );
}
