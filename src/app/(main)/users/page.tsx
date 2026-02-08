import { server } from "@/lib/server-api";
import UsersClient from "./UsersClient";
import { User } from "@/types";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  let users: User[] = [];
  let pagination = { count: 0, next: null, previous: null };

  try {
    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.search) params.set("search", searchParams.search);

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
