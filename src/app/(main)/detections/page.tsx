import { mockApi } from "@/lib/mockApi";
import DetectionsClient from "./DetectionsClient";

export default async function DetectionsPage() {
  const detections = await mockApi.getDetections();

  return <DetectionsClient initialDetections={detections || []} />;
}
