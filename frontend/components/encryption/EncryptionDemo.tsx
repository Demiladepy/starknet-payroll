"use client";

import { useState } from "react";
import { tongoService } from "@/lib/tongo";
import { Button } from "@/components/ui/button";

export function EncryptionDemo() {
  const [amount, setAmount] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [encrypted, setEncrypted] = useState<{ C1: string; C2: string } | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const handleEncrypt = async () => {
    if (!amount || !publicKey) {
      alert("Please enter amount and public key");
      return;
    }

    setIsEncrypting(true);
    try {
      const result = await tongoService.encryptSalary(parseFloat(amount), publicKey);
      setEncrypted(result);
    } catch (error) {
      console.error("Encryption error:", error);
      alert("Failed to encrypt");
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Encryption Demo</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="5000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Public Key</label>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="ElGamal public key"
          />
        </div>

        <Button onClick={handleEncrypt} disabled={isEncrypting}>
          {isEncrypting ? "Encrypting..." : "Encrypt"}
        </Button>

        {encrypted && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-sm font-medium mb-2">Encrypted Result:</p>
            <p className="text-xs font-mono break-all">C1: {encrypted.C1}</p>
            <p className="text-xs font-mono break-all">C2: {encrypted.C2}</p>
          </div>
        )}
      </div>
    </div>
  );
}
