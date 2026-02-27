import { useState } from "react";
import { Link } from "react-router";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Modal } from "~/components/ui/modal";
import {
  Building2,
  Wallet,
  LogOut,
  Send,
  Coins,
} from "lucide-react";
import { cn } from "~/lib/utils";

export function meta() {
  return [
    { title: "Dashboard · Private Payroll" },
    { name: "description", content: "Company or employee dashboard" },
  ];
}

type ViewMode = "company" | "employee";

export default function Dashboard() {
  const navigate = useNavigate();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [viewMode, setViewMode] = useState<ViewMode>("company");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Placeholder: in real app, detect role from contract or API
  const isCompany = viewMode === "company";

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse text-slate-500 dark:text-slate-400">
          Loading…
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-slate-50 dark:bg-slate-950">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Sign in to open the dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
          Use Privy to sign in, then connect your Argent wallet to run payroll
          or view your balance.
        </p>
        <Button size="lg" onClick={login}>
          Sign in
        </Button>
        <Link to="/">
          <Button variant="ghost">Back to home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="font-semibold text-brand-600 dark:text-brand-400 text-lg"
          >
            Private Payroll
          </Link>
          <nav className="flex items-center gap-3">
            <div className="flex rounded-none border border-slate-200 dark:border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("company")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors rounded-none",
                  isCompany
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Company
              </button>
              <button
                type="button"
                onClick={() => setViewMode("employee")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors rounded-none",
                  !isCompany
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Employee
              </button>
            </div>
            {!isConnected ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Connect Argent
                </span>
                <Button
                  size="sm"
                  onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                  disabled={connectors.length === 0}
                >
                  <Wallet className="size-4 mr-1" />
                  Connect
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                  {address?.slice(0, 6)}…{address?.slice(-4)}
                </span>
                <Button variant="ghost" size="icon" onClick={() => disconnect()}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              Log out
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {isCompany ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Company dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Execute a private transfer to a whitelisted employee.
              </p>
            </div>
            <Card className="max-w-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5" />
                  Employees
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedEmployee("0x1234…abcd");
                    setTransferModalOpen(true);
                  }}
                  disabled={!isConnected}
                >
                  <Send className="size-4 mr-1" />
                  Private transfer
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Whitelisted employees will appear here. Select one and execute a
                  private transfer (Tongo).
                </p>
                <ul className="space-y-2">
                  {[
                    "0x1234…abcd (placeholder)",
                    "0x5678…ef01 (placeholder)",
                  ].map((addr) => (
                    <li
                      key={addr}
                      className="flex items-center justify-between py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-none"
                    >
                      <span className="font-mono text-sm">{addr}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(addr);
                          setTransferModalOpen(true);
                        }}
                        disabled={!isConnected}
                      >
                        Pay
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Employee dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Your private balance. Updates when the company sends a payment.
              </p>
            </div>
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="size-5" />
                  Your balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  — TONGO
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Connect your wallet and decrypt with your Tongo key to see your
                  balance. Payments from the company will appear here.
                </p>
                {!isConnected && (
                  <Button
                    className="mt-4"
                    onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                    disabled={connectors.length === 0}
                  >
                    <Wallet className="size-4 mr-2" />
                    Connect Argent wallet
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Animated modal: Execute private transfer */}
      <Modal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Execute private transfer"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Send a private payment to{" "}
            <span className="font-mono">{selectedEmployee ?? "—"}</span> using
            Tongo. Amount will be encrypted on-chain.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setTransferModalOpen(false)}>
              Confirm (placeholder)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
