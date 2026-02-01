import { mockApi } from "@/lib/mockApi";
import ViolationsClient from "./ViolationsClient";

export default async function ViolationsPage() {
  const violations = await mockApi.getViolations();

  return <ViolationsClient initialViolations={violations || []} />;
}
