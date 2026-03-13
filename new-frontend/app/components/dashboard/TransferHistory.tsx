import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "../../stores/dashboardStore";
import { Lock, EyeOff, Download, Filter } from "lucide-react";

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
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--text-muted)]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] w-48 focus-ring"
          >
            <option value="all">All Transfers</option>
            <option value="private">Confidential Only</option>
            <option value="standard">Standard Only</option>
          </select>
        </div>
        <button className="btn-secondary text-[12px]">
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-glass overflow-hidden"
      >
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
              {filtered.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="table-row"
                >
                  <td className="text-[var(--text-muted)] text-[12px]">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="font-medium text-[var(--text-primary)]">
                    {tx.employeeName}
                  </td>
                  <td className="font-mono text-[var(--text-secondary)]">
                    {tx.amount.toFixed(2)} ETH
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-[12px]">
                      <div
                        className={`status-dot ${
                          tx.status === "completed"
                            ? "status-dot-success"
                            : tx.status === "pending"
                              ? "status-dot-pending"
                              : "status-dot-error"
                        }`}
                      />
                      <span className="capitalize text-[var(--text-muted)]">
                        {tx.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    {tx.type === "tongo_private" ? (
                      <span className="privacy-badge text-[10px] py-0.5 px-2">
                        <EyeOff size={9} /> Private
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)] text-[12px]">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="font-mono text-[11px]">
                    {tx.txHash ? (
                      tx.txHash.startsWith("0xMOCK_") ? (
                        <span
                          className="text-[var(--text-muted)] opacity-50 cursor-default"
                          title={tx.txHash}
                        >
                          Mock...{tx.txHash.slice(-4)}
                        </span>
                      ) : (
                        <a
                          href={`https://sepolia.starkscan.co/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--accent-cyan)] hover:underline opacity-80 hover:opacity-100 transition-opacity"
                        >
                          {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                        </a>
                      )
                    ) : (
                      <span className="text-[var(--text-muted)] opacity-50">
                        --
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-16 text-center text-[var(--text-muted)] flex flex-col items-center gap-2">
              <Lock size={20} className="opacity-30" />
              No transfers found.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
