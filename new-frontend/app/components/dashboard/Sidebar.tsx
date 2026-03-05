import { Link } from "react-router";
import { cn } from "~/lib/utils";
import {
  LayoutDashboard,
  Users,
  Send,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Shield,
  History,
} from "lucide-react";

const nav = [
  { to: "/dashboard?view=overview", icon: LayoutDashboard, label: "Dashboard Overview" },
  { to: "/dashboard?view=employees", icon: Users, label: "Employees" },
  { to: "/dashboard?view=transfers", icon: Send, label: "Transfers" },
  { to: "/dashboard?view=starkzap", icon: ArrowLeftRight, label: "StarkZap Swap" },
  { to: "/dashboard?view=tongo", icon: Shield, label: "Tongo Private Transfer" },
  { to: "/dashboard?view=history", icon: History, label: "Transfer History" },
  { to: "/dashboard?view=settings", icon: Settings, label: "Settings" },
];

export function Sidebar({
  collapsed,
  onToggle,
  view,
}: {
  collapsed: boolean;
  onToggle: () => void;
  view: string;
}) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-zinc-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800/70 dark:bg-zinc-950/40 transition-[width] duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex h-14 items-center border-b border-zinc-200/70 dark:border-zinc-800/70 px-3">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-7 rounded-md bg-gradient-to-br from-blue-500 to-violet-500" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              Company
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="ml-auto p-2 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => {
          const isActive = view === to.split("view=")[1]?.split("&")[0];
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
              )}
            >
              <Icon className={cn("size-5 shrink-0", isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200")} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
