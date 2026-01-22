import { mockApi } from "@/lib/mockApi";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const notifications = await mockApi.getNotifications();

  return <NotificationsClient initialNotifications={notifications || []} />;
}
