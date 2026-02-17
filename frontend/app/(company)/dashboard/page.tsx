"use client";

import { useAccount } from "@starknet-react/core";
import { EmployeeManager } from "@/components/payroll/EmployeeManager";
import { PaymentExecutor } from "@/components/payroll/PaymentExecutor";
import { PaymentScheduler } from "@/components/payroll/PaymentScheduler";
import { CompliancePanel } from "@/components/compliance/CompliancePanel";
import { EmployeeRoster } from "@/components/payroll/EmployeeRoster";

export default function CompanyDashboard() {
  const { account, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h1>
          <p className="text-gray-600">Connect your Starknet wallet to access the company dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Company Payroll Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <EmployeeRoster />
            <EmployeeManager />
            <PaymentScheduler />
            <PaymentExecutor />
          </div>
          <div className="space-y-6">
            <CompliancePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
