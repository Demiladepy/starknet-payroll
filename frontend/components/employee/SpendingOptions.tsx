"use client";

import { useState } from "react";
import { UnwrapFlow } from "@/components/chipi-pay/UnwrapFlow";
import { QRPaymentWidget } from "@/components/chipi-pay/QRPaymentWidget";
import { OffRampFlow } from "@/components/chipi-pay/OffRampFlow";
import { ChipiTransferSection } from "@/components/chipi-pay/ChipiTransferSection";

export function SpendingOptions() {
  const [activeTab, setActiveTab] = useState<"unwrap" | "chipi" | "qr" | "offramp">("unwrap");

  const tabs = [
    { id: "unwrap" as const, label: "Unwrap to USDC" },
    { id: "chipi" as const, label: "Chipi transfer" },
    { id: "qr" as const, label: "QR payment" },
    { id: "offramp" as const, label: "Bank transfer" },
  ];

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Spending options</h2>
      <div className="mb-4 border-b border-[var(--border)]">
        <div className="flex flex-wrap gap-1">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-[var(--section)] text-[var(--accent)] border border-[var(--border)] border-b-[var(--card)] -mb-px"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
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
