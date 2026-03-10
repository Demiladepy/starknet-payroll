import React, { useState } from "react";
import TransferHistory from "../components/dashboard/TransferHistory";
import NewTransfer from "../components/dashboard/NewTransfer";
import Settings from "../components/dashboard/Settings";
import { CommandPalette } from "../components/dashboard/CommandPalette";
import { WalletSection } from "../components/dashboard/WalletSection";
import Overview from "../components/dashboard/Overview";
import EmployeeList from "../components/dashboard/EmployeeList";
import { LayoutGrid, Users, ArrowUpRight, Plus, Settings as SettingsIcon } from "lucide-react";

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("overview");

  const NavItem = ({ id, label, Icon }: { id: string; label: string; Icon: React.ElementType }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-colors ${
          isActive
            ? "text-[var(--text-primary)] bg-[var(--bg-elevated)] border-l-2 border-[var(--accent)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-l-2 border-transparent"
        }`}
      >
        <span className="w-5 flex justify-center text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
          <Icon size={14} />
        </span>
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">
      {/* Sidebar - 220px */}
      <aside className="w-[220px] border-r border-[var(--border)] bg-[var(--bg-surface)] flex flex-col shrink-0">
        <div className="h-[52px] flex items-center px-6 border-b border-[var(--border)] shrink-0">
          <div className="text-[14px] font-semibold tracking-tight">StarkPayroll</div>
        </div>
        <nav className="flex-1 py-6 space-y-[2px]">
          <NavItem id="overview" label="Overview" Icon={LayoutGrid} />
          <NavItem id="employees" label="Employees" Icon={Users} />
          <NavItem id="transfers" label="Transfers" Icon={ArrowUpRight} />
          <div className="pt-6 pb-2 px-6 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em]">
            Actions
          </div>
          <NavItem id="new_transfer" label="New Transfer" Icon={Plus} />
        </nav>
        <div className="pb-4 pt-2 border-t border-[var(--border)]">
          <NavItem id="settings" label="Settings" Icon={SettingsIcon} />
        </div>
        {/* Network indicator bottom */}
        <div className="px-6 py-4 flex items-center gap-2 text-[11px] text-[var(--text-muted)] border-t border-[var(--border)]">
          <div className="h-[6px] w-[6px] rounded-full bg-[var(--status-success)]" />
          Starknet Sepolia
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar - 52px */}
        <header className="h-[52px] flex items-center justify-between px-8 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-4">
            {/* The page title will naturally flow inside content area */}
            <CommandPalette onNavigate={setActiveTab} />
          </div>
          <div className="flex items-center gap-3">
            <WalletSection />
          </div>
        </header>

        {/* Content Area - 1100px max width */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1100px] mx-auto px-8 py-6 pb-12">
            <h1 className="page-title capitalize">{activeTab.replace("_", " ")}</h1>
            <div className="mt-6">
              {activeTab === "overview" && <Overview onNavigate={setActiveTab} />}
              {activeTab === "employees" && <EmployeeList />}
              {activeTab === "transfers" && <TransferHistory />}
              {activeTab === "new_transfer" && <NewTransfer onNavigate={setActiveTab} />}
              {activeTab === "settings" && <Settings />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
