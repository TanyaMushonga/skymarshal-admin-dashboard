import DashboardShell from "@/components/DashboardShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
