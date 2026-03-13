import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useStarkzap } from "../../contexts/StarkzapContext";
import { Zap, Wallet, X } from "lucide-react";

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
    isConnected: szConnected,
    isConnecting: szConnecting,
    address: szAddress,
    connect: szConnect,
    disconnect: szDisconnect,
  } = useStarkzap();

  const isSzActive = szConnected && !isInjectedConnected;

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="popLayout">
        {/* Injected wallet pill */}
        {isInjectedConnected && (
          <motion.div
            key="injected"
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-glass)]"
            style={{ backdropFilter: "blur(12px)" }}
          >
            <div className="status-dot status-dot-success" />
            <span className="font-mono text-[12px] text-[var(--text-primary)]">
              {truncate(injectedAddr!)}
            </span>
            <button
              onClick={() => disconnectInjected()}
              className="text-[var(--text-muted)] hover:text-[var(--status-error)] transition-colors p-0.5"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}

        {/* StarkZap wallet pill */}
        {szConnected && (
          <motion.div
            key="starkzap"
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--bg-glass)]"
            style={{
              backdropFilter: "blur(12px)",
              boxShadow: isSzActive ? "0 0 12px rgba(0,212,255,0.1)" : undefined,
            }}
          >
            <Zap size={11} className="text-[var(--accent-cyan)]" />
            <span className={`font-mono text-[12px] ${isSzActive ? "text-[var(--accent-cyan)]" : "text-[var(--text-secondary)]"}`}>
              {truncate(szAddress || "")}
            </span>
            <button
              onClick={szDisconnect}
              className="text-[var(--text-muted)] hover:text-[var(--status-error)] transition-colors p-0.5"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}

        {/* Connect buttons */}
        {!isInjectedConnected && !szConnected && (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            {connectors.length > 0 && (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="btn-secondary py-1.5 px-3 text-[12px]"
              >
                <Wallet size={13} /> Connect
              </button>
            )}
            <button
              onClick={() => szConnect()}
              disabled={szConnecting}
              className="btn-secondary py-1.5 px-3 text-[12px] border-[var(--accent-border)] hover:border-[var(--accent-cyan)]"
            >
              <Zap size={13} className="text-[var(--accent-cyan)]" />
              {szConnecting ? "Connecting..." : "StarkZap"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
