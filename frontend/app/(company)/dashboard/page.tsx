"use client";

import { useAccount } from "@starknet-react/core";
import { EmployeeManager } from "@/components/payroll/EmployeeManager";
import { PaymentExecutor } from "@/components/payroll/PaymentExecutor";
import { PaymentScheduler } from "@/components/payroll/PaymentScheduler";
import { CompliancePanel } from "@/components/compliance/CompliancePanel";
import { EmployeeRoster } from "@/components/payroll/EmployeeRoster";
import { FundPayroll } from "@/components/payroll/FundPayroll";

export default function CompanyDashboard() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
            Connect your wallet
          </h1>
          <p className="text-[var(--muted)] mb-6">
            Connect your Starknet wallet (ArgentX or Braavos) to access the employer dashboard.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Use the wallet button in the navigation bar to connect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Employer dashboard
        </h1>
        <p className="text-[var(--muted)] mt-1">
          Fund payroll, manage your team, and run payments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <FundPayroll />
          <EmployeeRoster />
          <EmployeeManager />
          <PaymentScheduler />
          <PaymentExecutor />
        </div>
        <div className="space-y-8">
          <CompliancePanel />
        </div>
      </div>
    </div>
  );
}
