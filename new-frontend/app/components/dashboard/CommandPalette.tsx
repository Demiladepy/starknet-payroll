import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { useTheme } from "../../contexts/ThemeContext";
import { useStarkzap } from "../../contexts/StarkzapContext";
import {
  LayoutGrid,
  Users,
  ArrowUpRight,
  Plus,
  Zap,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

export function CommandPalette({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { connect: szConnect, disconnect: szDisconnect, isConnected: szConnected } = useStarkzap();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border)] text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition"
      >
        <span>Commands</span>
        <kbd className="font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded-[4px] text-[var(--text-secondary)]">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-28 sm:pt-36 bg-black/60 backdrop-blur-sm px-4">
          <Command
            className="w-full max-w-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] shadow-2xl rounded-[8px] overflow-hidden"
            onKeyDown={(e) => {
               if (e.key === "Escape") setOpen(false);
            }}
          >
            <Command.Input
              autoFocus
              placeholder="Type a command..."
              className="w-full bg-transparent border-b border-[var(--border)] px-4 py-3 text-[13px] focus:outline-none placeholder:text-[var(--text-muted)]"
            />

            <Command.List className="max-h-[300px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-[13px] text-[var(--text-muted)]">
                No results found.
              </Command.Empty>

              <Command.Group heading="Navigation" className="text-[11px] text-[var(--text-muted)] px-2 py-1.5 font-medium uppercase tracking-[0.06em]">
                <Command.Item onSelect={() => runAction(() => onNavigate("overview"))} className="px-2 py-2.5 rounded-[6px] text-[13px] cursor-pointer flex items-center gap-2 aria-selected:bg-[var(--bg-hover)]">
                  <LayoutGrid className="size-4 text-[var(--text-muted)]" /> Overview
                </Command.Item>
                <Command.Item onSelect={() => runAction(() => onNavigate("employees"))} className="px-2 py-2.5 rounded-[6px] text-[13px] cursor-pointer flex items-center gap-2 aria-selected:bg-[var(--bg-hover)]">
                  <Users className="size-4 text-[var(--text-muted)]" /> Employees
                </Command.Item>
                <Command.Item onSelect={() => runAction(() => onNavigate("transfers"))} className="px-2 py-2.5 rounded-[6px] text-[13px] cursor-pointer flex items-center gap-2 aria-selected:bg-[var(--bg-hover)]">
                  <ArrowUpRight className="size-4 text-[var(--text-muted)]" /> Transfers
                </Command.Item>
                <Command.Item onSelect={() => runAction(() => onNavigate("new_transfer"))} className="px-2 py-2.5 rounded-[6px] text-[13px] cursor-pointer flex items-center gap-2 aria-selected:bg-[var(--bg-hover)]">
                  <Plus className="size-4 text-[var(--text-muted)]" /> New transfer
                </Command.Item>
              </Command.Group>

              <Command.Separator className="h-px bg-[var(--border)] my-1" />

              <Command.Group heading="Actions" className="text-[11px] text-[var(--text-muted)] px-2 py-1.5 font-medium uppercase tracking-[0.06em]">
                <Command.Item onSelect={() => runAction(() => setTheme(theme === "dark" ? "light" : "dark"))} className="px-2 py-2.5 rounded-[6px] text-[13px] cursor-pointer flex items-center gap-2 aria-selected:bg-[var(--bg-hover)]">
                  {theme === "dark" ? (
                    <Sun className="size-4 text-[var(--text-muted)]" />
                  ) : (
                    <Moon className="size-4 text-[var(--text-muted)]" />
                  )}
                  Toggle theme
                </Command.Item>
                
                {szConnected ? (
                  <Command.Item onSelect={() => runAction(szDisconnect)} className="px-2 py-2.5 rounded-[6px] text-[13px] text-[var(--text-secondary)] cursor-pointer flex items-center gap-2 aria-selected:bg-[var(--bg-hover)]">
                    <LogOut className="size-4 text-[var(--text-muted)]" /> Disconnect Starkzap
                  </Command.Item>
                ) : (
                  <Command.Item onSelect={() => runAction(szConnect)} className="px-2 py-2.5 rounded-[6px] text-[13px] text-[var(--text-secondary)] cursor-pointer flex items-center gap-2 aria-selected:bg-[var(--bg-hover)]">
                    <Zap className="size-4 text-[var(--text-muted)]" /> Connect Starkzap
                  </Command.Item>
                )}
              </Command.Group>
            </Command.List>

            <div className="bg-transparent px-4 py-3 text-[11px] text-[var(--text-muted)] border-t border-[var(--border)] flex items-center justify-between">
              <span>
                <kbd className="font-mono bg-white/5 px-1 rounded-[4px]">↑</kbd>{" "}
                <kbd className="font-mono bg-white/5 px-1 rounded-[4px]">↓</kbd> to navigate
              </span>
              <span>
                <kbd className="font-mono bg-white/5 px-1 rounded-[4px]">esc</kbd> to close
              </span>
            </div>
          </Command>
          
           {/* Click Outside overlay */}
           <div className="absolute inset-0 z-[-1]" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
