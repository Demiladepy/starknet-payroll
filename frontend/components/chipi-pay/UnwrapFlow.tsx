"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useContractWrite } from "@starknet-react/core";
import { Button } from "@/components/ui/button";
import { tongoService } from "@/lib/tongo";

export function UnwrapFlow() {
  const [amount, setAmount] = useState("");
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const { account } = useAccount();
  const { writeAsync } = useContractWrite({});
  const hasRealTongo =
    typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS;

  const handleUnwrap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const amountBaseUnits = BigInt(Math.round(parseFloat(amount) * 1e6));
    if (amountBaseUnits <= 0n) {
      alert("Please enter a valid amount");
      return;
    }

    setIsUnwrapping(true);
    try {
      if (hasRealTongo && account?.address) {
        const storedKey = typeof localStorage !== "undefined" ? localStorage.getItem("elgamal_private_key") : null;
        if (!storedKey) {
          alert("Generate and save your Tongo keypair in Key Management first.");
          setIsUnwrapping(false);
          return;
        }
        const call = await tongoService.getWithdrawCall(storedKey, account.address, amountBaseUnits);
        if (call) {
          const result = await writeAsync({ calls: [call] });
          const hash = result?.transaction_hash;
          alert(hash ? `Withdraw submitted. TX: ${hash}` : "Withdraw submitted.");
          setAmount("");
        } else {
          alert("Could not build withdraw call. Check RPC and Tongo config.");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        alert(`Successfully unwrapped ${amount} USDC (demo)`);
        setAmount("");
      }
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
          Real mode: connect wallet and use the Tongo key from Key Management. Withdraw sends to your wallet address.
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Demo mode: set `NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS` to enable real Tongo withdraw.
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
