import React, { useState } from "react";
import { useDashboardStore } from "../../stores/dashboardStore";
import { Lock } from "lucide-react";

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
          className="bg-transparent border border-[var(--border)] rounded-[6px] px-3 py-1.5 text-[13px] text-[var(--text-primary)] w-48 focus-ring"
        >
          <option value="all">All Transfers</option>
          <option value="private">Private (Tongo)</option>
          <option value="standard">Standard</option>
        </select>
        <button className="btn-secondary">
          Export CSV
        </button>
      </div>

      <div className="card-fintech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th>Date</th>
                <th>Employee</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Path</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="table-row">
                  <td className="text-[var(--text-muted)] text-[12px]">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                  <td className="font-medium text-[var(--text-primary)]">{tx.employeeName}</td>
                  <td className="font-mono text-[var(--text-secondary)]">{tx.amount.toFixed(2)} ETH</td>
                  
                  <td>
                    <div className="flex items-center gap-2 text-[12px]">
                       {tx.status === "completed" && <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />}
                       {tx.status === "pending" && <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-pending)]" />}
                       {tx.status === "failed" && <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-error)]" />}
                       <span className="capitalize text-[var(--text-muted)]">{tx.status}</span>
                    </div>
                  </td>

                  <td>
                    {tx.type === "tongo_private" ? (
                      <Lock size={12} className="text-[var(--accent)]" />
                    ) : (
                      <span className="text-[var(--text-muted)] opacity-50">-</span>
                    )}
                  </td>
                  
                  <td className="font-mono text-[11px]">
                    {tx.txHash ? (
                      tx.txHash.startsWith("0xMOCK_") ? (
                        <span className="text-[var(--text-muted)] opacity-50 cursor-default" title={tx.txHash}>
                          Mock...{tx.txHash.slice(-4)}
                        </span>
                      ) : (
                        <a
                          href={`https://sepolia.starkscan.co/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
                        >
                          {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                        </a>
                      )
                    ) : (
                      <span className="text-[var(--text-muted)] opacity-50">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-[var(--text-muted)] flex flex-col items-center">
              No transfers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
