import { DashboardNav } from "@/components/layout/DashboardNav";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DashboardNav context="employee" />
      {children}
    </div>
  );
}
