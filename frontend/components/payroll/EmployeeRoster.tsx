"use client";

import { useState } from "react";
import { usePayrollStore } from "@/store/payroll-store";
import { formatAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function EmployeeRoster() {
  const { employees } = usePayrollStore();
  const [exported, setExported] = useState(false);

  const exportCsv = () => {
    const headers = ["Alias", "Address", "Status", "Last Paid"];
    const rows = employees.map((e) => [
      e.alias || "",
      e.address,
      e.active ? "Active" : "Inactive",
      e.lastPaid > 0 ? new Date(e.lastPaid * 1000).toISOString() : "Never",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Your team</h2>
        {employees.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportCsv}>
            {exported ? "Exported" : "Export CSV"}
          </Button>
        )}
      </div>
      {employees.length === 0 ? (
        <p className="text-[var(--muted)] text-sm">No employees added yet. Add your first employee below.</p>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Name / Alias</th>
                <th className="text-left p-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Wallet</th>
                <th className="text-left p-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Status</th>
                <th className="text-left p-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Last paid</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.address} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-3 text-sm text-[var(--foreground)]">{employee.alias || "—"}</td>
                  <td className="p-3 font-mono text-xs text-[var(--muted)]">{formatAddress(employee.address)}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      employee.active ? "bg-[var(--accent-light)] text-[var(--accent)]" : "bg-[var(--section)] text-[var(--muted)]"
                    }`}>
                      {employee.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-[var(--muted)]">
                    {employee.lastPaid > 0
                      ? new Date(employee.lastPaid * 1000).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
