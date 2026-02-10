import { server } from "@/lib/server-api";
import UsersClient from "./UsersClient";
import { User } from "@/types";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params_data = await searchParams;
  let users: User[] = [];
  let pagination = { count: 0, next: null, previous: null };

  try {
    const params = new URLSearchParams();
    if (params_data.page) params.set("page", params_data.page);
    if (params_data.search) params.set("search", params_data.search);

    const response = await server.get<any>(`/users/?${params.toString()}`);

    if (Array.isArray(response)) {
      users = response;
    } else if (response && "results" in response) {
      users = response.results || [];
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

    console.error("Failed to fetch users:", error);
    // users will remain empty array
  }

  return <UsersClient initialUsers={users} initialPagination={pagination} />;
}
