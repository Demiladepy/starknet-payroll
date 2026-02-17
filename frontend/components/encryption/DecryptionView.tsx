"use client";

import { useState } from "react";
import { tongoService } from "@/lib/tongo";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/utils";

export function DecryptionView() {
  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [decrypted, setDecrypted] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleDecrypt = async () => {
    if (!c1 || !c2 || !privateKey) {
      alert("Please fill in all fields");
      return;
    }

    setIsDecrypting(true);
    try {
      const result = await tongoService.decryptSalary(
        { C1: c1, C2: c2 },
        privateKey
      );
      setDecrypted(result);
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Failed to decrypt");
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Decryption View</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">C1 (Ciphertext)</label>
          <input
            type="text"
            value={c1}
            onChange={(e) => setC1(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">C2 (Ciphertext)</label>
          <input
            type="text"
            value={c2}
            onChange={(e) => setC2(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Private Key</label>
          <input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Your private key"
          />
        </div>

        <Button onClick={handleDecrypt} disabled={isDecrypting}>
          {isDecrypting ? "Decrypting..." : "Decrypt"}
        </Button>

        {decrypted !== null && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Decrypted Amount:</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${formatAmount(decrypted)} USDC
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
