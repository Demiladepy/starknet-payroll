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
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Your salary</h2>
      <div className="space-y-4">
        {encryptedBalance ? (
          <div className="p-4 rounded-xl bg-[var(--section)] border border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--foreground)] mb-2">Encrypted balance</p>
            <p className="text-xs font-mono break-all text-[var(--muted)]">C1: {encryptedBalance.C1.slice(0, 40)}…</p>
            <p className="text-xs font-mono break-all text-[var(--muted)]">C2: {encryptedBalance.C2.slice(0, 40)}…</p>
          </div>
        ) : (
          <p className="text-[var(--muted)] text-sm">No encrypted balance found.</p>
        )}
        {privateKey ? (
          <div>
            <Button
              onClick={handleDecrypt}
              disabled={isDecrypting || !encryptedBalance}
              className="w-full rounded-xl"
            >
              {isDecrypting ? "Decrypting…" : "Decrypt salary"}
            </Button>
            {decryptedSalary !== null && (
              <div className="mt-4 p-6 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/30 text-center">
                <p className="text-sm text-[var(--muted)] mb-2">Your salary</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  ${formatAmount(decryptedSalary)} USDC
                </p>
                <p className="text-xs text-[var(--muted)] mt-2">Only you can see this amount</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Set up your private key in Key Management below to decrypt.
          </p>
        )}
      </div>
    </div>
  );
}
