import React, { useMemo, useState } from "react";
import { useDashboardStore } from "../../stores/dashboardStore";
import { useActiveWallet } from "../../hooks/useActiveWallet";
import {
  buildPrivateTransferCalls,
  canUsePrivateTransfer,
  TONGO_CONFIG,
  getTransferPath,
} from "../../lib/tongo";
import { useToast } from "../../contexts/ToastContext";
import { isMockTxHash } from "../../lib/constants";
import { Lock, ArrowUpRight, Eye, EyeOff } from "lucide-react";

type Step = "select" | "details" | "review" | "submit";

function mockHash(): string {
  return `0xMOCK_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 8)}`;
}

function CalldataPreview({ calldata }: { calldata: unknown[] | null }) {
  if (!calldata?.length) return null;
  return (
    <details className="mt-4">
      <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)] select-none">
        Transaction calldata
      </summary>
      <pre className="mt-2 p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded text-[11px] font-mono text-[var(--text-muted)] overflow-x-auto max-h-[200px] overflow-y-auto">
        {JSON.stringify(
          calldata,
          (_, value) => (typeof value === "bigint" ? value.toString() : value),
          2
        )}
      </pre>
    </details>
  );
}

export default function NewTransfer({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { employees, addTransfer } = useDashboardStore();
  const { address: walletAddress, type: walletType, execute, walletName, isConnected } = useActiveWallet();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("select");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [companyKey, setCompanyKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [builtCalldata, setBuiltCalldata] = useState<unknown[] | null>(null);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmpId),
    [employees, selectedEmpId]
  );

  const parsedAmount = Number(amount);
  const amountValid = amount.trim() !== "" && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const canPrivate =
    !!selectedEmployee &&
    canUsePrivateTransfer(selectedEmployee, Boolean(companyKey.trim()));

  const transferType: "tongo_private" | "standard" = canPrivate ? "tongo_private" : "standard";

  const pathInfo = useMemo(
    () => getTransferPath(selectedEmployee ?? null, Boolean(companyKey.trim()), isConnected),
    [selectedEmployee, companyKey, isConnected]
  );

  function showTongoError(e: unknown): string {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Cannot find module") || msg.includes("Module not found"))
      return "Tongo SDK not installed. Run: npm install @fatsolutions/tongo-sdk";
    if (msg.includes("Could not find a transfer function"))
      return "Tongo SDK API mismatch. Check discovery steps in the Tongo prompt.";
    if (msg.includes("insufficient") || msg.includes("balance") || msg.includes("dont have enough"))
      return "Insufficient Tongo balance. Fund your Tongo account first.";
    if (msg.includes("Invalid") && msg.includes("key"))
      return "Invalid Tongo key format. Keys should be hex strings starting with 0x.";
    if (msg.includes("nonce") || msg.includes("TRANSACTION_EXECUTION_ERROR"))
      return "Transaction failed on-chain. Check wallet balance and try again.";
    return msg || "Transfer failed.";
  }

  async function confirm() {
    if (!selectedEmployee || !amountValid) return;

    setSubmitting(true);
    setTxHash(null);
    setError(null);
    setBuiltCalldata(null);

    const amountWei = BigInt(Math.floor(parsedAmount * 1e18));
    const noteVal = note.trim() || undefined;

    try {
      if (canPrivate && companyKey.trim() && selectedEmployee.tongoPublicKey && isConnected) {
        if (!walletAddress) {
          setError("Wallet address required for confidential transfer.");
          toast("Wallet address required for confidential transfer.", "error");
          setSubmitting(false);
          return;
        }
        const calls = await buildPrivateTransferCalls({
          recipientPublicKey: selectedEmployee.tongoPublicKey,
          amount: amountWei,
          senderPrivateKey: companyKey.trim(),
          senderAddress: walletAddress,
        });
        const calldataForPreview = JSON.parse(
          JSON.stringify(calls, (_, v) => (typeof v === "bigint" ? v.toString() : v))
        ) as unknown[];
        setBuiltCalldata(calldataForPreview);

        try {
          const result = await execute(calls);
          const hash = result.transaction_hash ?? mockHash();
          setCompanyKey("");
          setTxHash(hash);
          addTransfer({
            id: crypto.randomUUID(),
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
            amount: parsedAmount,
            note: noteVal,
            status: isMockTxHash(hash) ? "completed" : "pending",
            type: "tongo_private",
            txHash: hash,
            createdAt: new Date().toISOString(),
          });
          toast(
            isMockTxHash(hash)
              ? `Transfer recorded — ${hash.slice(0, 10)}…${hash.slice(-8)}`
              : `Transfer submitted — ${hash.slice(0, 10)}…${hash.slice(-8)}`,
            "success"
          );
        } catch (execErr) {
          setCompanyKey("");
          const errMsg = showTongoError(execErr);
          setError(errMsg);
          toast(errMsg, "error");
          addTransfer({
            id: crypto.randomUUID(),
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
            amount: parsedAmount,
            note: noteVal,
            status: "failed",
            type: "tongo_private",
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        const hash = mockHash();
        setTxHash(hash);
        addTransfer({
          id: crypto.randomUUID(),
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          amount: parsedAmount,
          note: noteVal,
          status: "completed",
          type: "standard",
          txHash: hash,
          createdAt: new Date().toISOString(),
        });
        toast(`Transfer recorded — ${hash.slice(0, 10)}…${hash.slice(-8)}`, "success");
      }
    } catch (buildErr) {
      const errMsg = showTongoError(buildErr);
      setError(errMsg);
      toast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  const handleSelectEmp = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedEmpId(e.target.value);
  const handleTransfer = () => void confirm();

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

        {/* Company Tongo key — only when Tongo configured and employee has public key */}
        {TONGO_CONFIG.isConfigured && selectedEmployee?.tongoPublicKey && (
          <div className="space-y-3 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <label className="block text-[12px] font-medium text-[var(--text-secondary)]">
                Company Tongo key
              </label>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Not stored</div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Used to build the encrypted transfer proof. Not stored.
            </p>
            
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
            disabled={!selectedEmployee || submitting}
            onClick={handleTransfer}
            className="w-full btn-primary py-3 flex justify-center items-center"
          >
            {submitting ? "Executing..." : "Confirm Transfer"}
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
                <div className="text-[11px] text-[var(--text-muted)] mb-2">Path</div>
                {pathInfo.path === "tongo" ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                      <Lock size={12} className="text-[var(--accent)] shrink-0" />
                      <span className="text-[12px] font-medium text-[var(--accent)]">{pathInfo.label}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">{pathInfo.sublabel}</div>
                  </div>
                ) : pathInfo.path === "standard" ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border)]">
                      <ArrowUpRight size={12} className="text-[var(--text-secondary)] shrink-0" />
                      <span className="text-[12px] font-medium text-[var(--text-secondary)]">{pathInfo.label}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">{pathInfo.sublabel}</div>
                    {pathInfo.missingItems.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-[11px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)] select-none">
                          What&apos;s needed for confidential?
                        </summary>
                        <ul className="mt-1 ml-3 text-[11px] text-[var(--text-muted)] list-disc space-y-0.5">
                          {pathInfo.missingItems.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                ) : (
                  <div className="text-[12px] text-[var(--text-muted)]">{pathInfo.label}</div>
                )}
              </div>

              <CalldataPreview calldata={builtCalldata} />
           </div>
         )}
      </div>
    </div>
  );
}
