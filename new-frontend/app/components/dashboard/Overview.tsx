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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-fintech p-5">
          <div className="text-[#94A3B8] text-sm font-medium mb-1">Total Employees</div>
          <div className="text-3xl font-bold font-heading">{totalEmployees}</div>
        </div>
        <div className="card-fintech p-5">
          <div className="text-[#94A3B8] text-sm font-medium mb-1">Total Paid (ETH)</div>
          <div className="text-3xl font-bold font-heading">{totalPaid.toFixed(2)}</div>
        </div>
        <div className="card-fintech p-5">
          <div className="text-[#94A3B8] text-sm font-medium mb-1">Pending Transfers</div>
          <div className="text-3xl font-bold font-heading">{pendingCount}</div>
        </div>
        <div className="card-fintech p-5">
          <div className="text-[#94A3B8] text-sm font-medium mb-1">Privacy Rate</div>
          <div className="text-3xl font-bold font-heading text-[#00E5CC]">{privacyRate}%</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => onNavigate("new_transfer")}
          className="btn-fintech-primary px-6 py-2.5 flex items-center gap-2 text-sm"
        >
          <span>💸</span> New Transfer
        </button>
        <button
          onClick={() => onNavigate("employees")}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm transition"
        >
          <span>👥</span> Manage Employees
        </button>
      </div>

      {/* Recent Transfers */}
      <div className="card-fintech overflow-hidden">
        <div className="p-5 border-b border-white/5 font-heading font-semibold">
          Recent Transfers
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#131825]/50 border-b border-white/5 text-xs uppercase text-[#64748B] font-semibold">
              <tr>
                <th className="px-5 py-3 rounded-tl-xl">Employee</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {recentTransfers.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium">{tx.employeeName}</td>
                  <td className="px-5 py-4 font-mono">{tx.amount.toFixed(2)} ETH</td>
                  <td className="px-5 py-4">
                    {tx.type === "tongo_private" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                        🔒 Private
                      </span>
                    ) : (
                      <span className="text-[#94A3B8]">Standard</span>
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
                  <td className="px-5 py-4 text-[#94A3B8]">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentTransfers.length === 0 && (
            <div className="p-8 text-center text-[#64748B]">No recent transfers.</div>
          )}
        </div>
      </div>
    </div>
  );
}
