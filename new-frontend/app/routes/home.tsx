import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  LayoutDashboard,
  Zap,
  ArrowRight,
  Wallet,
  Lock,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";

export function meta() {
  return [
    { title: "Private Payroll for the Onchain Era" },
    {
      name: "description",
      content:
        "Privacy-first payroll on Starknet. Pay salaries with optional encrypted (Tongo) transfers. Connect with Argent X, Braavos, or Sign in with Starkzap.",
    },
  ];
}

/** Lazy-loaded so wallet/Starkzap hooks only run in browser (providers are skipped during SSR). */
function HomeHeroCTAsSafe() {
  const [ClientCTAs, setClientCTAs] = useState<React.ComponentType | null>(null);
  useEffect(() => {
    import("./HomeHeroCTAs.client").then((m) => setClientCTAs(() => m.HomeHeroCTAs));
  }, []);
  if (!ClientCTAs) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link to="/dashboard">
          <Button size="lg" className="min-w-[180px] btn-fintech-primary">
            <LayoutDashboard className="size-5 mr-2" />
            Open Dashboard
          </Button>
        </Link>
      </div>
    );
  }
  return <ClientCTAs />;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-card)] bg-[var(--bg-secondary)]/80 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-heading font-bold text-lg text-[var(--accent-teal)]">
            Private Payroll
          </span>
          <nav className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-[var(--text-secondary)] hover:text-[var(--accent-teal)] text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="btn-fintech-primary">
                Open Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-16 sm:py-24">
        {/* Hero */}
        <section className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-[var(--text-primary)]">
            Private Payroll for the Onchain Era
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Companies leak salary data on public blockchains. We fix that. Pay salaries with optional{" "}
            <span className="text-[var(--accent-teal)] font-medium">encrypted (Tongo) transfers</span> so amounts stay private.
          </p>
          <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto">
            Connect with Argent X or Braavos, or Sign in with Starkzap. Manage employees and send payments from one dashboard.
          </p>
          <HomeHeroCTAsSafe />
        </section>

        {/* Features — 3 cols */}
        <section className="mt-20 w-full max-w-5xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-center text-[var(--text-primary)] mb-10">
            Why Private Payroll
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card-fintech p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[var(--accent-teal)]/20 text-[var(--accent-teal)]">
                  <Lock className="size-5" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)]">Private Transfers</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Use Tongo to encrypt transfer amounts on-chain. Only sender and recipient see the value — perfect for payroll.
              </p>
            </div>
            <div className="card-fintech p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-[var(--accent-amber)]">
                  <Zap className="size-5" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)]">Starkzap Integration</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Sign in with Starkzap for a streamlined experience. Swap and send from one session.
              </p>
            </div>
            <div className="card-fintech p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <BarChart3 className="size-5" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)]">Company Dashboard</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Add employees, track transfers, and run payroll. All in one place with full history.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-20 w-full max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-center text-[var(--text-primary)] mb-10">
            How It Works
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start card-fintech p-4 rounded-xl">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-teal)]/20 text-[var(--accent-teal)] font-bold flex items-center justify-center">1</span>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Connect your wallet</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Use Argent X, Braavos, or Sign in with Starkzap to access the dashboard.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start card-fintech p-4 rounded-xl">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-teal)]/20 text-[var(--accent-teal)] font-bold flex items-center justify-center">2</span>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Add employees</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Add team members with wallet addresses and optional Tongo keys for private payments.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start card-fintech p-4 rounded-xl">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-teal)]/20 text-[var(--accent-teal)] font-bold flex items-center justify-center">3</span>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Pay privately</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Send salaries via the 4-step wizard. When Tongo is configured, amounts are encrypted on-chain.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 flex justify-center">
          <Link to="/dashboard">
            <Button size="lg" className="btn-fintech-primary">
              Go to Dashboard
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-[var(--border-card)] py-6 text-center text-sm text-[var(--text-muted)]">
        Privacy-First Payroll on Starknet · Tongo & Starkzap
      </footer>
    </div>
  );
}
