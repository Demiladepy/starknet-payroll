import React from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useStarkzap } from "../../contexts/StarkzapContext";
import { Zap } from "lucide-react";

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
    address: szAddress,
    connect: szConnect, disconnect: szDisconnect
  } = useStarkzap();

  // Determine which is active (just for text color subtly)
  const isSzActive = szConnected && !isInjectedConnected;
  const isInjActive = isInjectedConnected && !szConnected;

  return (
    <div className="flex items-center gap-2">
      
      {/* Wallet Pill - Injected */}
      {isInjectedConnected ? (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="h-[6px] w-[6px] rounded-full bg-[var(--status-success)]" />
          <span className={`font-mono text-[12px] ${isInjActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
            {truncate(injectedAddr!)}
          </span>
          <button
            onClick={() => disconnectInjected()}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1"
          >
            Disconnect
          </button>
        </div>
      ) : null}

      {/* Wallet Pill - StarkZap */}
      {szConnected ? (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)]">
          <Zap size={10} className="text-[var(--text-secondary)]" />
          <span className={`font-mono text-[12px] ${isSzActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
            {truncate(szAddress || "")}
          </span>
          <button
            onClick={szDisconnect}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1"
          >
            Disconnect
          </button>
        </div>
      ) : null}

      {/* Disconnected State Actions */}
      {(!isInjectedConnected && !szConnected) && (
        <div className="flex gap-2">
          {connectors.length > 0 && (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="btn-secondary py-1"
            >
              Connect Wallet
            </button>
          )}
          <button
            onClick={() => szConnect()}
            disabled={szConnecting}
            className="btn-secondary py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <Zap size={14} />
            {szConnecting ? "Connecting..." : "StarkZap"}
          </button>
        </div>
      )}
    </div>
  );
}
