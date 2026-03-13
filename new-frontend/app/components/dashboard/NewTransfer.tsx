import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Lock, ArrowUpRight, Eye, EyeOff, Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
      <pre className="mt-2 p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[11px] font-mono text-[var(--text-muted)] overflow-x-auto max-h-[200px] overflow-y-auto">
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

  const pathInfo = useMemo(
    () => getTransferPath(selectedEmployee ?? null, Boolean(companyKey.trim()), isConnected),
    [selectedEmployee, companyKey, isConnected]
  );

  function showTongoError(e: unknown): string {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Cannot find module") || msg.includes("Module not found"))
      return "Tongo SDK not installed. Run: npm install @fatsolutions/tongo-sdk";
    if (msg.includes("Could not find a transfer function"))
      return "Tongo SDK API mismatch.";
    if (msg.includes("insufficient") || msg.includes("balance") || msg.includes("dont have enough"))
      return "Insufficient Tongo balance. Fund your account first.";
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
              ? `Transfer recorded - ${hash.slice(0, 10)}...${hash.slice(-8)}`
              : `Transfer submitted - ${hash.slice(0, 10)}...${hash.slice(-8)}`,
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
        toast(`Transfer recorded - ${hash.slice(0, 10)}...${hash.slice(-8)}`, "success");
      }
    } catch (buildErr) {
      const errMsg = showTongoError(buildErr);
      setError(errMsg);
      toast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 max-w-5xl mx-auto items-start">
      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-glass p-8 space-y-8"
      >
        {/* Recipient */}
        <div className="space-y-3">
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Recipient
          </label>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-4 py-3 text-[13px] text-[var(--text-primary)] focus-ring appearance-none"
          >
            <option value="" disabled>Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.role})
              </option>
            ))}
          </select>
        </div>

        {/* Amount & Memo */}
        <div className="grid grid-cols-[1.5fr_1fr] gap-4">
          <div className="space-y-3">
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Amount (ETH)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-4 py-3 text-[16px] font-mono text-[var(--text-primary)] focus-ring"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Memo
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
              className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-4 py-3 text-[13px] text-[var(--text-primary)] focus-ring"
            />
          </div>
        </div>

        {/* Company Tongo key */}
        <AnimatePresence>
          {TONGO_CONFIG.isConfigured && selectedEmployee?.tongoPublicKey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-6 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Company Tongo Key
                    </label>
                    <span className="privacy-badge text-[9px] py-0 px-1.5">
                      <EyeOff size={8} /> Encrypted
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                    Not stored
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Used to build the encrypted transfer proof. Never stored or transmitted.
                </p>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={companyKey}
                    onChange={(e) => setCompanyKey(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-3 text-[13px] font-mono text-[var(--privacy)] focus-ring placeholder:text-[var(--text-muted)]"
                    style={{
                      boxShadow: companyKey ? "0 0 12px rgba(62,207,142,0.08)" : undefined,
                      borderColor: companyKey ? "var(--privacy-border)" : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result feedback */}
        <AnimatePresence>
          {(txHash || error) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                txHash
                  ? "bg-[rgba(62,207,142,0.06)] border-[var(--privacy-border)]"
                  : "bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.2)]"
              }`}
            >
              {txHash ? (
                <CheckCircle2 size={16} className="text-[var(--privacy)] mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-[var(--status-error)] mt-0.5 shrink-0" />
              )}
              <div className="text-[13px]">
                {txHash ? (
                  <span className="text-[var(--privacy)]">
                    Transfer submitted: <span className="font-mono text-[12px]">{txHash.slice(0, 12)}...{txHash.slice(-6)}</span>
                  </span>
                ) : (
                  <span className="text-[var(--status-error)]">{error}</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CalldataPreview calldata={builtCalldata} />

        {/* Submit */}
        <div className="pt-4">
          <button
            disabled={!selectedEmployee || !amountValid || submitting}
            onClick={() => void confirm()}
            className="w-full btn-primary py-3.5 text-[14px] flex justify-center items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Executing...
              </>
            ) : (
              <>
                {canPrivate ? <Lock size={14} /> : <ArrowUpRight size={14} />}
                {canPrivate ? "Confirm Confidential Transfer" : "Confirm Transfer"}
              </>
            )}
          </button>

          <div className="text-center mt-3 text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
            Executing via
            <span
              className={`font-mono ${
                walletType === "starkzap"
                  ? "text-[var(--accent-cyan)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {isConnected ? walletName : "None"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Sidebar Summary */}
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="card-glass p-6 space-y-6 sticky top-8"
      >
        <h4 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Live Summary
        </h4>

        {!selectedEmployee ? (
          <div className="text-[13px] text-[var(--text-muted)] pt-4">Awaiting details...</div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="text-[11px] text-[var(--text-muted)] mb-1">To</div>
              <div className="text-[14px] font-medium">{selectedEmployee.name}</div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                {selectedEmployee.walletAddress.slice(0, 8)}...{selectedEmployee.walletAddress.slice(-6)}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[var(--text-muted)] mb-1">Amount</div>
              <div className="font-mono text-[18px] font-semibold gradient-text">
                {amount || "0.00"} ETH
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[var(--text-muted)] mb-2">Transfer Path</div>
              {pathInfo.path === "tongo" ? (
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg animate-privacy-pulse"
                    style={{
                      background: "var(--privacy-muted)",
                      border: "1px solid var(--privacy-border)",
                    }}
                  >
                    <Lock size={13} className="text-[var(--privacy)] shrink-0" />
                    <span className="text-[12px] font-semibold text-[var(--privacy)]">
                      {pathInfo.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {pathInfo.sublabel}
                  </div>
                </div>
              ) : pathInfo.path === "standard" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                    <ArrowUpRight size={13} className="text-[var(--text-secondary)] shrink-0" />
                    <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                      {pathInfo.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {pathInfo.sublabel}
                  </div>
                  {pathInfo.missingItems.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-[11px] text-[var(--accent-cyan)] cursor-pointer hover:underline select-none">
                        Requirements for confidential
                      </summary>
                      <ul className="mt-1.5 ml-3 text-[11px] text-[var(--text-muted)] list-disc space-y-1">
                        {pathInfo.missingItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ) : (
                <div className="text-[12px] text-[var(--text-muted)]">
                  {pathInfo.label}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
