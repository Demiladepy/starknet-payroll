import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TransferHistory from "../components/dashboard/TransferHistory";
import NewTransfer from "../components/dashboard/NewTransfer";
import Settings from "../components/dashboard/Settings";
import { CommandPalette } from "../components/dashboard/CommandPalette";
import { WalletSection } from "../components/dashboard/WalletSection";
import Overview from "../components/dashboard/Overview";
import EmployeeList from "../components/dashboard/EmployeeList";
import {
  LayoutGrid,
  Users,
  ArrowUpRight,
  Plus,
  Settings as SettingsIcon,
} from "lucide-react";
import { BrandLogo } from "../components/FingerprintLogo";

const pageTransition = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(4px)" },
  transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
};

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("overview");

  const NavItem = ({
    id,
    label,
    Icon,
  }: {
    id: string;
    label: string;
    Icon: React.ElementType;
  }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium rounded-lg mx-2 transition-all duration-200 ${
          isActive
            ? "text-[var(--text-primary)] bg-[var(--bg-elevated)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        }`}
        style={{
          width: "calc(100% - 16px)",
          ...(isActive
            ? {
                borderLeft: "2px solid var(--accent-cyan)",
                boxShadow: "0 0 12px rgba(0,212,255,0.06)",
              }
            : { borderLeft: "2px solid transparent" }),
        }}
      >
        <span className="w-5 flex justify-center">
          <Icon
            size={15}
            className={
              isActive ? "text-[var(--accent-cyan)]" : "text-[var(--text-muted)]"
            }
            strokeWidth={1.5}
          />
        </span>
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-[240px] sidebar-glass border-r border-[var(--border)] flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-[56px] flex items-center gap-2.5 px-6 border-b border-[var(--border)] shrink-0">
          <BrandLogo size={30} />
          <span className="text-[14px] font-bold tracking-tight">
            StarkPayroll
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 space-y-1">
          <NavItem id="overview" label="Overview" Icon={LayoutGrid} />
          <NavItem id="employees" label="Employees" Icon={Users} />
          <NavItem id="transfers" label="Transfers" Icon={ArrowUpRight} />

          <div className="pt-6 pb-2 px-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em]">
            Actions
          </div>
          <NavItem id="new_transfer" label="New Transfer" Icon={Plus} />
        </nav>

        {/* Bottom */}
        <div className="pb-3 pt-2 border-t border-[var(--border)]">
          <NavItem id="settings" label="Settings" Icon={SettingsIcon} />
        </div>
        <div className="px-6 py-4 flex items-center gap-2 text-[11px] text-[var(--text-muted)] border-t border-[var(--border)]">
          <div className="status-dot status-dot-success" />
          Starknet Sepolia
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-[56px] flex items-center justify-between px-8 border-b border-[var(--border)] shrink-0 sidebar-glass">
          <CommandPalette onNavigate={setActiveTab} />
          <WalletSection />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1100px] mx-auto px-8 py-8 pb-16">
            <h1 className="page-title capitalize mb-8">
              {activeTab.replace("_", " ")}
            </h1>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} {...pageTransition}>
                {activeTab === "overview" && (
                  <Overview onNavigate={setActiveTab} />
                )}
                {activeTab === "employees" && <EmployeeList />}
                {activeTab === "transfers" && <TransferHistory />}
                {activeTab === "new_transfer" && (
                  <NewTransfer onNavigate={setActiveTab} />
                )}
                {activeTab === "settings" && <Settings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
