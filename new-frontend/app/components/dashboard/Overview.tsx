import React from "react";
import { useDashboardStore } from "../../stores/dashboardStore";

export default function Overview({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { employees, transfers } = useDashboardStore();

  const totalEmployees = employees.length;
  const totalPaid = transfers
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transfers.filter((t) => t.status === "pending").length;
  const privacyRate = transfers.length
    ? Math.round(
        (transfers.filter((t) => t.type === "tongo_private").length / transfers.length) * 100
      )
    : 0;

  const recentTransfers = transfers.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stat cards - engineered restraint, no emojis */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card-fintech p-5">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] mb-2">Total Employees</div>
          <div className="stat-number">{totalEmployees}</div>
        </div>
        <div className="card-fintech p-5">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] mb-2">Total Paid (ETH)</div>
          <div className="stat-number">{totalPaid.toFixed(2)}</div>
        </div>
        <div className="card-fintech p-5">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] mb-2">Pending</div>
          <div className="stat-number text-[var(--status-pending)]">{pendingCount}</div>
        </div>
        <div className="card-fintech p-5 md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-5 opacity-10 font-mono text-6xl select-none">%</div>
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--accent)] mb-1">Privacy Rate</div>
          <div className="stat-number text-[var(--accent)]">{privacyRate}%</div>
          <div className="text-[11px] text-[var(--text-muted)]">confidential</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onNavigate("new_transfer")}
          className="btn-primary"
        >
          New Transfer
        </button>
        <button
          onClick={() => onNavigate("employees")}
          className="btn-secondary"
        >
          Manage Employees
        </button>
      </div>

      {/* Recent Transfers */}
      <div className="card-fintech overflow-hidden">
        <div className="p-5 border-b border-[var(--border)]">
          <h3 className="font-heading text-[14px]">Recent Transfers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th>Employee</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransfers.map((tx) => (
                <tr key={tx.id} className="table-row">
                  <td className="font-medium text-[var(--text-primary)]">{tx.employeeName}</td>
                  <td className="font-mono text-[var(--text-secondary)]">{tx.amount.toFixed(2)} ETH</td>
                  <td>
                    <div className="flex items-center gap-2">
                       {tx.status === "completed" && <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />}
                       {tx.status === "pending" && <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-pending)]" />}
                       {tx.status === "failed" && <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-error)]" />}
                       <span className="capitalize text-[var(--text-muted)]">{tx.status}</span>
                    </div>
                  </td>
                  <td className="text-[var(--text-muted)]">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentTransfers.length === 0 && (
            <div className="p-8 text-center text-[var(--text-muted)]">No recent transfers.</div>
          )}
        </div>
      </div>
    </div>
  );
}
