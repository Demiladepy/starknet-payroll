import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "../../stores/dashboardStore";
import type { Employee } from "../../stores/dashboardStore";
import { isValidTongoPublicKey } from "../../lib/tongo";
import { Lock, Plus, X, Search, EyeOff } from "lucide-react";

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
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm({}); };

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
        name, role,
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
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Filter employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-[13px] w-72 focus-ring placeholder:text-[var(--text-muted)]"
          />
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={14} /> Add Employee
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
              className="card-glass p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-semibold">{editingId ? "Edit Employee" : "Add Employee"}</h3>
                <button onClick={closeModal} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition p-1">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { key: "name", label: "Name", type: "text", placeholder: "Full name" },
                  { key: "role", label: "Role", type: "text", placeholder: "e.g. Senior Engineer" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
                    <input
                      value={(form as any)[key] ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[13px] focus-ring"
                      placeholder={placeholder}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">Department</label>
                  <select
                    value={form.department ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[13px] focus-ring"
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">Salary (ETH)</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={form.salary ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, salary: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[13px] font-mono focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">Wallet Address</label>
                  <input
                    value={form.walletAddress ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[12px] font-mono focus-ring"
                    placeholder="0x..."
                  />
                </div>

                <div className="pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="block text-[12px] font-medium text-[var(--text-secondary)]">Tongo Public Key</label>
                    <span className="privacy-badge text-[9px] py-0 px-1.5">
                      <EyeOff size={8} /> Privacy
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mb-2">
                    Required for confidential salary payments.
                  </p>
                  <input
                    value={form.tongoPublicKey ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, tongoPublicKey: e.target.value }))}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[12px] font-mono focus-ring"
                    placeholder="0x..."
                  />
                  {(form.tongoPublicKey ?? "").trim() && !isValidTongoPublicKey((form.tongoPublicKey ?? "").trim()) && (
                    <p className="text-[11px] text-[var(--status-error)] mt-1.5">Invalid Tongo public key format</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button className="btn-primary flex-1" onClick={submitEmployee}>
                  {editingId ? "Save Changes" : "Add Employee"}
                </button>
                <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <th>Name</th>
                <th>Role</th>
                <th>Salary</th>
                <th>Address</th>
                <th>Privacy</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="table-row group"
                >
                  <td>
                    <div className="font-medium text-[var(--text-primary)]">{emp.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{emp.department}</div>
                  </td>
                  <td className="text-[var(--text-secondary)]">{emp.role}</td>
                  <td className="font-mono text-[var(--text-secondary)]">{emp.salary.toFixed(2)} ETH</td>
                  <td className="font-mono text-[var(--text-muted)] text-[12px]">
                    {emp.walletAddress.slice(0, 6)}...{emp.walletAddress.slice(-4)}
                  </td>
                  <td>
                    {emp.tongoPublicKey ? (
                      <span className="privacy-badge text-[10px] py-0.5 px-2">
                        <Lock size={9} /> Enabled
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)] text-[12px]">--</span>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
                      onClick={() => openEdit(emp)}
                    >
                      Edit
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-16 text-center text-[var(--text-muted)]">No employees found.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
