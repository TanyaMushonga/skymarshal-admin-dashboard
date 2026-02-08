import { server } from "@/lib/server-api";
import { Vehicle, PaginatedResponse } from "@/types";
import VehiclesClient from "./VehiclesClient";

export default async function VehiclesPage() {
  let initialData: PaginatedResponse<Vehicle> = {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };

  try {
    const data = await server.get<any>("/vehicle-lookup/");
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
    console.error("Failed to fetch vehicles:", error);
  }

  return <VehiclesClient initialData={initialData} />;
}
