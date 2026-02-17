"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { tongoService } from "@/lib/tongo";
import { Button } from "@/components/ui/button";
import { useGrantViewingKey } from "@/hooks/useCompliance";

export function CompliancePanel() {
  const { account } = useAccount();
  const [auditorAddress, setAuditorAddress] = useState("");
  const [employeeAddresses, setEmployeeAddresses] = useState("");
  const [timeRangeStart, setTimeRangeStart] = useState("");
  const [timeRangeEnd, setTimeRangeEnd] = useState("");
  const [viewingKey, setViewingKey] = useState<string | null>(null);
  const [isGranting, setIsGranting] = useState(false);
  const { grantViewingKey, hasContract } = useGrantViewingKey();

  const handleGrantViewingKey = async () => {
    if (!auditorAddress) {
      alert("Please enter auditor address");
      return;
    }

    const start = timeRangeStart ? parseInt(timeRangeStart, 10) : 0;
    const end = timeRangeEnd ? parseInt(timeRangeEnd, 10) : Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
    if (end <= start) {
      alert("Time range end must be after start");
      return;
    }

    setIsGranting(true);
    try {
      const key = await tongoService.generateViewingKey("master_key", {
        employeeAddresses: employeeAddresses ? employeeAddresses.split(",").map((a) => a.trim()) : undefined,
        timeRangeStart: start,
        timeRangeEnd: end,
      });
      setViewingKey(key);

      if (hasContract) {
        await grantViewingKey(auditorAddress, key, start, end);
        alert("Viewing key granted on-chain.");
      } else {
        alert("Viewing key generated. Deploy ComplianceModule to grant on-chain.");
      }
    } catch (error) {
      console.error("Viewing key generation error:", error);
      alert("Failed to generate or grant viewing key");
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Compliance & Auditing</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Auditor Address</label>
          <input
            type="text"
            value={auditorAddress}
            onChange={(e) => setAuditorAddress(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Employee Addresses (comma-separated)</label>
          <input
            type="text"
            value={employeeAddresses}
            onChange={(e) => setEmployeeAddresses(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="0x..., 0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Time Range Start (timestamp, optional)</label>
          <input
            type="number"
            value={timeRangeStart}
            onChange={(e) => setTimeRangeStart(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Unix timestamp"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Time Range End (timestamp, optional)</label>
          <input
            type="number"
            value={timeRangeEnd}
            onChange={(e) => setTimeRangeEnd(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Unix timestamp"
          />
        </div>

        <Button onClick={handleGrantViewingKey} disabled={isGranting} className="w-full">
          {isGranting ? "Granting..." : hasContract ? "Generate & Grant on-chain" : "Generate Viewing Key"}
        </Button>

        {viewingKey && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded">
            <p className="text-sm font-medium mb-2">Viewing Key Generated:</p>
            <p className="text-xs font-mono break-all">{viewingKey}</p>
          </div>
        )}
      </div>
    </div>
  );
}
