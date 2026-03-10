import React, { useState } from "react";
import { useDashboardStore, type Employee } from "../../stores/dashboardStore";
import { useActiveWallet } from "../../hooks/useActiveWallet";
import { canUsePrivateTransfer, TONGO_CONFIG } from "../../lib/tongo";
import { toast } from "sonner";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function NewTransfer({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { employees, addTransfer } = useDashboardStore();
  const { execute, type: walletType, walletName, isConnected } = useActiveWallet();
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [companyKey, setCompanyKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [txHash, setTxHash] = useState("");

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);
  const isPrivate = selectedEmployee
    ? canUsePrivateTransfer(selectedEmployee, Boolean(companyKey))
    : false;

  const handleSelectEmp = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmpId(e.target.value);
    const emp = employees.find((x) => x.id === e.target.value);
    if (emp) setAmount(emp.salary.toString());
  };

  const handleTransfer = async () => {
    if (!selectedEmployee || !amount || isNaN(Number(amount))) return;
    if (!isConnected) {
      toast.error("No Provider", { description: "Please connect a wallet first." });
      return;
    }
    
    setStatus("loading");

    try {
      let hash = "";
      let type: "tongo_private" | "standard" = "standard";
      
      const payloadCalldata = isPrivate 
        ? [selectedEmployee.tongoPublicKey!, (Number(amount) * 1e18).toString()]
        : [selectedEmployee.walletAddress, (Number(amount) * 1e18).toString()];

      const callPreview = {
        contractAddress: isPrivate ? (TONGO_CONFIG.contractAddress || "0x_no_addr") : "0x_erc20_addr",
        entrypoint: isPrivate ? "transfer_private" : "transfer",
        calldata: payloadCalldata
      };

      if (isPrivate) {
        // Tongo Sim
        const result = await execute(callPreview);
        hash = result.transaction_hash;
        type = "tongo_private";
      } else {
        // Standard Sim
        if (walletType === "starkzap" || !walletType) {
           hash = `0xMOCK_${Date.now().toString(16)}`;
        } else {
           hash = `0xMOCK_${Date.now().toString(16)}`;
        }
        type = "standard";
      }

      setTxHash(hash);
      setStatus("success");
      
      toast.success(isPrivate ? "Confidential transfer initiated" : "Transfer initiated", {
        description: `Tx: ${hash.slice(0, 10)}...`
      });

      addTransfer({
        id: crypto.randomUUID(),
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        amount: Number(amount),
        note,
        status: hash.startsWith("0xMOCK_") ? "completed" : "pending",
        type,
        txHash: hash,
        createdAt: new Date().toISOString(),
      });
      
    } catch (err: any) {
      setStatus("error");
      toast.error("Transfer failed", { description: err?.message || "Execution error" });
      
       addTransfer({
        id: crypto.randomUUID(),
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        amount: Number(amount),
        note,
        status: "failed",
        type: isPrivate ? "tongo_private" : "standard",
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_300px] gap-8 max-w-6xl mx-auto items-start">
      
      {/* Col 1: Steps Nav */}
      <div className="hidden md:block sticky top-8">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-[var(--border)] before:to-transparent">
          <div className="flex items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-[var(--accent)] z-10 shrink-0" />
            <div className="text-[13px] font-medium text-[var(--accent)]">Details</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] z-10 shrink-0" />
            <div className="text-[13px] font-medium text-[var(--text-muted)]">Privacy</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] z-10 shrink-0" />
            <div className="text-[13px] font-medium text-[var(--text-muted)]">Submit</div>
          </div>
        </div>
      </div>

      {/* Col 2: Active Step Form */}
      <div className="card-fintech p-8 space-y-8 min-h-[400px]">
        {/* Recipient */}
        <div className="space-y-3">
          <label className="block text-[12px] font-medium text-[var(--text-secondary)]">Recipient</label>
          <select
            value={selectedEmpId}
            onChange={handleSelectEmp}
            className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--text-primary)] focus-ring appearance-none"
          >
            <option value="" disabled>Select employee</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
          </select>
        </div>

        {/* Amount & Note */}
        <div className="grid grid-cols-[1.5fr_1fr] gap-4">
           <div className="space-y-3">
            <label className="block text-[12px] font-medium text-[var(--text-secondary)]">Amount (ETH)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[6px] px-3 py-2 text-[14px] font-mono text-[var(--text-primary)] focus-ring"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[12px] font-medium text-[var(--text-secondary)]">Memo</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
              className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[6px] px-3 py-2 text-[13px] text-[var(--text-primary)] focus-ring"
            />
          </div>
        </div>

        {/* Privacy Key Terminal Input */}
        {selectedEmployee?.tongoPublicKey && (
          <div className="space-y-3 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <label className="block text-[12px] font-medium text-[var(--text-secondary)]">
                Company Private Key <span className="text-[var(--text-muted)]">(for ElGamal encryption)</span>
              </label>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Not Stored</div>
            </div>
            
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={companyKey}
                onChange={(e) => setCompanyKey(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#050505] border border-[var(--border)] rounded-[6px] pl-3 pr-10 py-2.5 text-[13px] font-mono text-[var(--accent)] focus-ring placeholder:text-[#333]"
              />
              <button 
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* Action */}
        <div className="pt-6">
          <button
            disabled={!selectedEmployee || status === "loading"}
            onClick={handleTransfer}
            className="w-full btn-primary py-3 flex justify-center items-center"
          >
            {status === "loading" ? "Executing..." : "Confirm Transfer"}
          </button>
          
          <div className="text-center mt-3 text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
            Executing via
            <span className={`font-mono ${walletType === "starkzap" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
               {isConnected ? walletName : "None"}
            </span>
          </div>
        </div>
      </div>

      {/* Col 3: Live Summary Panel */}
      <div className="card-fintech p-6 space-y-6 sticky top-8 bg-[var(--bg-base)] md:bg-transparent border-t border-[var(--border)] md:border-none md:p-0">
         <h4 className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[var(--text-muted)]">Live Summary</h4>
         
         {!selectedEmployee ? (
           <div className="text-[13px] text-[var(--text-muted)] pt-4">Awaiting details...</div>
         ) : (
           <div className="space-y-4">
              <div>
                <div className="text-[11px] text-[var(--text-muted)] mb-1">To</div>
                <div className="text-[13px] font-medium">{selectedEmployee.name}</div>
              </div>
              
              <div>
                <div className="text-[11px] text-[var(--text-muted)] mb-1">Amount</div>
                <div className="font-mono text-[14px]">{amount || "0.00"} ETH</div>
              </div>

              <div>
                <div className="text-[11px] text-[var(--text-muted)] mb-3">Path</div>
                {isPrivate ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-[4px] bg-[#3ecf8e]/10">
                      <Lock size={12} className="text-[#3ecf8e]" />
                      <span className="text-[12px] font-medium text-[#3ecf8e]">Confidential transfer</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">Amount encrypted via Tongo Protocol. Only recipient can decrypt.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-[4px]">
                      <ArrowRight size={12} className="text-[var(--text-secondary)]" />
                      <span className="text-[12px] font-medium text-[var(--text-secondary)]">Standard transfer</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">Amount visible on-chain. Key missing for encryption.</div>
                  </div>
                )}
              </div>
              
              {/* Preview Block */}
              <div className="pt-4 border-t border-[var(--border)]">
                 <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Simulated Calldata</div>
                 <pre className="bg-[#050505] border border-[var(--border)] rounded-[4px] p-3 text-[10px] text-[var(--text-muted)] font-mono overflow-x-auto">
{`{
  contractAddress: "${isPrivate ? (TONGO_CONFIG.contractAddress?.slice(0,10) + '...' || '0x_tongo') : '0x_eth_tk'}",
  entrypoint: "${isPrivate ? 'transfer_private' : 'transfer'}",
  calldata: [
    "${isPrivate ? selectedEmployee.tongoPublicKey?.slice(0, 15) + '...' : selectedEmployee.walletAddress?.slice(0, 15) + '...'}",
    "${(Number(amount || 0) * 1e18).toString()}"
  ]
}`}
                 </pre>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
