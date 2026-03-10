import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useStarkzap } from "../../contexts/StarkzapContext";

function truncate(addr: string, chars = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function WalletSection() {
  const { address: injectedAddr, status: injectedStatus } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect: disconnectInjected } = useDisconnect();
  const isInjectedConnected = injectedStatus === "connected" && !!injectedAddr;

  const {
    isConnected: szConnected, isConnecting: szConnecting,
    address: szAddress, error: szError,
    connect: szConnect, disconnect: szDisconnect, clearError: szClearError,
  } = useStarkzap();

  const [showConnectors, setShowConnectors] = useState(false);

  return (
    <div className="flex items-center gap-3 flex-wrap">

      {/* === INJECTED WALLET === */}
      {isInjectedConnected ? (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          <span className="font-mono text-sm text-slate-100">
            {truncate(injectedAddr!)}
          </span>
          <button
            onClick={() => disconnectInjected()}
            className="text-xs text-slate-400 border border-white/15 rounded px-2 py-0.5 hover:text-white"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowConnectors(!showConnectors)}
            className="border border-teal-400/40 text-teal-400 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-teal-400/10 transition"
          >
            Connect Wallet
          </button>
          {showConnectors && (
            <div className="absolute top-full mt-1.5 right-0 bg-[#1a1f2e] border border-white/10 rounded-xl p-2 min-w-[180px] z-50 shadow-2xl">
              {connectors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { connect({ connector: c }); setShowConnectors(false); }}
                  className="block w-full text-left text-sm text-slate-100 px-3 py-2 rounded-lg hover:bg-white/5 transition"
                >
                  {c.name || c.id}
                </button>
              ))}
              {connectors.length === 0 && (
                <p className="text-xs text-slate-500 px-3 py-2">
                  No wallets detected. Install Argent X or Braavos.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* === STARKZAP WALLET === */}
      {szConnected ? (
        <div className="flex items-center gap-2 bg-teal-500/8 border border-teal-500/25 rounded-xl px-3 py-1.5">
          <span className="bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide">
            ⚡ StarkZap
          </span>
          <span className="font-mono text-sm text-slate-100">
            {truncate(szAddress || "")}
          </span>
          <button
            onClick={szDisconnect}
            className="text-xs text-slate-400 border border-white/15 rounded px-2 py-0.5 hover:text-white"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={() => { szClearError(); szConnect(); }}
          disabled={szConnecting}
          className="bg-gradient-to-r from-teal-400 to-teal-500 text-[#0A0E1A] rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-1.5 hover:from-teal-300 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-wait"
        >
          <span>⚡</span>
          {szConnecting ? "Connecting..." : "Sign in with StarkZap"}
        </button>
      )}

      {/* === ERROR === */}
      {szError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-2.5 py-1.5 text-[11px] text-red-400 max-w-[300px] flex items-center gap-1.5">
          <span>⚠️</span>
          <span>{szError}</span>
          <button onClick={szClearError} className="text-red-400 text-sm ml-1">×</button>
        </div>
      )}
    </div>
  );
}
