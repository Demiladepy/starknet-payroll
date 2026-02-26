"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { tongoService } from "@/lib/tongo";
import { Button } from "@/components/ui/button";
import { usePayrollStore } from "@/store/payroll-store";
import { useAddEmployee } from "@/hooks/usePayroll";

export function EmployeeManager() {
  const { account } = useAccount();
  const [employeeAddress, setEmployeeAddress] = useState("");
  const [alias, setAlias] = useState("");
  const [salary, setSalary] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedSalary, setEncryptedSalary] = useState<{ C1: string; C2: string } | null>(null);
  const { addEmployee } = usePayrollStore();
  const { addEmployee: addEmployeeOnChain, hasContract } = useAddEmployee();

  const handleEncrypt = async () => {
    if (!salary || !publicKey) {
      alert("Please enter salary and public key");
      return;
    }

    setIsEncrypting(true);
    try {
      const encrypted = await tongoService.encryptSalary(
        parseFloat(salary),
        publicKey
      );
      setEncryptedSalary(encrypted);
    } catch (error) {
      console.error("Encryption error:", error);
      alert("Failed to encrypt salary");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!encryptedSalary || !employeeAddress || !publicKey) {
      alert("Please complete all fields and encrypt salary first");
      return;
    }

    try {
      if (hasContract) {
        await addEmployeeOnChain(
          employeeAddress,
          encryptedSalary.C1,
          encryptedSalary.C2,
          publicKey
        );
      }
      addEmployee({
        address: employeeAddress,
        alias: alias.trim() || undefined,
        encryptedSalaryC1: encryptedSalary.C1,
        encryptedSalaryC2: encryptedSalary.C2,
        publicKey,
        active: true,
        lastPaid: 0,
      });
      setEmployeeAddress("");
      setAlias("");
      setSalary("");
      setPublicKey("");
      setEncryptedSalary(null);
      if (hasContract) alert("Employee added on-chain.");
      else alert("Employee added to local roster (deploy contract to persist on-chain).");
    } catch (error) {
      console.error("Add employee error:", error);
      alert("Failed to add employee");
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Add employee or contractor</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Name / Alias (optional)</label>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
            placeholder="e.g. Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Starknet wallet address</label>
          <input
            type="text"
            value={employeeAddress}
            onChange={(e) => setEmployeeAddress(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] font-mono text-sm"
            placeholder="0x..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Salary (USDC)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
            placeholder="5000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Employee public key</label>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] font-mono text-sm"
            placeholder="ElGamal public key"
          />
        </div>
        <Button
          onClick={handleEncrypt}
          disabled={isEncrypting || !salary || !publicKey}
          className="rounded-xl"
        >
          {isEncrypting ? "Encrypting…" : "Encrypt salary"}
        </Button>
        {encryptedSalary && (
          <div className="p-4 rounded-xl bg-[var(--section)] border border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--foreground)] mb-2">Encrypted salary</p>
            <p className="text-xs font-mono break-all text-[var(--muted)]">C1: {encryptedSalary.C1.slice(0, 40)}…</p>
            <p className="text-xs font-mono break-all text-[var(--muted)]">C2: {encryptedSalary.C2.slice(0, 40)}…</p>
          </div>
        )}
        <Button
          onClick={handleAddEmployee}
          disabled={!encryptedSalary}
          className="w-full rounded-xl"
        >
          Add to payroll
        </Button>
      </div>
    </div>
  );
}
