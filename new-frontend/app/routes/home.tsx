import React from "react";
import { Link } from "react-router";
import { useStarkzap } from "../contexts/StarkzapContext";
import { useAccount, useConnect } from "@starknet-react/core";

export default function Home() {
  const { connect: connectSz, isConnecting: szConnecting } = useStarkzap();
  const { connect, connectors } = useConnect();
  const { status } = useAccount();

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#F1F5F9] font-sans selection:bg-[#00E5CC] selection:text-black">
      {/* Navbar Minimal */}
      <nav className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-heading font-bold text-xl tracking-wide flex items-center gap-2">
            <span className="text-xl">💼</span> StarkPayroll
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] transition"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-widest mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          Privacy-First
        </div>
        <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-6">
          Private Payroll for the <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5CC] to-blue-500">
            Onchain Era
          </span>
        </h1>
        <p className="text-[#94A3B8] text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Companies leak salary data on public blockchains. We fix that. Pay your employees with standard or fully confidential transfers using ElGamal encryption.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition text-[#F1F5F9] font-medium"
          >
            {status === "connected" ? "Wallet Connected" : "Connect Wallet"}
          </button>
          <button
            onClick={() => connectSz()}
            disabled={szConnecting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 text-[#0A0E1A] font-bold hover:from-teal-300 hover:to-teal-400 transition flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            {szConnecting ? "Connecting..." : "Sign in with StarkZap"}
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#131825]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-2xl mb-6">
                🔒
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">Private Transfers</h3>
              <p className="text-[#94A3B8] leading-relaxed">
                Powered by Tongo protocol. Salaries are encrypted. The amounts are hidden securely on starknet.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-6">
                ⚡
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">StarkZap Integration</h3>
              <p className="text-[#94A3B8] leading-relaxed">
                Sign in without an extension. Create deterministically generated smart accounts instantly.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-6">
                📊
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">Fintech Dashboard</h3>
              <p className="text-[#94A3B8] leading-relaxed">
                Manage employees, track history, and initiate payroll with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="font-heading text-3xl font-bold mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-[#131825] border border-white/10 flex items-center justify-center text-2xl mb-6 shadow-xl">
              1
            </div>
            <h4 className="font-bold text-lg mb-2">Connect</h4>
            <p className="text-[#94A3B8] text-sm">Use StarkZap or an injected starknet wallet.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-[#131825] border border-white/10 flex items-center justify-center text-2xl mb-6 shadow-xl">
              2
            </div>
            <h4 className="font-bold text-lg mb-2">Add Employees</h4>
            <p className="text-[#94A3B8] text-sm">Register staff with their Tongo privacy keys.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-[#131825] border border-[#00E5CC]/30 flex items-center justify-center text-2xl mb-6 shadow-[0_0_30px_rgba(0,229,204,0.1)]">
              3
            </div>
            <h4 className="font-bold text-lg mb-2 text-[#00E5CC]">Pay Privately</h4>
            <p className="text-[#94A3B8] text-sm">Construct confidential transactions directly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
