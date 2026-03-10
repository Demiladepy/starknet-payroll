import React from "react";
import { TONGO_CONFIG } from "../../lib/tongo";
import { useActiveWallet } from "../../hooks/useActiveWallet";

export default function Settings() {
  const { walletName, address, type } = useActiveWallet();
  const rpcUrl = import.meta.env.VITE_STARKNET_RPC_URL || "Using Default";
  const network = import.meta.env.VITE_STARKNET_NETWORK || "sepolia";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card-fintech p-6 space-y-4">
        <h3 className="font-heading text-xl font-bold border-b border-white/5 pb-4">Network Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[#64748B] mb-1">Network</div>
            <div className="font-medium text-white capitalize">{network}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B] mb-1">RPC Node</div>
            <div className="font-medium text-white truncate" title={rpcUrl}>{rpcUrl}</div>
          </div>
        </div>
      </div>

      <div className="card-fintech p-6 space-y-4">
        <h3 className="font-heading text-xl font-bold border-b border-white/5 pb-4">Tongo Privacy Protocol</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-white">Status</div>
            {TONGO_CONFIG.isConfigured ? (
              <span className="text-teal-400 text-xs bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20">Active</span>
            ) : (
              <span className="text-amber-400 text-xs bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">Not Configured</span>
            )}
          </div>
          <div>
             <div className="text-xs text-[#64748B] mb-1">Contract Address</div>
             <div className="font-mono text-sm break-all text-[#94A3B8]">{TONGO_CONFIG.contractAddress || "Not set in .env"}</div>
          </div>
        </div>
      </div>

      <div className="card-fintech p-6 space-y-4">
        <h3 className="font-heading text-xl font-bold border-b border-white/5 pb-4">Active Wallet Info</h3>
        {address ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#64748B] mb-1">Provider</div>
                <div className="font-medium text-white">{walletName} {type === 'starkzap' && '⚡'}</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] mb-1">Executable</div>
                <div className="font-medium text-white">{type === 'starkzap' ? 'No (Demo Signer)' : 'Yes'}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748B] mb-1">Address</div>
              <div className="font-mono text-sm break-all text-[#94A3B8]">{address}</div>
            </div>
          </div>
        ) : (
          <div className="text-[#94A3B8] py-4">No wallet connected.</div>
        )}
      </div>
      
      <div className="pt-4">
         <button className="text-red-400 hover:text-red-300 text-sm font-medium transition" onClick={() => localStorage.clear()}>
           Clear Local Data (Hard Reset)
         </button>
      </div>
    </div>
  );
}
