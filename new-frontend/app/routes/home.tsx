import React from "react";
import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Minimal Topbar */}
      <nav className="h-[52px] border-b border-[var(--border)] flex items-center justify-between px-6">
        <div className="text-[14px] font-semibold tracking-tight">StarkPayroll</div>
        <Link
          to="/dashboard"
          className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        >
          Dashboard
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1100px] mx-auto px-8 pt-32 pb-24">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          {/* Left 60% */}
          <div className="flex-1 md:max-w-[60%] space-y-8">
            <h1 className="text-[48px] leading-[1.1] font-semibold tracking-tight">
              Payroll without the public ledger
            </h1>
            <p className="text-[16px] text-[var(--text-secondary)] max-w-[400px] leading-relaxed">
              Companies leak salary data on public blockchains. We fix that. Pay your employees with standard or fully confidential transfers using ElGamal encryption.
            </p>
            <div className="flex flex-col gap-3 w-fit">
              <Link to="/dashboard" className="w-full">
                <span className="btn-primary w-full">Open Dashboard</span>
              </Link>
              <Link to="/dashboard" className="w-full">
                <span className="btn-secondary w-full">Connect Wallet</span>
              </Link>
              <Link to="/dashboard" className="w-full">
                <span className="btn-secondary w-full">Starkzap</span>
              </Link>
            </div>
          </div>

          {/* Right 40% - Abstract Grid Visualization */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className="grid grid-cols-6 gap-3 opacity-80">
              {Array.from({ length: 36 }).map((_, i) => {
                const isLocked = [7, 14, 16, 22, 28].includes(i);
                return (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      isLocked ? "bg-[var(--accent)]" : "bg-[var(--text-muted)] opacity-30"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Feature Blocks - Staggered */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-32">
        <div className="max-w-[1100px] mx-auto px-8 space-y-32">
          {/* Feature 1 */}
          <div className="md:w-[60%] space-y-4">
            <div className="text-[11px] font-semibold tracking-[0.06em] text-[var(--accent)]">CONFIDENTIAL</div>
            <h3 className="text-[18px] font-medium text-[var(--text-primary)]">Private Transfers</h3>
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              Powered by Tongo protocol. Salaries are encrypted. The amounts and history are hidden securely on Starknet, protecting both company treasury data and employee privacy.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="md:w-[60%] space-y-4 md:ml-auto">
            <div className="text-[11px] font-semibold tracking-[0.06em] text-[var(--accent)]">FRICTIONLESS</div>
            <h3 className="text-[18px] font-medium text-[var(--text-primary)]">StarkZap Integration</h3>
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              Sign in without a browser extension. Create deterministically generated smart accounts instantly, smoothing the onboarding path for non-crypto natives.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="md:w-[60%] space-y-4">
            <div className="text-[11px] font-semibold tracking-[0.06em] text-[var(--accent)]">STREAMLINED</div>
            <h3 className="text-[18px] font-medium text-[var(--text-primary)]">Minimal Dashboard</h3>
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              Manage employees, track history, and initiate payroll with engineered restraint. Designed for high density, speed, and precision execution.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-[12px] text-[var(--text-muted)] border-t border-[var(--border)]">
        Built on Starknet. Encrypted by Tongo. Connected by StarkZap.
      </footer>
    </div>
  );
}
