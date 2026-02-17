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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Execute Payroll</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Active Employees: <span className="font-bold">{activeEmployees.length}</span>
          </p>
          {paymentSchedule && (
            <p className="text-sm text-gray-600 mb-2">
              Next Payment: {new Date(paymentSchedule.nextPayment * 1000).toLocaleString()}
            </p>
          )}
        </div>

        <Button
          onClick={handleExecutePayroll}
          disabled={isExecuting}
          className="w-full"
        >
          {isExecuting ? "Executing..." : hasContract ? `Execute Payroll on-chain` : "Simulate Payroll"}
        </Button>

        {txHash && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Transaction Hash: <span className="font-mono">{txHash}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
