"use client";

import dynamic from "next/dynamic";
import { chipiConfig } from "@/lib/chipi-pay";

const ChipiTransferForm = dynamic(
  () => import("./ChipiTransferForm").then((m) => m.ChipiTransferForm),
  { ssr: false }
);

export function ChipiTransferSection() {
  if (!chipiConfig.isConfigured()) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
        Set <code className="bg-gray-100 px-1">NEXT_PUBLIC_CHIPI_API_KEY</code> and wrap the app with Chipi to enable real transfers. Get a key at{" "}
        <a href="https://dashboard.chipipay.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          dashboard.chipipay.com
        </a>
        .
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">Send USDC via Chipi (gasless). Requires Chipi wallet + bearer token.</p>
      <ChipiTransferForm />
    </div>
  );
}
