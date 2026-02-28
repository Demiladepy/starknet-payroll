import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useTheme } from "~/contexts/ThemeContext";
import { cn } from "~/lib/utils";
import {
  Command,
  Sun,
  Moon,
  Bell,
  Wallet,
  LogOut,
  LayoutDashboard,
  Users,
  Send,
  Settings,
} from "lucide-react";

const breadcrumbLabels: Record<string, string> = {
  overview: "Overview",
  employees: "Employees",
  transfers: "Transfers",
  settings: "Settings",
};

export function Topbar({
  view,
  onOpenCommand,
  walletSection,
}: {
  view: string;
  onOpenCommand: () => void;
  walletSection?: React.ReactNode;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="flex flex-1 items-center gap-2">
        <nav className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            to="/dashboard"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {breadcrumbLabels[view] ?? "Overview"}
          </span>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenCommand}
          className="h-9 w-9"
          aria-label="Open command palette (Cmd+K)"
        >
          <Command className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        {walletSection}
      </div>
    </header>
  );
}
