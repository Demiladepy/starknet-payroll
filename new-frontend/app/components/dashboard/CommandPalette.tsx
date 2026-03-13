import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
} from "lucide-react";

export function CommandPalette({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { connect: szConnect, disconnect: szDisconnect, isConnected: szConnected } = useStarkzap();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all duration-200"
      >
        <Search size={13} className="text-[var(--text-muted)]" />
        <span>Commands</span>
        <kbd className="font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-[var(--text-muted)] ml-4">
          Ctrl+K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 modal-overlay"
              onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <div className="flex items-start justify-center pt-[20vh] px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
                className="relative z-10 w-full max-w-lg"
              >
                <Command
                  className="w-full card-glass text-[var(--text-primary)] shadow-2xl overflow-hidden"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 px-4 border-b border-[var(--border)]">
                    <Search size={14} className="text-[var(--text-muted)] shrink-0" />
                    <Command.Input
                      autoFocus
                      placeholder="Type a command..."
                      className="w-full bg-transparent py-3.5 text-[13px] focus:outline-none placeholder:text-[var(--text-muted)]"
                    />
                  </div>

                  <Command.List className="max-h-[300px] overflow-y-auto p-2">
                    <Command.Empty className="py-8 text-center text-[13px] text-[var(--text-muted)]">
                      No results found.
                    </Command.Empty>

                    <Command.Group
                      heading="Navigation"
                      className="text-[10px] text-[var(--text-muted)] px-2 py-1.5 font-bold uppercase tracking-[0.1em]"
                    >
                      {[
                        { id: "overview", label: "Overview", icon: LayoutGrid },
                        { id: "employees", label: "Employees", icon: Users },
                        { id: "transfers", label: "Transfers", icon: ArrowUpRight },
                        { id: "new_transfer", label: "New Transfer", icon: Plus },
                      ].map(({ id, label, icon: Icon }) => (
                        <Command.Item
                          key={id}
                          onSelect={() => runAction(() => onNavigate(id))}
                          className="px-3 py-2.5 rounded-lg text-[13px] cursor-pointer flex items-center gap-3 aria-selected:bg-[var(--bg-hover)] transition-colors"
                        >
                          <Icon size={15} className="text-[var(--text-muted)]" />
                          {label}
                        </Command.Item>
                      ))}
                    </Command.Group>

                    <Command.Separator className="h-px bg-[var(--border)] my-1" />

                    <Command.Group
                      heading="Actions"
                      className="text-[10px] text-[var(--text-muted)] px-2 py-1.5 font-bold uppercase tracking-[0.1em]"
                    >
                      <Command.Item
                        onSelect={() =>
                          runAction(() =>
                            setTheme(theme === "dark" ? "light" : "dark")
                          )
                        }
                        className="px-3 py-2.5 rounded-lg text-[13px] cursor-pointer flex items-center gap-3 aria-selected:bg-[var(--bg-hover)] transition-colors"
                      >
                        {theme === "dark" ? (
                          <Sun size={15} className="text-[var(--text-muted)]" />
                        ) : (
                          <Moon size={15} className="text-[var(--text-muted)]" />
                        )}
                        Toggle theme
                      </Command.Item>

                      {szConnected ? (
                        <Command.Item
                          onSelect={() => runAction(szDisconnect)}
                          className="px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-secondary)] cursor-pointer flex items-center gap-3 aria-selected:bg-[var(--bg-hover)] transition-colors"
                        >
                          <LogOut size={15} className="text-[var(--text-muted)]" />
                          Disconnect StarkZap
                        </Command.Item>
                      ) : (
                        <Command.Item
                          onSelect={() => runAction(szConnect)}
                          className="px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-secondary)] cursor-pointer flex items-center gap-3 aria-selected:bg-[var(--bg-hover)] transition-colors"
                        >
                          <Zap size={15} className="text-[var(--accent-cyan)]" />
                          Connect StarkZap
                        </Command.Item>
                      )}
                    </Command.Group>
                  </Command.List>

                  <div className="px-4 py-3 text-[11px] text-[var(--text-muted)] border-t border-[var(--border)] flex items-center justify-between">
                    <span>
                      <kbd className="font-mono bg-white/5 px-1 rounded">
                        &uarr;
                      </kbd>{" "}
                      <kbd className="font-mono bg-white/5 px-1 rounded">
                        &darr;
                      </kbd>{" "}
                      navigate
                    </span>
                    <span>
                      <kbd className="font-mono bg-white/5 px-1.5 rounded">
                        esc
                      </kbd>{" "}
                      close
                    </span>
                  </div>
                </Command>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
