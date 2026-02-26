"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { usePayrollStore } from "@/store/payroll-store";
import { Button } from "@/components/ui/button";
import { useSetPaymentSchedule, usePaymentScheduleFromChain } from "@/hooks/usePayroll";

export function PaymentScheduler() {
  const { account } = useAccount();
  const { paymentSchedule, setPaymentSchedule } = usePayrollStore();
  const [frequency, setFrequency] = useState("2592000");
  const [isUpdating, setIsUpdating] = useState(false);
  const { setPaymentSchedule: setScheduleOnChain, hasContract } = useSetPaymentSchedule();
  const { schedule: chainSchedule, hasContract: hasChain } = usePaymentScheduleFromChain();
  const displaySchedule = (hasChain && chainSchedule && (chainSchedule.frequency > 0 || chainSchedule.nextPayment > 0)) ? chainSchedule : paymentSchedule;

  const handleUpdateSchedule = async () => {
    if (!frequency) {
      alert("Please enter payment frequency");
      return;
    }

    setIsUpdating(true);
    try {
      const nextPayment = Math.floor(Date.now() / 1000) + parseInt(frequency);
      if (hasContract) {
        await setScheduleOnChain(parseInt(frequency), nextPayment);
      }
      setPaymentSchedule({
        frequency: parseInt(frequency),
        nextPayment,
      });
      alert(hasContract ? "Payment schedule updated on-chain." : "Payment schedule updated locally.");
    } catch (error) {
      console.error("Schedule update error:", error);
      alert("Failed to update schedule");
    } finally {
      setIsUpdating(false);
    }
  };

  const frequencyOptions = [
    { label: "Weekly", value: "604800" },
    { label: "Bi-weekly", value: "1209600" },
    { label: "Monthly", value: "2592000" },
    { label: "Quarterly", value: "7776000" },
  ];

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Payment schedule</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Payment frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
          >
            {frequencyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {displaySchedule && (displaySchedule.frequency > 0 || displaySchedule.nextPayment > 0) && (
          <div className="p-4 rounded-xl bg-[var(--section)] border border-[var(--border)]">
            {hasChain && chainSchedule && <p className="text-xs text-[var(--muted)] mb-1">From chain</p>}
            <p className="text-sm text-[var(--foreground)]">
              <span className="font-medium">Current schedule:</span> Every{" "}
              {Math.floor(displaySchedule.frequency / 86400)} days
            </p>
            <p className="text-sm text-[var(--foreground)]">
              <span className="font-medium">Next payment:</span>{" "}
              {new Date(displaySchedule.nextPayment * 1000).toLocaleString()}
            </p>
          </div>
        )}
        <Button
          onClick={handleUpdateSchedule}
          disabled={isUpdating}
          className="w-full rounded-xl"
        >
          {isUpdating ? "Updating…" : "Update schedule"}
        </Button>
      </div>
    </div>
  );
}
