"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/wallet/WalletConnect";

type Context = "company" | "employee";

export function DashboardNav({ context }: { context: Context }) {
  return (
    <nav className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-[var(--foreground)]">
            Starknet Payroll
          </Link>
          <div className="hidden sm:flex gap-6">
            <Link
              href="/company/dashboard"
              className={`text-sm font-medium ${
                context === "company"
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Company
            </Link>
            <Link
              href="/employee/dashboard"
              className={`text-sm font-medium ${
                context === "employee"
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Employee portal
            </Link>
          </div>
        </div>
        <WalletConnect />
      </div>
    </nav>
  );
}
