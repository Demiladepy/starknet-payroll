import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Shield, Zap, Wallet } from "lucide-react";

export function meta() {
  return [
    { title: "Private Payroll on Starknet" },
    {
      name: "description",
      content:
        "Confidential payroll and private transfers with Tongo on Starknet. Company or employee dashboard.",
    },
  ];
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-brand-600 dark:text-brand-400 text-lg">
            Private Payroll
          </span>
          <nav className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link to="/dashboard">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Confidential payroll & private transfers on{" "}
            <span className="text-brand-600 dark:text-brand-400">Starknet</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Pay employees with hidden amounts using Tongo. Connect your Argent
            wallet, sign in, and run payroll or view your balance—privately.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="min-w-[160px]">
                Open Dashboard
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="min-w-[160px]">
                Connect wallet
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            {
              icon: Shield,
              title: "Private amounts",
              text: "Salaries and transfers are encrypted on-chain with Tongo.",
            },
            {
              icon: Zap,
              title: "Company or employee",
              text: "One dashboard: run payroll or view your balance.",
            },
            {
              icon: Wallet,
              title: "Argent wallet",
              text: "Sign in with Privy, then connect your Argent wallet.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-left shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                  <Icon className="size-5" />
                </div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Private Payroll · Starknet · Tongo
      </footer>
    </div>
  );
}
