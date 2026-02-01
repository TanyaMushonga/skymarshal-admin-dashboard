import { mockApi } from "@/lib/mockApi";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const users = await mockApi.getUsers();

  return <UsersClient initialUsers={users || []} />;
}
