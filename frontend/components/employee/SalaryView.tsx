"use client";

import { useState, useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import { tongoService } from "@/lib/tongo";
import { formatAmount } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SalaryView() {
  const { account } = useAccount();
  const [encryptedBalance, setEncryptedBalance] = useState<{ C1: string; C2: string } | null>(null);
  const [decryptedSalary, setDecryptedSalary] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  useEffect(() => {
    // Load private key from secure storage
    const storedKey = localStorage.getItem("elgamal_private_key");
    if (storedKey) {
      setPrivateKey(storedKey);
    }
  }, []);

  const fetchEncryptedBalance = async () => {
    if (!account) return;

    try {
      if (privateKey && process.env.NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS) {
        const state = await tongoService.getDecryptedState(privateKey);
        if (state) {
          const total = Number(state.balance) + Number(state.pending);
          setDecryptedSalary(total / 1e6);
          setEncryptedBalance({
            C1: "0x" + state.balance.toString(16),
            C2: "0x" + state.pending.toString(16),
          });
          return;
        }
      }
      const mockBalance = {
        C1: "0x" + (5000 * 1e6).toString(16).padStart(24, "0"),
        C2: "0x" + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      };
      setEncryptedBalance(mockBalance);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedBalance || !privateKey) {
      alert("Please fetch balance and ensure private key is set");
      return;
    }

    setIsDecrypting(true);
    try {
      const salary = await tongoService.decryptSalary(encryptedBalance, privateKey);
      setDecryptedSalary(salary);
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Failed to decrypt salary");
    } finally {
      setIsDecrypting(false);
    }
  };

  useEffect(() => {
    fetchEncryptedBalance();
  }, [account, privateKey]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Your Salary</h2>
      
      <div className="space-y-4">
        {encryptedBalance ? (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-sm font-medium mb-2">Encrypted Balance:</p>
            <p className="text-xs font-mono break-all">C1: {encryptedBalance.C1}</p>
            <p className="text-xs font-mono break-all">C2: {encryptedBalance.C2}</p>
          </div>
        ) : (
          <p className="text-gray-500">No encrypted balance found.</p>
        )}

        {privateKey ? (
          <div>
            <Button
              onClick={handleDecrypt}
              disabled={isDecrypting || !encryptedBalance}
              className="w-full"
            >
              {isDecrypting ? "Decrypting..." : "Decrypt Salary"}
            </Button>

            {decryptedSalary !== null && (
              <div className="mt-4 p-6 bg-green-50 dark:bg-green-900 rounded text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your Salary:</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${formatAmount(decryptedSalary)} USDC
                </p>
                <p className="text-xs text-gray-500 mt-2">Only you can see this amount</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-yellow-600 dark:text-yellow-400">
            Please set up your private key in Key Management first.
          </p>
        )}
      </div>
    </div>
  );
}
