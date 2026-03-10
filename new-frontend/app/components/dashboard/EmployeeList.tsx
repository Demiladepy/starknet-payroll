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
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#131825] border border-white/10 rounded-lg px-4 py-2 text-sm w-64 focus-ring"
        />
        <button className="btn-fintech-primary px-4 py-2 text-sm flex items-center gap-2">
          <span>+</span> Add Employee
        </button>
      </div>

      <div className="card-fintech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#131825]/50 border-b border-white/5 text-xs uppercase text-[#64748B] font-semibold">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Salary</th>
                <th className="px-5 py-3">Wallet</th>
                <th className="px-5 py-3">Privacy Key</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{emp.name}</div>
                    <div className="text-xs text-[#94A3B8]">{emp.department}</div>
                  </td>
                  <td className="px-5 py-4 text-[#94A3B8]">{emp.role}</td>
                  <td className="px-5 py-4 font-mono">{emp.salary.toFixed(2)} ETH</td>
                  <td className="px-5 py-4 font-mono text-[#94A3B8]">
                    {emp.walletAddress.slice(0, 6)}...{emp.walletAddress.slice(-4)}
                  </td>
                  <td className="px-5 py-4">
                    {emp.tongoPublicKey ? (
                      <span className="text-teal-400 text-xs bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20">
                        🔒 Configured
                      </span>
                    ) : (
                      <span className="text-amber-400 text-xs bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                        ⚠️ Missing
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-[#94A3B8] hover:text-white transition px-2">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-[#64748B]">No employees found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
