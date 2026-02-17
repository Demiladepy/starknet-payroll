"use client";

import { useState } from "react";
import { UnwrapFlow } from "@/components/chipi-pay/UnwrapFlow";
import { QRPaymentWidget } from "@/components/chipi-pay/QRPaymentWidget";
import { OffRampFlow } from "@/components/chipi-pay/OffRampFlow";
import { ChipiTransferSection } from "@/components/chipi-pay/ChipiTransferSection";

export function SpendingOptions() {
  const [activeTab, setActiveTab] = useState<"unwrap" | "chipi" | "qr" | "offramp">("unwrap");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Spending Options</h2>
      
      <div className="mb-4 border-b">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("unwrap")}
            className={`px-4 py-2 ${
              activeTab === "unwrap"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Unwrap to USDC
          </button>
          <button
            onClick={() => setActiveTab("chipi")}
            className={`px-4 py-2 ${
              activeTab === "chipi"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Chipi Transfer
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`px-4 py-2 ${
              activeTab === "qr"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            QR Payment
          </button>
          <button
            onClick={() => setActiveTab("offramp")}
            className={`px-4 py-2 ${
              activeTab === "offramp"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Bank Transfer
          </button>
        </div>
      </div>

      <div>
        {activeTab === "unwrap" && <UnwrapFlow />}
        {activeTab === "chipi" && <ChipiTransferSection />}
        {activeTab === "qr" && <QRPaymentWidget />}
        {activeTab === "offramp" && <OffRampFlow />}
      </div>
    </div>
  );
}
