"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { usePayrollStore } from "@/store/payroll-store";
import { Button } from "@/components/ui/button";
import { useExecutePayroll } from "@/hooks/usePayroll";

export function PaymentExecutor() {
  const { account } = useAccount();
  const { employees, paymentSchedule } = usePayrollStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { executePayroll, hasContract } = useExecutePayroll();

  const activeEmployees = employees.filter((e) => e.active);

  const handleExecutePayroll = async () => {
    if (activeEmployees.length === 0 && !hasContract) {
      alert("No active employees to pay");
      return;
    }

    setIsExecuting(true);
    try {
      if (hasContract) {
        const result = await executePayroll();
        const hash = result?.transaction_hash ?? (result as { transaction_hash?: string })?.transaction_hash;
        if (hash) setTxHash(hash);
        alert(`Payroll executed on-chain${hash ? `. TX: ${hash}` : ""}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setTxHash("0x" + Math.random().toString(16).slice(2, 10));
        alert("Payroll run simulated (deploy PayrollManager to execute on-chain).");
      }
    } catch (error) {
      console.error("Payroll execution error:", error);
      alert("Failed to execute payroll");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Run payroll</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            Active employees: <span className="font-semibold text-[var(--foreground)]">{activeEmployees.length}</span>
          </p>
          {paymentSchedule && (
            <p className="text-sm text-[var(--muted)]">
              Next payment: {new Date(paymentSchedule.nextPayment * 1000).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          onClick={handleExecutePayroll}
          disabled={isExecuting}
          className="w-full rounded-xl"
        >
          {isExecuting ? "Executing…" : hasContract ? "Execute payroll" : "Simulate payroll"}
        </Button>
        {txHash && (
          <div className="p-4 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/30">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Transaction: <span className="font-mono text-xs">{txHash}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
