"use client";

import { useState } from "react";
import { chipiPayService } from "@/lib/chipi-pay";
import { Button } from "@/components/ui/button";

export function QRPaymentWidget() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQR = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsGenerating(true);
    try {
      const url = await chipiPayService.initiateQRPayment({
        amount: parseFloat(amount),
        currency,
        description: "Salary payment",
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("QR generation error:", error);
      alert("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Pay at 270,000+ stores in Mexico/LATAM using QR code payments.
      </p>
      
      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-2"
          placeholder="0.00"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="MXN">MXN (Mexican Peso)</option>
          <option value="USD">USD (US Dollar)</option>
        </select>
      </div>

      <Button
        onClick={handleGenerateQR}
        disabled={isGenerating || !amount}
        className="w-full"
      >
        {isGenerating ? "Generating QR Code..." : "Generate QR Code"}
      </Button>

      {qrCodeUrl && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
          <p className="text-sm font-medium mb-2">Scan this QR code at the store:</p>
          <div className="flex justify-center">
            <img src={qrCodeUrl} alt="Payment QR Code" className="w-64 h-64" />
          </div>
        </div>
      )}
    </div>
  );
}
