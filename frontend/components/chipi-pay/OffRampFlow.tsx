"use client";

import { useState } from "react";
import { chipiPayService } from "@/lib/chipi-pay";
import { Button } from "@/components/ui/button";

export function OffRampFlow() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [bankAccount, setBankAccount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handleOffRamp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!bankAccount) {
      alert("Please enter bank account details");
      return;
    }

    setIsProcessing(true);
    try {
      const txId = await chipiPayService.initiateOffRamp({
        amount: parseFloat(amount),
        currency,
        bankAccount,
      });
      setTransactionId(txId);
      alert("Off-ramp initiated successfully");
    } catch (error) {
      console.error("Off-ramp error:", error);
      alert("Failed to initiate off-ramp");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Transfer your USDC to a traditional bank account.
      </p>
      
      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-2"
          placeholder="0.00"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-2"
        >
          <option value="MXN">MXN (Mexican Peso)</option>
          <option value="USD">USD (US Dollar)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bank Account</label>
        <input
          type="text"
          value={bankAccount}
          onChange={(e) => setBankAccount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Account number or IBAN"
        />
      </div>

      <Button
        onClick={handleOffRamp}
        disabled={isProcessing || !amount || !bankAccount}
        className="w-full"
      >
        {isProcessing ? "Processing..." : "Initiate Bank Transfer"}
      </Button>

      {transactionId && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Transaction ID: <span className="font-mono">{transactionId}</span>
          </p>
        </div>
      )}
    </div>
  );
}
