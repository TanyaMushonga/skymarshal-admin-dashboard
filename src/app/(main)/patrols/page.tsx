import { mockApi } from "@/lib/mockApi";
import PatrolsClient from "./PatrolsClient";

export default async function PatrolsPage() {
  const patrols = await mockApi.getPatrols();

  return <PatrolsClient initialPatrols={patrols || []} />;
}
