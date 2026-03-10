import React, { useState } from "react";
import { useDashboardStore, type Employee } from "../../stores/dashboardStore";
import { useActiveWallet } from "../../hooks/useActiveWallet";
import { canUsePrivateTransfer, TONGO_CONFIG } from "../../lib/tongo";
import { toast } from "sonner";

export default function NewTransfer({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { employees, addTransfer } = useDashboardStore();
  const { execute, type: walletType, walletName, isConnected, address } = useActiveWallet();
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [companyKey, setCompanyKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleSelectEmp = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmpId(e.target.value);
    const emp = employees.find((x) => x.id === e.target.value);
    if (emp) setAmount(emp.salary.toString());
  };

  const isPrivate = selectedEmployee
    ? canUsePrivateTransfer(selectedEmployee, Boolean(companyKey))
    : false;

  const handleTransfer = async () => {
    if (!selectedEmployee || !amount || isNaN(Number(amount))) return;
    if (!isConnected) {
      setErrorMsg("Please connect a wallet first.");
      setStatus("error");
      return;
    }
    
    setStatus("loading");
    setErrorMsg("");

    try {
      let hash = "";
      let type: "tongo_private" | "standard" = "standard";

      if (isPrivate) {
        // Mock Tongo Calldata Execution
        // If we had real Tongo SDK we would import buildPrivateTransferCall here
        // and execute the resulting `call`.
        const call = {
          contractAddress: TONGO_CONFIG.contractAddress || "0x00",
          entrypoint: "transfer_private",
          calldata: [selectedEmployee.tongoPublicKey!, (Number(amount) * 1e18).toString()]
        };
        const result = await execute(call);
        hash = result.transaction_hash;
        type = "tongo_private";
      } else {
        // Standard or mock execution
        if (walletType === "starkzap" || !walletType) {
           hash = `0xMOCK_${Date.now().toString(16)}`;
        } else {
          // If we want real execute with real ETH on argent we would do it here
          // But for now, mock standard
           hash = `0xMOCK_${Date.now().toString(16)}`;
        }
        type = "standard";
      }

      setTxHash(hash);
      setStatus("success");
      
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
      
      toast.success("Transfer submitted successfully!", {
        description: `Tx: ${hash.slice(0, 10)}...`
      });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err?.message || "Transfer failed");
      
      toast.error("Transfer Failed", {
        description: err?.message || "An unknown error occurred."
      });
      
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Form */}
        <div className="card-fintech p-6 space-y-6">
          <h3 className="font-heading text-xl font-semibold border-b border-white/5 pb-4">New Transfer</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#94A3B8] font-medium mb-1.5">Employee</label>
              <select
                value={selectedEmpId}
                onChange={handleSelectEmp}
                className="w-full bg-[#131825] border border-white/10 rounded-lg px-4 py-3 text-white focus-ring"
              >
                <option value="" disabled>Select Employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#94A3B8] font-medium mb-1.5">Amount (ETH)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full bg-[#131825] border border-white/10 rounded-lg px-4 py-3 text-white focus-ring font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[#94A3B8] font-medium mb-1.5">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="March Salary"
                className="w-full bg-[#131825] border border-white/10 rounded-lg px-4 py-3 text-white focus-ring"
              />
            </div>

            {selectedEmployee?.tongoPublicKey && (
              <div className="pt-2">
                <label className="block text-sm text-teal-400 font-medium mb-1.5">Company Privacy Key</label>
                <input
                  type="password"
                  value={companyKey}
                  onChange={(e) => setCompanyKey(e.target.value)}
                  placeholder="Enter key to enable private transfer"
                  className="w-full bg-[#131825] border border-teal-500/30 rounded-lg px-4 py-3 text-white focus-ring"
                />
                <p className="text-xs text-[#64748B] mt-2">Required for ElGamal encryption via Tongo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="card-fintech p-6 flex flex-col justify-between">
          <div className="space-y-6">
             <h3 className="font-heading text-xl font-semibold border-b border-white/5 pb-4">Transaction Preview</h3>
             
             {!selectedEmployee ? (
               <div className="text-[#64748B] text-center py-10">Select an employee to see preview.</div>
             ) : (
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                    <span className="text-[#94A3B8] text-sm">Recipient</span>
                    <span className="text-white font-medium">{selectedEmployee.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                    <span className="text-[#94A3B8] text-sm">Amount</span>
                    <span className="text-white font-medium font-mono">{amount || "0.00"} ETH</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                    <span className="text-[#94A3B8] text-sm">Transfer Type</span>
                    {isPrivate ? (
                      <span className="text-teal-400 font-medium flex items-center gap-1.5 bg-teal-500/10 px-2 py-0.5 rounded text-sm">🔒 Private via Tongo</span>
                    ) : (
                      <span className="text-amber-400 font-medium flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded text-sm">📤 Standard Transfer</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#94A3B8] text-sm">Executor</span>
                    <span className={`font-medium ${walletType === 'starkzap' ? 'text-teal-400' : 'text-white'}`}>
                      {isConnected ? (walletType === 'starkzap' ? 'StarkZap ⚡' : walletName) : 'Not Connected'}
                    </span>
                  </div>

                  {status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                      {errorMsg}
                    </div>
                  )}
                  {status === "success" && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
                      <div className="text-green-400 font-semibold mb-1">Transfer Initiated!</div>
                       {txHash.startsWith("0xMOCK_") ? (
                         <div className="text-xs text-[#94A3B8] font-mono whitespace-normal break-all">{txHash} (Local Mock)</div>
                       ) : (
                         <a href={`https://sepolia.starkscan.co/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-xs text-teal-400 font-mono hover:underline whitespace-normal break-all">
                           {txHash} ↗
                         </a>
                       )}
                    </div>
                  )}
               </div>
             )}
          </div>
          
          <div className="pt-6">
            <button
               disabled={!selectedEmployee || status === "loading"}
               onClick={handleTransfer}
               className={`w-full py-3.5 rounded-xl font-bold transition flex justify-center items-center gap-2 ${
                 !selectedEmployee
                   ? "bg-white/5 text-[#64748B] cursor-not-allowed"
                   : walletType === "starkzap"
                   ? "bg-gradient-to-r from-teal-400 to-teal-500 text-[#0A0E1A] hover:from-teal-300 hover:to-teal-400"
                   : "bg-white text-[#0A0E1A] hover:bg-zinc-200"
               }`}
            >
               {status === "loading" ? "Processing..." : (
                 <>
                   {walletType === "starkzap" && <span>⚡</span>} 
                   Confirm with {walletType === 'starkzap' ? 'StarkZap' : (isConnected ? walletName : 'Wallet')}
                 </>
               )}
            </button>
            {status === "success" && (
              <button
                onClick={() => { setStatus("idle"); setAmount(""); setNote(""); }}
                className="w-full mt-3 py-2 text-sm text-[#94A3B8] hover:text-white transition"
              >
                Send Another
              </button>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
