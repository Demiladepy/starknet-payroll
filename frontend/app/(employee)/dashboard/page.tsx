"use client";

import { useAccount } from "@starknet-react/core";
import { SalaryView } from "@/components/employee/SalaryView";
import { KeyManagement } from "@/components/employee/KeyManagement";
import { SpendingOptions } from "@/components/employee/SpendingOptions";
import { SessionKeyManager } from "@/components/employee/SessionKeyManager";

export default function EmployeeDashboard() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
            Connect your wallet
          </h1>
          <p className="text-[var(--muted)] mb-6">
            Connect your Starknet wallet to view your salary and spending options.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Use the wallet button in the navigation bar to connect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Employee portal
        </h1>
        <p className="text-[var(--muted)] mt-1">
          View your salary, manage keys, and spend or cash out.
        </p>
      </div>

      <div className="space-y-8">
        <SalaryView />
        <KeyManagement />
        <SessionKeyManager />
        <SpendingOptions />
      </div>
    </div>
  );
}
