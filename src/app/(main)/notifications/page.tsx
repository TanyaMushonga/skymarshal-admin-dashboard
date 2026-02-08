import { server } from "@/lib/server-api";
import { Notification, PaginatedResponse } from "@/types";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

interface NotificationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;

  let initialData: PaginatedResponse<Notification> = {
    results: [],
    count: 0,
    next: null,
    previous: null,
  };

  try {
    const queryParams = new URLSearchParams();

    // Add filters from URL params
    if (params.is_read && typeof params.is_read === "string") {
      queryParams.append("is_read", params.is_read);
    }
    if (
      params.notification_type &&
      typeof params.notification_type === "string"
    ) {
      queryParams.append("notification_type", params.notification_type);
    }
    if (params.page && typeof params.page === "string") {
      queryParams.append("page", params.page);
    }
    queryParams.append("ordering", "-created_at");

    const data = await server.get<any>(
      `/notifications/?${queryParams.toString()}`,
    );

    // Handle both array and paginated responses
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
    console.error("Failed to fetch notifications:", error);
  }

  return <NotificationsClient initialData={initialData} />;
}
