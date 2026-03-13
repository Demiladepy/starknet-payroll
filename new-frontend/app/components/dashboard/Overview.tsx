import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "../../stores/dashboardStore";
import { Shield, TrendingUp, Clock, EyeOff } from "lucide-react";

/* Animated counter */
function AnimatedNumber({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const dur = 1200;
    const start = performance.now();
    const from = 0;
    const step = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * ease);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display.toFixed(decimals)}{suffix}</>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  }),
};

export default function Overview({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { employees, transfers } = useDashboardStore();

  const totalEmployees = employees.length;
  const totalPaid = transfers.filter((t) => t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const pendingCount = transfers.filter((t) => t.status === "pending").length;
  const privacyRate = transfers.length
    ? Math.round((transfers.filter((t) => t.type === "tongo_private").length / transfers.length) * 100)
    : 0;

  const recentTransfers = transfers.slice(0, 5);

  const stats = [
    {
      label: "Total Employees",
      value: totalEmployees,
      decimals: 0,
      icon: Shield,
      color: "var(--accent-cyan)",
      glow: "rgba(0,212,255,0.08)",
    },
    {
      label: "Total Paid (ETH)",
      value: totalPaid,
      decimals: 2,
      icon: TrendingUp,
      color: "var(--accent-purple)",
      glow: "rgba(139,92,246,0.08)",
    },
    {
      label: "Pending",
      value: pendingCount,
      decimals: 0,
      icon: Clock,
      color: "var(--status-pending)",
      glow: "rgba(240,180,41,0.08)",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="card-3d"
          >
            <div
              className="card-3d-inner card-glass p-6 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${s.glow}, var(--bg-glass))` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] font-medium">
                  {s.label}
                </div>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}
                >
                  <s.icon size={14} style={{ color: s.color }} strokeWidth={1.5} />
                </div>
              </div>
              <div className="stat-number" style={{ color: s.color }}>
                <AnimatedNumber value={s.value} decimals={s.decimals} />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Privacy rate — special card */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="card-3d"
        >
          <div
            className="card-3d-inner p-6 rounded-xl relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(62,207,142,0.08), var(--bg-glass))",
              border: "1px solid var(--privacy-border)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--privacy)] font-semibold">
                Privacy Rate
              </div>
              <div className="privacy-badge privacy-badge-glow">
                <EyeOff size={10} />
                <span>Encrypted</span>
              </div>
            </div>
            <div className="stat-number text-[var(--privacy)]">
              <AnimatedNumber value={privacyRate} suffix="%" />
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">
              of transfers are confidential
            </div>
            {/* Decorative glow */}
            <div
              className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, var(--privacy), transparent)" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex gap-3"
      >
        <button onClick={() => onNavigate("new_transfer")} className="btn-primary">
          New Transfer
        </button>
        <button onClick={() => onNavigate("employees")} className="btn-secondary">
          Manage Employees
        </button>
      </motion.div>

      {/* Recent Transfers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="card-glass overflow-hidden"
      >
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-heading text-[14px]">Recent Transfers</h3>
          <button
            onClick={() => onNavigate("transfers")}
            className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th>Employee</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Path</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransfers.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="table-row"
                >
                  <td className="font-medium text-[var(--text-primary)]">{tx.employeeName}</td>
                  <td className="font-mono text-[var(--text-secondary)]">{tx.amount.toFixed(2)} ETH</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className={`status-dot ${
                          tx.status === "completed"
                            ? "status-dot-success"
                            : tx.status === "pending"
                              ? "status-dot-pending"
                              : "status-dot-error"
                        }`}
                      />
                      <span className="capitalize text-[var(--text-muted)] text-[12px]">{tx.status}</span>
                    </div>
                  </td>
                  <td>
                    {tx.type === "tongo_private" ? (
                      <span className="privacy-badge text-[10px] py-0.5 px-2">
                        <EyeOff size={9} /> Private
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)] text-[12px]">Standard</span>
                    )}
                  </td>
                  <td className="text-[var(--text-muted)] text-[12px]">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {recentTransfers.length === 0 && (
            <div className="p-12 text-center text-[var(--text-muted)]">No recent transfers.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
