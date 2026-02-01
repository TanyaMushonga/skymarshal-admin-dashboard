import { mockApi } from "@/lib/mockApi";
import VehiclesClient from "./VehiclesClient";

export default async function VehiclesPage() {
  const vehicles = await mockApi.getVehicles();

  return <VehiclesClient initialVehicles={vehicles || []} />;
}
