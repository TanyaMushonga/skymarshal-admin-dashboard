import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { server } from "@/lib/server-api";
import { User } from "@/types";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  let user: User | null = null;
  try {
    user = await server.get<User>("/users/me/");
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    // Fallback to session user info if API fails
    user = {
      id: session.user.id,
      email: session.user.email,
      first_name: session.user.name?.split(" ")[0] || "",
      last_name: session.user.name?.split(" ").slice(1).join(" ") || "",
      role: session.user.role || "officer",
      is_officer: session.user.role === "officer",
      is_certified_pilot: false,
      is_on_duty: false,
    } as User;
  }

  return (
    <div className="container mx-auto py-8">
      <ProfileClient initialUser={user} />
    </div>
  );
}
