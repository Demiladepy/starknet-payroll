"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { Button } from "@/components/ui/button";
import { SessionKey } from "@/types";
import { useEmployeeAccountSessionKeys } from "@/hooks/useEmployeeAccount";

export function SessionKeyManager() {
  const { account } = useAccount();
  const [sessionKeys, setSessionKeys] = useState<SessionKey[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [expiryDays, setExpiryDays] = useState("365");
  const { addSessionKey, removeSessionKey, hasContract } = useEmployeeAccountSessionKeys();

  const handleAddSessionKey = async () => {
    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    setIsAdding(true);
    try {
      const expiry = Math.floor(Date.now() / 1000) + parseInt(expiryDays) * 24 * 60 * 60;
      
      const newSessionKey: SessionKey = {
        key: `0x${Math.random().toString(16).slice(2)}`,
        expiry,
        permissions: {
          allowedContracts: [process.env.NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS || ""],
          allowedFunctions: ["claim_salary"],
        },
      };

      if (hasContract) {
        await addSessionKey(newSessionKey.key, expiry);
      }
      
      setSessionKeys([...sessionKeys, newSessionKey]);
      alert(hasContract ? "Session key added on-chain." : "Session key added locally.");
    } catch (error) {
      console.error("Session key error:", error);
      alert("Failed to add session key");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRevokeSessionKey = async (key: string) => {
    try {
      if (hasContract) {
        await removeSessionKey(key);
      }
      setSessionKeys(sessionKeys.filter((sk) => sk.key !== key));
      alert(hasContract ? "Session key revoked on-chain." : "Session key revoked locally.");
    } catch (error) {
      console.error("Revoke error:", error);
      alert("Failed to revoke session key");
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Session keys</h2>
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Pre-authorize recurring payments without signing each transaction.
        </p>
        {hasContract ? (
          <p className="text-xs text-[var(--muted)]">Session keys are stored on EmployeeAccount on-chain.</p>
        ) : (
          <p className="text-xs text-[var(--muted)]">Set NEXT_PUBLIC_EMPLOYEE_ACCOUNT_ADDRESS to enable on-chain session keys.</p>
        )}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Expiry (days)</label>
          <input
            type="number"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
            placeholder="365"
          />
        </div>
        <Button onClick={handleAddSessionKey} disabled={isAdding} className="rounded-xl">
          {isAdding ? "Adding…" : "Add session key"}
        </Button>
        {sessionKeys.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-[var(--foreground)] text-sm">Active session keys</h3>
            {sessionKeys.map((sk) => (
              <div
                key={sk.key}
                className="p-3 rounded-xl bg-[var(--section)] border border-[var(--border)] flex justify-between items-center"
              >
                <div>
                  <p className="text-xs font-mono text-[var(--muted)]">{sk.key.slice(0, 20)}…</p>
                  <p className="text-xs text-[var(--muted)]">Expires: {new Date(sk.expiry * 1000).toLocaleDateString()}</p>
                </div>
                <Button onClick={() => handleRevokeSessionKey(sk.key)} variant="destructive" size="sm" className="rounded-xl">Revoke</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
