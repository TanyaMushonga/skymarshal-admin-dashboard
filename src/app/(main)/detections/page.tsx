import { server } from "@/lib/server-api";
import DetectionsClient from "./DetectionsClient";
import { Detection, PaginatedResponse } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DetectionsPage({ searchParams }: PageProps) {
  let detections: Detection[] = [];
  let pagination = { count: 0, next: null, previous: null };

  try {
    const params = new URLSearchParams();

    // Add filters from search params
    if (searchParams.vehicle_type) {
      params.set("vehicle_type", String(searchParams.vehicle_type));
    }
    if (searchParams.drone__drone_id) {
      params.set("drone__drone_id", String(searchParams.drone__drone_id));
    }
    if (searchParams.patrol) {
      params.set("patrol", String(searchParams.patrol));
    }
    if (searchParams.track_id) {
      params.set("track_id", String(searchParams.track_id));
    }
    if (searchParams.search) {
      params.set("search", String(searchParams.search));
    }
    if (searchParams.ordering) {
      params.set("ordering", String(searchParams.ordering));
    }
    if (searchParams.page) {
      params.set("page", String(searchParams.page));
    }
    if (searchParams.page_size) {
      params.set("page_size", String(searchParams.page_size));
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
