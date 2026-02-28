import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Command } from "cmdk";
import { useTheme } from "~/contexts/ThemeContext";
import { useDashboard } from "~/contexts/DashboardContext";
import { cn } from "~/lib/utils";
import {
  LayoutDashboard,
  Users,
  Send,
  Sun,
  Moon,
  Search,
} from "lucide-react";

export function CommandPalette({
  open,
  onClose,
  view,
}: {
  open: boolean;
  onClose: () => void;
  view: string;
}) {
  const navigate = useNavigate();
  const { setTheme, resolvedTheme } = useTheme();
  const { employees } = useDashboard();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <Command
        className={cn(
          "fixed left-1/2 top-[20%] z-50 w-full max-w-md -translate-x-1/2 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-zinc-200 px-3 dark:border-zinc-800">
          <Search className="mr-2 size-4 shrink-0 text-zinc-500" />
          <Command.Input
            placeholder="Search employees or run an action..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
        </div>
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Group heading="Quick actions">
            <Command.Item
              onSelect={() => {
                navigate("/dashboard?view=overview");
                onClose();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
            >
              <LayoutDashboard className="size-4" />
              Go to Overview
            </Command.Item>
            <Command.Item
              onSelect={() => {
                navigate("/dashboard?view=employees&add=1");
                onClose();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
            >
              <Users className="size-4" />
              Add employee (Cmd+N)
            </Command.Item>
            <Command.Item
              onSelect={() => {
                navigate("/dashboard?view=transfers&transfer=1");
                onClose();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
            >
              <Send className="size-4" />
              New transfer (Cmd+T)
            </Command.Item>
            <Command.Item
              onSelect={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
                onClose();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              Toggle theme
            </Command.Item>
          </Command.Group>
          {employees.length > 0 && (
            <Command.Group heading="Employees">
              {employees.slice(0, 5).map((e) => (
                <Command.Item
                  key={e.id}
                  onSelect={() => {
                    navigate("/dashboard?view=employees");
                    onClose();
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                >
                  <span className="font-medium">{e.name}</span>
                  <span className="text-zinc-500">{e.role}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
