import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  useCompanyStore,
  mockSecretNote,
  mockTxHash,
  mockNoteHash,
  type TokenSymbol,
} from "~/state/companyStore";
import { useToast } from "~/contexts/ToastContext";
import { Shield, Lock, Loader2, Copy, AlertTriangle } from "lucide-react";
import { cn } from "~/lib/utils";

const TOKENS: TokenSymbol[] = ["STRK", "ETH", "USDC"];
const DENOMINATIONS = [100, 500, 1000, 5000];

export function TongoView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefillTo = searchParams.get("to");
  const [tab, setTab] = useState<"deposit" | "withdraw">(prefillTo ? "withdraw" : "deposit");
  const { toast } = useToast();
  const wallet = useCompanyStore((s) => s.wallet);
  const employees = useCompanyStore((s) => s.employees);
  const tongoNotes = useCompanyStore((s) => s.tongoNotes);
  const addTongoNote = useCompanyStore((s) => s.addTongoNote);
  const markTongoWithdrawn = useCompanyStore((s) => s.markTongoWithdrawn);
  const addTransfer = useCompanyStore((s) => s.addTransfer);

  const [depositToken, setDepositToken] = useState<TokenSymbol>("USDC");
  const [depositDenom, setDepositDenom] = useState(1000);
  const [depositing, setDepositing] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<{ secretNote: string; noteHash: string } | null>(null);
  const [savedNoteChecked, setSavedNoteChecked] = useState(false);

  const [withdrawNote, setWithdrawNote] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawVerifyDone, setWithdrawVerifyDone] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (prefillTo) {
      setTab("withdraw");
      setWithdrawAddress(prefillTo);
      setSearchParams({}, { replace: true });
    }
  }, [prefillTo, setSearchParams]);

  const connected = wallet.connected;
  const depositedNotes = tongoNotes.filter((n) => n.status === "deposited");

  function handleDeposit() {
    if (!connected) return;
    setDepositing(true);
    setGeneratedNote(null);
    setSavedNoteChecked(false);
    setTimeout(() => {
      const secretNote = mockSecretNote();
      const noteHash = mockNoteHash(secretNote);
      addTongoNote({
        token: depositToken,
        denominationUsd: depositDenom,
        secretNote,
      });
      setGeneratedNote({ secretNote, noteHash });
      setDepositing(false);
      toast("Deposit simulated. Save your secret note!");
    }, 2000);
  }

  function copyNote() {
    if (generatedNote) {
      navigator.clipboard.writeText(generatedNote.secretNote);
      toast("Note copied to clipboard.");
    }
  }

  function handleVerifyNote() {
    const note = tongoNotes.find((n) => n.secretNote === withdrawNote.trim());
    if (note) {
      setWithdrawVerifyDone(true);
      toast("Note verified. You can withdraw.");
    } else {
      toast("Note not found or already withdrawn.");
    }
  }

  function handleWithdraw() {
    const note = tongoNotes.find((n) => n.secretNote === withdrawNote.trim());
    if (!note || !withdrawAddress.trim()) return;
    setWithdrawing(true);
    setTimeout(() => {
      markTongoWithdrawn(note.id, withdrawAddress.trim());
      addTransfer({
        type: "tongo",
        from: "Tongo Pool",
        to: { name: "Recipient", address: withdrawAddress.trim() },
        amount: note.denominationUsd,
        token: note.token,
        txHash: mockTxHash(),
        status: "completed",
        private: true,
        tongoNoteHash: note.noteHash,
      });
      setWithdrawing(false);
      setWithdrawNote("");
      setWithdrawAddress("");
      setWithdrawVerifyDone(false);
      toast("Withdrawal completed. No on-chain link between sender and recipient.");
    }, 2000);
  }

  function runQuickDemo() {
    if (!connected) return;
    setTab("deposit");
    setDepositToken("USDC");
    setDepositDenom(1000);
    setDepositing(true);
    setGeneratedNote(null);
    setTimeout(() => {
      const secretNote = mockSecretNote();
      addTongoNote({ token: "USDC", denominationUsd: 1000, secretNote });
      setGeneratedNote({ secretNote, noteHash: mockNoteHash(secretNote) });
      setDepositing(false);
      setSavedNoteChecked(true);
      toast("Demo: deposit done. Switch to Withdraw and paste the note.");
      const emp = employees[0];
      if (emp) setWithdrawAddress(emp.address);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Tongo Private Transfer</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Send payments with privacy — no on-chain link between sender and recipient
        </p>
      </div>

      <Card className="border-violet-500/30 bg-violet-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="size-6 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-200">How it works</p>
              <p className="text-sm text-zinc-400 mt-1">
                Sender deposits funds into a Tongo shielded pool → a secret note is generated. Recipient withdraws using the note — breaking the on-chain link between sender and receiver.
              </p>
              <p className="text-sm text-zinc-500 mt-2 flex items-center gap-1">
                <Lock className="size-4" /> Sender → 🔒 Tongo Pool → Recipient · No on-chain link
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!connected && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Connect a wallet or enable Demo Mode to use Tongo.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-lg mx-auto border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-violet-400" />
              Tongo
            </CardTitle>
            <div className="flex rounded-lg bg-zinc-100/70 dark:bg-zinc-900/60 p-1 border border-zinc-200/70 dark:border-zinc-800/70">
              <button
                type="button"
                onClick={() => setTab("deposit")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  tab === "deposit" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-zinc-100"
                )}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setTab("withdraw")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  tab === "withdraw" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-zinc-100"
                )}
              >
                Withdraw
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Anonymity set: {tongoNotes.length + 142} deposits in this pool
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {tab === "deposit" && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Token</label>
                <select
                  value={depositToken}
                  onChange={(e) => setDepositToken(e.target.value as TokenSymbol)}
                  className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
                  disabled={!connected}
                >
                  {TOKENS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Denomination (USD)</label>
                <div className="flex gap-2 flex-wrap">
                  {DENOMINATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDepositDenom(d)}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium",
                        depositDenom === d
                          ? "bg-violet-600 text-white"
                          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {!generatedNote ? (
                <Button
                  className="w-full"
                  disabled={!connected || depositing}
                  onClick={handleDeposit}
                >
                  {depositing ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Depositing…
                    </>
                  ) : (
                    "Deposit to Tongo Pool"
                  )}
                </Button>
              ) : (
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 space-y-3">
                  <p className="flex items-center gap-2 text-amber-400 font-medium">
                    <AlertTriangle className="size-4" />
                    Save this note! It&apos;s the only way to withdraw. It cannot be recovered.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all text-xs font-mono text-zinc-300 bg-zinc-800 px-2 py-2 rounded">
                      {generatedNote.secretNote}
                    </code>
                    <Button size="icon" variant="secondary" onClick={copyNote}>
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-zinc-400">
                    <input
                      type="checkbox"
                      checked={savedNoteChecked}
                      onChange={(e) => setSavedNoteChecked(e.target.checked)}
                      className="rounded border-zinc-500"
                    />
                    I have saved my note
                  </label>
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={!savedNoteChecked}
                    onClick={() => {
                      setGeneratedNote(null);
                      setSavedNoteChecked(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </>
          )}

          {tab === "withdraw" && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Paste your secret note</label>
                <textarea
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="0x..."
                  rows={3}
                  className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100 font-mono text-sm placeholder:text-zinc-500"
                  disabled={!connected}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                disabled={!withdrawNote.trim()}
                onClick={handleVerifyNote}
              >
                Verify Note
              </Button>
              {withdrawVerifyDone && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Recipient wallet</label>
                    <select
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
                    >
                      <option value="">Select employee or paste below</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.address}>{e.name} — {e.address.slice(0, 10)}…</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      placeholder="Or paste address"
                      className="mt-2 w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100 text-sm placeholder:text-zinc-500"
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!withdrawAddress.trim() || withdrawing}
                    onClick={handleWithdraw}
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Withdrawing…
                      </>
                    ) : (
                      "Withdraw to Address"
                    )}
                  </Button>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {connected && (
        <Card className="max-w-lg mx-auto border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm">Note history</CardTitle>
          </CardHeader>
          <CardContent>
            {tongoNotes.length === 0 ? (
              <p className="text-sm text-zinc-500">No notes yet. Deposit to generate one.</p>
            ) : (
              <ul className="space-y-2">
                {tongoNotes.slice(0, 5).map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center justify-between rounded-md bg-zinc-800 px-3 py-2 text-sm"
                  >
                    <span className="font-mono text-zinc-400 truncate max-w-[120px]">{n.noteHash.slice(0, 14)}…</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs",
                        n.status === "deposited" && "bg-amber-600/20 text-amber-400",
                        n.status === "withdrawn" && "bg-emerald-600/20 text-emerald-400",
                        n.status === "expired" && "bg-red-600/20 text-red-400"
                      )}
                    >
                      {n.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {connected && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={runQuickDemo}>
            Quick Demo (deposit + withdraw flow)
          </Button>
        </div>
      )}
    </div>
  );
}
