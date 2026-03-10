import React, { useState } from "react";
import { useDashboardStore } from "../../stores/dashboardStore";

export default function TransferHistory() {
  const { transfers } = useDashboardStore();
  const [filter, setFilter] = useState("all");

  const filtered = transfers.filter((t) => {
    if (filter === "all") return true;
    if (filter === "private") return t.type === "tongo_private";
    if (filter === "standard") return t.type === "standard";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#131825] border border-white/10 rounded-lg px-4 py-2 text-sm w-48 text-white focus-ring"
        >
          <option value="all">All Transfers</option>
          <option value="private">Private (Tongo)</option>
          <option value="standard">Standard</option>
        </select>
        <button className="btn-fintech-primary px-4 py-2 text-sm flex items-center gap-2">
          <span>⬇️</span> Export CSV
        </button>
      </div>

      <div className="card-fintech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#131825]/50 border-b border-white/5 text-xs uppercase text-[#64748B] font-semibold">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Note</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 text-[#94A3B8]">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 font-medium">{tx.employeeName}</td>
                  <td className="px-5 py-4 font-mono">{tx.amount.toFixed(2)} ETH</td>
                  <td className="px-5 py-4 text-[#94A3B8]">{tx.note || "-"}</td>
                  <td className="px-5 py-4">
                    {tx.type === "tongo_private" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 text-xs font-medium border border-teal-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                        🔒 Private
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-[#94A3B8] text-xs font-medium border border-white/10">
                        📤 Standard
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`capitalize inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${
                        tx.status === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : tx.status === "pending"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs">
                    {tx.txHash ? (
                      tx.txHash.startsWith("0xMOCK_") ? (
                        <span className="text-[#64748B]">{tx.txHash.slice(0, 16)}...</span>
                      ) : (
                        <a
                          href={`https://sepolia.starkscan.co/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#00E5CC] hover:underline"
                        >
                          {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                        </a>
                      )
                    ) : (
                      <span className="text-[#64748B]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-[#64748B]">No transfers found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
