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
        encryptedSalaryC1: encryptedSalary.C1,
        encryptedSalaryC2: encryptedSalary.C2,
        publicKey,
        active: true,
        lastPaid: 0,
      });
      setEmployeeAddress("");
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Add Employee</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Employee Address</label>
          <input
            type="text"
            value={employeeAddress}
            onChange={(e) => setEmployeeAddress(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Salary (USDC)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="5000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Employee Public Key</label>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="ElGamal public key"
          />
        </div>

        <Button
          onClick={handleEncrypt}
          disabled={isEncrypting || !salary || !publicKey}
        >
          {isEncrypting ? "Encrypting..." : "Encrypt Salary"}
        </Button>

        {encryptedSalary && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-sm font-medium mb-2">Encrypted Salary:</p>
            <p className="text-xs font-mono break-all">C1: {encryptedSalary.C1}</p>
            <p className="text-xs font-mono break-all">C2: {encryptedSalary.C2}</p>
          </div>
        )}

        <Button
          onClick={handleAddEmployee}
          disabled={!encryptedSalary}
          className="w-full"
        >
          Add Employee to Payroll
        </Button>
      </div>
    </div>
  );
}
