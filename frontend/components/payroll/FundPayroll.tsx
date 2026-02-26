"use client";

import { useState, useEffect } from "react";
import { contractAddresses } from "@/lib/starknet";
import { Button } from "@/components/ui/button";

const PAYROLL_ADDRESS = contractAddresses.payrollManager;

function formatEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth < 0.01 ? eth.toExponential(2) : eth.toFixed(4);
}

export function FundPayroll() {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!PAYROLL_ADDRESS) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { provider } = await import("@/lib/starknet");
        const b = await provider.getBalance(PAYROLL_ADDRESS);
        if (!cancelled) setBalance(b.toString());
      } catch {
        if (!cancelled) setBalance(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const copyAddress = () => {
    if (!PAYROLL_ADDRESS) return;
    navigator.clipboard.writeText(PAYROLL_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!PAYROLL_ADDRESS) {
    return (
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Fund payroll</h2>
        <p className="text-[var(--muted)] text-sm">
          Set <code className="bg-[var(--section)] px-1 rounded">NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS</code> in your env to see the contract address and balance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Fund payroll</h2>
      <p className="text-[var(--muted)] text-sm mb-4">
        Send STRK or ETH to the payroll contract to cover payouts. Use your wallet to transfer to the address below.
      </p>
      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading balance…</p>
      ) : balance !== null ? (
        <p className="text-sm font-medium text-[var(--foreground)] mb-2">
          Contract balance: <span className="font-mono">{formatEth(BigInt(balance))} ETH</span>
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <code className="text-xs font-mono bg-[var(--section)] px-2 py-1.5 rounded break-all flex-1 min-w-0">
          {PAYROLL_ADDRESS}
        </code>
        <Button variant="outline" size="sm" onClick={copyAddress}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
