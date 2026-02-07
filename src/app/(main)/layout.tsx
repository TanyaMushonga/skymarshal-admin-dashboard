import DashboardShell from "@/components/DashboardShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.error === "RefreshAccessTokenError") {
    redirect("/login?expired=true");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
