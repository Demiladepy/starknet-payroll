import React, { useState } from "react";
import { useDashboardStore } from "../../stores/dashboardStore";
import type { Employee } from "../../stores/dashboardStore";
import { isValidTongoPublicKey } from "../../lib/tongo";
import { Lock } from "lucide-react";

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "HR"];

export default function EmployeeList() {
  const { employees, addEmployee, updateEmployee } = useDashboardStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({});

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", role: "", department: "Engineering", salary: 0, walletAddress: "", tongoPublicKey: "" });
    setModalOpen(true);
  };
  const openEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({ ...emp });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({});
  };

  const submitEmployee = () => {
    const tongoKey = (form.tongoPublicKey ?? "").trim();
    if (tongoKey && !isValidTongoPublicKey(tongoKey)) return;
    const name = (form.name ?? "").trim();
    const role = (form.role ?? "").trim();
    const walletAddress = (form.walletAddress ?? "").trim();
    if (!name || !role || !walletAddress) return;
    if (editingId) {
      updateEmployee(editingId, { ...form, name, role, walletAddress, tongoPublicKey: tongoKey || undefined });
    } else {
      addEmployee({
        id: crypto.randomUUID(),
        name,
        role,
        department: form.department ?? "Engineering",
        salary: form.salary ?? 0,
        walletAddress,
        tongoPublicKey: tongoKey || undefined,
        createdAt: new Date().toISOString(),
      });
    }
    closeModal();
  };

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
        <button className="btn-secondary" onClick={openAdd}>
          Add Employee
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeModal}>
          <div className="card-fintech p-8 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[14px] font-medium mb-6">{editingId ? "Edit employee" : "Add employee"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Name</label>
                <input
                  value={form.name ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[6px] px-3 py-2 text-[13px]"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Role</label>
                <input
                  value={form.role ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[6px] px-3 py-2 text-[13px]"
                  placeholder="e.g. Senior Engineer"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Department</label>
                <select
                  value={form.department ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[6px] px-3 py-2 text-[13px]"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Salary (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.salary ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, salary: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[6px] px-3 py-2 text-[13px] font-mono"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Wallet address</label>
                <input
                  value={form.walletAddress ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[6px] px-3 py-2 text-[12px] font-mono"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Tongo public key</label>
                <p className="text-[11px] text-[var(--text-muted)] mb-1">
                  Required for confidential salary payments. The employee generates this from their Tongo private key.
                </p>
                <input
                  value={form.tongoPublicKey ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, tongoPublicKey: e.target.value }))}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[6px] px-3 py-2 text-[12px] font-mono"
                  placeholder="0x..."
                />
                {(form.tongoPublicKey ?? "").trim() && !isValidTongoPublicKey((form.tongoPublicKey ?? "").trim()) && (
                  <p className="text-[11px] text-[var(--status-error)] mt-1">Invalid Tongo public key format</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-primary flex-1" onClick={submitEmployee}>
                {editingId ? "Save" : "Add"}
              </button>
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
                      <span className="inline-flex items-center gap-1.5" title="Confidential transfers enabled">
                        <Lock size={12} className="text-[var(--accent)] shrink-0" />
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                      onClick={() => openEdit(emp)}
                    >
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
