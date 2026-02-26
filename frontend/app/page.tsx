import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--hero-bg)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-4">
            Starknet Payroll
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] tracking-tight max-w-4xl mx-auto mb-6">
            Low cost crypto payroll solution
          </h1>
          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10">
            Modernize your business and attract top talent by paying employees in crypto on Starknet.
            Enjoy blockchain payments without an intermediary. No technical knowledge required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/company/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] text-white font-semibold px-8 py-4 shadow-sm hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
            <Link
              href="/employee/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--card)] text-[var(--foreground)] font-semibold px-8 py-4 border-2 border-[var(--border)] hover:bg-[var(--section)] transition-colors"
            >
              Employee portal
            </Link>
          </div>
        </div>
      </section>

      {/* Subhead */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center border-b border-[var(--border)]">
        <p className="text-[var(--muted)] text-lg">
          A simple, secure solution for paying your team with STRK, ETH, and stablecoins on Starknet.
          Low fees, no hidden costs.
        </p>
      </section>

      {/* Feature grid - BitPay style */}
      <section className="py-16 sm:py-24 bg-[var(--section)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Never touch crypto"
              description="Pay employees in crypto without holding or managing crypto yourself. Fund in fiat or crypto; we handle the rest."
            />
            <FeatureCard
              title="Automated payroll"
              description="Pay crypto to employees on schedule via smart contract. Weekly, biweekly, or monthly—run payroll in one click."
            />
            <FeatureCard
              title="Flexible payment options"
              description="Support STRK, ETH, USDC and SNIP-2 tokens. Pay your way to any Starknet wallet."
            />
            <FeatureCard
              title="Low cost"
              description="Simple fee structure: only Starknet gas. No percentage fees, no intermediary cut."
            />
            <FeatureCard
              title="Privacy focused"
              description="Encrypted salaries with Tongo. Employee addresses and amounts are private to the admin in the UI."
            />
            <FeatureCard
              title="Faster than fiat"
              description="Send global payroll quicker than legacy payment rails. Direct to wallet, no banks in the middle."
            />
          </div>
        </div>
      </section>

      {/* How it works - 3 steps */}
      <section className="py-16 sm:py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[var(--foreground)] mb-4">
            How it works
          </h2>
          <p className="text-[var(--muted)] text-center max-w-xl mx-auto mb-14">
            Using Starknet payroll is simple and secure. No need to check exchange rates, and no crypto experience necessary.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              title="Employer"
              description="Fund the payroll contract, add employees or contractors, and set pay schedule and amounts."
            />
            <StepCard
              step={2}
              title="Smart contract"
              description="On payroll run, the contract automatically dispatches tokens to each employee wallet."
            />
            <StepCard
              step={3}
              title="Recipient"
              description="Employees receive crypto payroll direct to their Starknet wallet. No action required."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-[var(--hero-bg)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            Ready to get started?
          </h2>
          <p className="text-[var(--muted)] mb-8">
            Connect your Starknet wallet and set up your first payroll in minutes.
          </p>
          <Link
            href="/company/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] text-white font-semibold px-8 py-4 shadow-sm hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-[var(--muted)] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-[var(--muted)] text-sm">{description}</p>
    </div>
  );
}
