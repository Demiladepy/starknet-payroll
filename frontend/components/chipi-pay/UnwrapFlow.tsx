"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UnwrapFlow() {
  const [amount, setAmount] = useState("");
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const hasRealTongo =
    typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS;

  const handleUnwrap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsUnwrapping(true);
    try {
      // In a real implementation, this would:
      // 1. Call unwrap_tokens on TongoWrapper contract
      // 2. Provide decryption proof
      // 3. Receive public USDC
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Successfully unwrapped ${amount} USDC`);
      setAmount("");
    } catch (error) {
      console.error("Unwrap error:", error);
      alert("Failed to unwrap tokens");
    } finally {
      setIsUnwrapping(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Convert your confidential USDC to public USDC for use in DeFi or other applications.
      </p>
      {hasRealTongo ? (
        <p className="text-xs text-gray-500">
          Real mode: wire this to Tongo `withdraw()` (needs your Tongo private key + a Starknet
          signer). See `REAL_MODE.md`.
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Demo mode: set `NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS` to enable real Tongo flows.
        </p>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="0.00"
        />
      </div>

      <Button
        onClick={handleUnwrap}
        disabled={isUnwrapping || !amount}
        className="w-full"
      >
        {isUnwrapping ? "Unwrapping..." : "Unwrap to Public USDC"}
      </Button>
    </div>
  );
}
