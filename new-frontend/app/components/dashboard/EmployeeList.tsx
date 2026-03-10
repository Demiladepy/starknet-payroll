import React, { useState } from "react";
import { useDashboardStore } from "../../stores/dashboardStore";

export default function EmployeeList() {
  const { employees } = useDashboardStore();
  const [search, setSearch] = useState("");

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Filter employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border border-[var(--border)] rounded-[6px] px-3 py-1.5 text-[13px] w-64 focus-ring placeholder:text-[var(--text-muted)]"
        />
        <button className="btn-secondary">
          Add Employee
        </button>
      </div>

      <div className="card-fintech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th>Name</th>
                <th>Role</th>
                <th>Salary</th>
                <th>Address</th>
                <th>Privacy Key</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="table-row group">
                  <td>
                    <div className="font-medium text-[var(--text-primary)]">{emp.name}</div>
                    <div className="text-[12px] text-[var(--text-muted)]">{emp.department}</div>
                  </td>
                  <td className="text-[var(--text-secondary)]">{emp.role}</td>
                  <td className="font-mono text-[var(--text-secondary)]">{emp.salary.toFixed(2)} ETH</td>
                  <td className="font-mono text-[var(--text-muted)] text-[12px]">
                    {emp.walletAddress.slice(0, 6)}...{emp.walletAddress.slice(-4)}
                  </td>
                  <td>
                    {emp.tongoPublicKey ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                        <span className="text-[var(--text-muted)]">Set</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-pending)] opacity-50" />
                        <span className="text-[var(--text-muted)] opacity-50">Missing</span>
                      </div>
                    )}
                  </td>
                  <td className="text-right">
                    <button className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-[var(--text-muted)]">No employees found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
