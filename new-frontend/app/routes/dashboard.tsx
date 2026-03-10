import React, { useState } from "react";
import { WalletSection } from "../components/dashboard/WalletSection";
import Overview from "../components/dashboard/Overview";
import EmployeeList from "../components/dashboard/EmployeeList";
import TransferHistory from "../components/dashboard/TransferHistory";
import NewTransfer from "../components/dashboard/NewTransfer";
import Settings from "../components/dashboard/Settings";
import { CommandPalette } from "../components/dashboard/CommandPalette";

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("overview");

  const NavItem = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
        activeTab === id
          ? "bg-white/10 text-white font-medium"
          : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#0A0E1A] text-[#F1F5F9] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#131825]/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="font-heading font-bold text-lg flex items-center gap-2">
            <span>💼</span> StarkPayroll
          </div>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          <NavItem id="overview" label="Overview" icon="📊" />
          <NavItem id="employees" label="Employees" icon="👥" />
          <NavItem id="transfers" label="Transfers" icon="💳" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Actions
          </div>
          <NavItem id="new_transfer" label="New Transfer" icon="💸" />
        </nav>
        <div className="p-4 border-t border-white/5">
          <NavItem id="settings" label="Settings" icon="⚙️" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0A0E1A]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-lg font-semibold capitalize hidden md:block">
              {activeTab.replace("_", " ")}
            </h2>
            <CommandPalette onNavigate={setActiveTab} />
          </div>
          <div className="flex items-center gap-3">
            <button
               onClick={() => document.documentElement.classList.toggle('dark')} 
               className="p-2 mr-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm hidden md:block" title="Toggle Theme"
            >
              🌗
            </button>
            <WalletSection />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === "overview" && <Overview onNavigate={setActiveTab} />}
            {activeTab === "employees" && <EmployeeList />}
            {activeTab === "transfers" && <TransferHistory />}
            {activeTab === "new_transfer" && <NewTransfer onNavigate={setActiveTab} />}
            {activeTab === "settings" && <Settings />}
          </div>
        </div>
      </main>
    </div>
  );
}
