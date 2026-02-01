import { mockApi } from "@/lib/mockApi";
import DronesClient from "./DronesClient";

export default async function DronesPage() {
  const drones = await mockApi.getDrones();

  return <DronesClient initialDrones={drones || []} />;
}
