import React from "react";
import { TONGO_CONFIG } from "../../lib/tongo";
import { useActiveWallet } from "../../hooks/useActiveWallet";

export default function Settings() {
  const { walletName, address, type } = useActiveWallet();
  const rpcUrl = import.meta.env.VITE_STARKNET_RPC_URL || "Using Default";
  const network = import.meta.env.VITE_STARKNET_NETWORK || "sepolia";

  return (
    <div className="max-w-[700px] space-y-8">
      
      <div className="card-fintech p-8">
        <h3 className="text-[14px] font-medium mb-6">Network Configuration</h3>
        <div className="grid grid-cols-2 gap-8 border-t border-[var(--border)] pt-6">
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Network</div>
            <div className="text-[13px] text-[var(--text-primary)] capitalize">{network}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">RPC Node</div>
            <div className="font-mono text-[12px] text-[var(--text-secondary)] truncate" title={rpcUrl}>{rpcUrl}</div>
          </div>
        </div>
      </div>

      <div className="card-fintech p-8">
        <h3 className="text-[14px] font-medium mb-6">Tongo Privacy Protocol</h3>
        <div className="space-y-6 border-t border-[var(--border)] pt-6">
          <div className="flex items-center justify-between">
            <div className="text-[13px] text-[var(--text-secondary)]">Status</div>
            {TONGO_CONFIG.isConfigured ? (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />
                <span className="text-[12px] text-[var(--text-primary)]">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-error)]" />
                <span className="text-[12px] text-[var(--text-muted)]">Not configured</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Contract address</div>
            <div className="font-mono text-[12px] text-[var(--text-secondary)] break-all">
              {TONGO_CONFIG.contractAddress ? `${TONGO_CONFIG.contractAddress.slice(0, 10)}...${TONGO_CONFIG.contractAddress.slice(-8)}` : "Not configured"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Wrapper address</div>
            <div className="font-mono text-[12px] text-[var(--text-secondary)] break-all">
              {TONGO_CONFIG.wrapperAddress ? `${TONGO_CONFIG.wrapperAddress.slice(0, 10)}...${TONGO_CONFIG.wrapperAddress.slice(-8)}` : "Not configured"}
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Set VITE_TONGO_CONTRACT_ADDRESS and VITE_TONGO_WRAPPER_ADDRESS in your .env file.
          </p>
        </div>
      </div>

      <div className="card-fintech p-8">
        <h3 className="text-[14px] font-medium mb-6">Connected Environment</h3>
        {address ? (
          <div className="space-y-6 border-t border-[var(--border)] pt-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Provider</div>
                <div className="text-[13px] text-[var(--text-primary)]">{walletName} {type === 'starkzap' && <span className="text-[var(--text-muted)]">(SDK)</span>}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Execution Support</div>
                <div className="text-[13px] text-[var(--text-secondary)]">{type === 'starkzap' ? 'Read-only demo signer' : 'Full write access'}</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Public Address</div>
              <div className="font-mono text-[12px] text-[var(--text-secondary)] break-all">{address}</div>
            </div>
          </div>
        ) : (
          <div className="border-t border-[var(--border)] pt-6 text-[13px] text-[var(--text-muted)]">
             No active session detected.
          </div>
        )}
      </div>
      
      <div className="pt-2">
         <button className="btn-ghost text-[var(--status-error)] hover:text-red-400" onClick={() => localStorage.clear()}>
           Clear Local Cache
         </button>
      </div>
    </div>
  );
}
