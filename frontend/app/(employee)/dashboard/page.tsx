"use client";

import { useAccount } from "@starknet-react/core";
import { SalaryView } from "@/components/employee/SalaryView";
import { KeyManagement } from "@/components/employee/KeyManagement";
import { SpendingOptions } from "@/components/employee/SpendingOptions";
import { SessionKeyManager } from "@/components/employee/SessionKeyManager";

export default function EmployeeDashboard() {
  const { account, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h1>
          <p className="text-gray-600">Connect your Starknet wallet to access your employee dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Employee Portal</h1>
        <div className="space-y-6">
          <SalaryView />
          <KeyManagement />
          <SessionKeyManager />
          <SpendingOptions />
        </div>
      </div>
    </div>
  );
}
