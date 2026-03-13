import React from "react";
import { motion } from "framer-motion";
import { TONGO_CONFIG } from "../../lib/tongo";
import { useActiveWallet } from "../../hooks/useActiveWallet";
import { Globe, Shield, Wallet, Trash2 } from "lucide-react";

const cardAnim = (d: number) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.4 },
});

export default function Settings() {
  const { walletName, address, type } = useActiveWallet();
  const rpcUrl = import.meta.env.VITE_STARKNET_RPC_URL || "Default (BlastAPI)";
  const network = import.meta.env.VITE_STARKNET_NETWORK || "sepolia";

  return (
    <div className="max-w-[700px] space-y-6">
      {/* Network */}
      <motion.div {...cardAnim(0)} className="card-glass p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent-border)] flex items-center justify-center">
            <Globe size={14} className="text-[var(--accent-cyan)]" />
          </div>
          <h3 className="text-[15px] font-semibold">Network</h3>
        </div>
        <div className="grid grid-cols-2 gap-8 border-t border-[var(--border)] pt-6">
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Network</div>
            <div className="text-[13px] text-[var(--text-primary)] capitalize">{network}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">RPC Node</div>
            <div className="font-mono text-[12px] text-[var(--text-secondary)] truncate" title={rpcUrl}>{rpcUrl}</div>
          </div>
        </div>
      </motion.div>

      {/* Tongo */}
      <motion.div {...cardAnim(0.1)} className="card-glass p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--privacy-muted)] border border-[var(--privacy-border)] flex items-center justify-center">
            <Shield size={14} className="text-[var(--privacy)]" />
          </div>
          <h3 className="text-[15px] font-semibold">Tongo Privacy Protocol</h3>
        </div>
        <div className="space-y-6 border-t border-[var(--border)] pt-6">
          <div className="flex items-center justify-between">
            <div className="text-[13px] text-[var(--text-secondary)]">Status</div>
            {TONGO_CONFIG.isConfigured ? (
              <div className="privacy-badge privacy-badge-glow">
                <div className="status-dot status-dot-success" />
                Active
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="status-dot status-dot-error" />
                <span className="text-[12px] text-[var(--text-muted)]">Not configured</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Contract</div>
            <div className="font-mono text-[12px] text-[var(--text-secondary)] break-all">
              {TONGO_CONFIG.contractAddress
                ? `${TONGO_CONFIG.contractAddress.slice(0, 10)}...${TONGO_CONFIG.contractAddress.slice(-8)}`
                : "Not configured"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Wrapper</div>
            <div className="font-mono text-[12px] text-[var(--text-secondary)] break-all">
              {TONGO_CONFIG.wrapperAddress
                ? `${TONGO_CONFIG.wrapperAddress.slice(0, 10)}...${TONGO_CONFIG.wrapperAddress.slice(-8)}`
                : "Not configured"}
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Set VITE_TONGO_CONTRACT_ADDRESS and VITE_TONGO_WRAPPER_ADDRESS in your .env file.
          </p>
        </div>
      </motion.div>

      {/* Wallet */}
      <motion.div {...cardAnim(0.2)} className="card-glass p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent-border)] flex items-center justify-center">
            <Wallet size={14} className="text-[var(--accent-cyan)]" />
          </div>
          <h3 className="text-[15px] font-semibold">Connected Wallet</h3>
        </div>
        {address ? (
          <div className="space-y-6 border-t border-[var(--border)] pt-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Provider</div>
                <div className="text-[13px] text-[var(--text-primary)]">
                  {walletName}{" "}
                  {type === "starkzap" && (
                    <span className="text-[var(--accent-cyan)] text-[11px]">(SDK)</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Execution</div>
                <div className="text-[13px] text-[var(--text-secondary)]">
                  {type === "starkzap" ? "Read-only demo signer" : "Full write access"}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Address</div>
              <div className="font-mono text-[12px] text-[var(--accent-cyan)] break-all opacity-80">
                {address}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-[var(--border)] pt-6 text-[13px] text-[var(--text-muted)]">
            No active session detected.
          </div>
        )}
      </motion.div>

      {/* Danger zone */}
      <motion.div {...cardAnim(0.3)} className="pt-2">
        <button
          className="btn-ghost text-[var(--status-error)] hover:text-red-400 hover:bg-red-500/5"
          onClick={() => localStorage.clear()}
        >
          <Trash2 size={13} /> Clear Local Cache
        </button>
      </motion.div>
    </div>
  );
}
