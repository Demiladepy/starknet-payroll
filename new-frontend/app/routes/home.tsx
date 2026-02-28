import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Users, LayoutDashboard } from "lucide-react";

export function meta() {
  return [
    { title: "Company Employee Management" },
    {
      name: "description",
      content:
        "Manage employees and send transfers. Company Employee Management Dashboard.",
    },
  ];
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-brand-400 text-lg">
            Company Employee Management
          </span>
          <nav className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-brand-400 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link to="/dashboard">
              <Button size="sm">Open Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 tracking-tight leading-[1.1]">
            Company Employee{" "}
            <span className="text-brand-400">Management</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage your team in one place. Add employees, track payroll, and send
            transfers from a single dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="min-w-[180px]">
                <LayoutDashboard className="size-5 mr-2" />
                Open Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
          <div className="rounded-[var(--radius-card)] border border-slate-800 bg-slate-900 p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-[var(--radius-button)] bg-brand-600/20 text-brand-400">
                <Users className="size-5" />
              </div>
              <h2 className="font-semibold text-slate-100">Employee database</h2>
            </div>
            <p className="text-sm text-slate-400">
              Add, edit, and remove employees. Search and filter by name, role, or
              department.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-slate-800 bg-slate-900 p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-[var(--radius-button)] bg-violet-600/20 text-violet-400">
                <LayoutDashboard className="size-5" />
              </div>
              <h2 className="font-semibold text-slate-100">Transfers & history</h2>
            </div>
            <p className="text-sm text-slate-400">
              Send transfers to employee wallets and keep a full history of
              payments.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        Company Employee Management
      </footer>
    </div>
  );
}
