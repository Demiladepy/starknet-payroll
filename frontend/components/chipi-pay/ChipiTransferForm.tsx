"use client";

import { useState } from "react";
import { useTransfer } from "@chipi-pay/chipi-sdk";
import { Button } from "@/components/ui/button";

/**
 * Real Chipi transfer form. Must be rendered inside ChipiProvider.
 * Requires NEXT_PUBLIC_CHIPI_BEARER_TOKEN and wallet keys (from useCreateWallet flow).
 */
export function ChipiTransferForm() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { transferAsync, isLoading, data: txHash } = useTransfer();

  const handleTransfer = async () => {
    if (!recipient || !amount || !pin) {
      setError("Fill recipient, amount, and PIN.");
      return;
    }
    setError(null);
    const bearerToken = process.env.NEXT_PUBLIC_CHIPI_BEARER_TOKEN || "";
    const walletPublicKey = process.env.NEXT_PUBLIC_CHIPI_WALLET_PUBLIC_KEY || "";
    const walletEncryptedKey = process.env.NEXT_PUBLIC_CHIPI_WALLET_ENCRYPTED_KEY || "";
    if (!bearerToken || !walletPublicKey || !walletEncryptedKey) {
      setError("Set CHIPI bearer token and wallet keys for real transfer.");
      return;
    }
    try {
      await transferAsync({
        params: {
          amount: Number(amount),
          encryptKey: pin,
          wallet: { publicKey: walletPublicKey, encryptedPrivateKey: walletEncryptedKey },
          token: "USDC",
          recipient,
        },
        bearerToken,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transfer failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Recipient</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="0x..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">PIN</label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Wallet PIN"
        />
      </div>
      <Button onClick={handleTransfer} disabled={isLoading}>
        {isLoading ? "Sending…" : "Send via Chipi"}
      </Button>
      {txHash && <p className="text-sm text-green-600">TX: {txHash}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
