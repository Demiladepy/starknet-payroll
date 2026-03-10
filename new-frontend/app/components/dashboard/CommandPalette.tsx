import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { useTheme } from "../../contexts/ThemeContext";
import { useStarkzap } from "../../contexts/StarkzapContext";

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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131825] border border-white/5 text-sm text-[#94A3B8] hover:bg-[#131825]/80 hover:text-white transition"
      >
        <span>Search actions...</span>
        <kbd className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 sm:pt-48 bg-black/60 backdrop-blur-sm px-4">
          <Command
            className="w-full max-w-lg bg-[#131825] text-white border border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95"
            onKeyDown={(e) => {
               if (e.key === "Escape") setOpen(false);
            }}
          >
            <Command.Input
              autoFocus
              placeholder="Type a command or search..."
              className="w-full bg-transparent border-b border-white/5 px-4 py-4 text-sm focus:outline-none placeholder:text-[#64748B]"
            />

            <Command.List className="max-h-[300px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-[#64748B]">
                No results found.
              </Command.Empty>

              <Command.Group heading="Navigation" className="text-xs text-[#64748B] px-2 py-1.5 font-medium">
                <Command.Item onSelect={() => runAction(() => onNavigate("overview"))} className="px-2 py-2.5 rounded-lg text-sm text-[#F1F5F9] hover:bg-white/10 cursor-pointer flex items-center gap-2 aria-selected:bg-white/10">
                  <span>📊</span> Go to Overview
                </Command.Item>
                <Command.Item onSelect={() => runAction(() => onNavigate("employees"))} className="px-2 py-2.5 rounded-lg text-sm text-[#F1F5F9] hover:bg-white/10 cursor-pointer flex items-center gap-2 aria-selected:bg-white/10">
                  <span>👥</span> View Employees
                </Command.Item>
                <Command.Item onSelect={() => runAction(() => onNavigate("transfers"))} className="px-2 py-2.5 rounded-lg text-sm text-[#F1F5F9] hover:bg-white/10 cursor-pointer flex items-center gap-2 aria-selected:bg-white/10">
                  <span>💳</span> Transfer History
                </Command.Item>
                <Command.Item onSelect={() => runAction(() => onNavigate("new_transfer"))} className="px-2 py-2.5 rounded-lg text-sm text-[#F1F5F9] hover:bg-white/10 cursor-pointer flex items-center gap-2 aria-selected:bg-white/10">
                  <span>💸</span> Create New Transfer
                </Command.Item>
              </Command.Group>

              <Command.Separator className="h-px bg-white/5 my-1" />

              <Command.Group heading="Actions" className="text-xs text-[#64748B] px-2 py-1.5 font-medium">
                <Command.Item onSelect={() => runAction(() => setTheme(theme === 'dark' ? 'light' : 'dark'))} className="px-2 py-2.5 rounded-lg text-sm text-[#F1F5F9] hover:bg-white/10 cursor-pointer flex items-center gap-2 aria-selected:bg-white/10">
                  <span>🌗</span> Toggle Theme
                </Command.Item>
                
                {szConnected ? (
                  <Command.Item onSelect={() => runAction(szDisconnect)} className="px-2 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center gap-2 aria-selected:bg-red-500/10">
                    <span>🔴</span> Disconnect StarkZap
                  </Command.Item>
                ) : (
                  <Command.Item onSelect={() => runAction(szConnect)} className="px-2 py-2.5 rounded-lg text-sm text-teal-400 hover:bg-teal-500/10 cursor-pointer flex items-center gap-2 aria-selected:bg-teal-500/10">
                    <span>⚡</span> Connect StarkZap
                  </Command.Item>
                )}
              </Command.Group>
            </Command.List>

            <div className="bg-black/20 px-4 py-3 text-xs text-[#64748B] border-t border-white/5 flex items-center justify-between">
              <span>Use <kbd className="font-mono bg-white/10 px-1 rounded">↑</kbd> <kbd className="font-mono bg-white/10 px-1 rounded">↓</kbd> to navigate</span>
               <span><kbd className="font-mono bg-white/10 px-1 rounded">esc</kbd> to close</span>
            </div>
          </Command>
          
           {/* Click Outside overlay */}
           <div className="absolute inset-0 z-[-1]" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
