import { DashboardNav } from "@/components/layout/DashboardNav";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DashboardNav context="company" />
      {children}
    </div>
  );
}
