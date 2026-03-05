import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useCompanyStore, mockTxHash, type TokenSymbol } from "~/state/companyStore";
import { useToast } from "~/contexts/ToastContext";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

const TOKENS: TokenSymbol[] = ["STRK", "ETH", "USDC"];
const RATE_STRK_USDC = 0.45;
const SLIPPAGE_OPTIONS = [0.5, 1, 2];

export function StarkZapSwapView() {
  const { toast } = useToast();
  const wallet = useCompanyStore((s) => s.wallet);
  const addTransfer = useCompanyStore((s) => s.addTransfer);
  const setWalletBalances = useCompanyStore((s) => s.setWalletBalances);

  const [fromToken, setFromToken] = useState<TokenSymbol>("STRK");
  const [toToken, setToToken] = useState<TokenSymbol>("USDC");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [swapping, setSwapping] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fromBalance = wallet.connected ? wallet.balances[fromToken] : 0;
  const amountNum = parseFloat(amount) || 0;
  const estimatedOut = fromToken === "STRK" && toToken === "USDC"
    ? amountNum * RATE_STRK_USDC
    : fromToken === "USDC" && toToken === "STRK"
      ? amountNum / RATE_STRK_USDC
      : amountNum;
  const minReceived = estimatedOut * (1 - slippage / 100);
  const canSwap = wallet.connected && amountNum > 0 && amountNum <= fromBalance;

  function flipTokens() {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount("");
  }

  function setMax() {
    setAmount(String(fromBalance));
  }

  function handleSwap() {
    if (!canSwap) return;
    setSwapping(true);
    setTimeout(() => {
      const txHash = mockTxHash();
      setWalletBalances({
        [fromToken]: fromBalance - amountNum,
        [toToken]: (wallet.connected ? wallet.balances[toToken] : 0) + estimatedOut,
      });
      setSwapping(false);
      setConfirmOpen(false);
      setAmount("");
      toast(`Swap completed. Tx: ${txHash.slice(0, 10)}…${txHash.slice(-8)}`);
    }, 2000);
  }

  const connected = wallet.connected;
  const displayAddress = connected ? `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}` : "Not connected";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">StarkZap Swap</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Swap STRK, ETH, and USDC on StarkNet
        </p>
      </div>

      {!connected && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Connect a wallet or enable Demo Mode in the header to swap tokens.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-md mx-auto border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="size-5" />
            Swap
          </CardTitle>
          {connected && (
            <p className="text-sm text-zinc-500">
              {displayAddress} · {fromBalance.toLocaleString()} STRK, {wallet.balances.ETH.toFixed(1)} ETH, {wallet.balances.USDC.toLocaleString()} USDC
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4 space-y-2">
            <label className="text-xs text-zinc-500">From</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-zinc-500"
                disabled={!connected}
              />
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value as TokenSymbol)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                disabled={!connected}
              >
                {TOKENS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {connected && (
              <p className="text-xs text-zinc-500">
                Balance: {fromBalance.toLocaleString()} <Button type="button" variant="ghost" className="h-auto p-0 text-xs text-primary hover:underline" onClick={setMax}>MAX</Button>
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={flipTokens}
              className="rounded-full border-2 border-zinc-300 dark:border-zinc-600 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              aria-label="Flip tokens"
            >
              <ArrowLeftRight className="size-5" />
            </button>
          </div>

          <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4 space-y-2">
            <label className="text-xs text-zinc-500">To</label>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-lg font-medium text-zinc-500">
                {amountNum > 0 ? estimatedOut.toFixed(4) : "0"}
              </span>
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value as TokenSymbol)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                disabled={!connected}
              >
                {TOKENS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 text-sm space-y-1">
            <p className="flex justify-between text-zinc-500">
              <span>Rate</span>
              <span>1 {fromToken} = {fromToken === "STRK" && toToken === "USDC" ? RATE_STRK_USDC : fromToken === "USDC" && toToken === "STRK" ? (1 / RATE_STRK_USDC).toFixed(4) : "1"} {toToken}</span>
            </p>
            <p className="flex justify-between text-zinc-500">
              <span>Min. received</span>
              <span>{minReceived.toFixed(4)} {toToken}</span>
            </p>
            <p className="flex justify-between text-zinc-500">
              <span>Est. gas</span>
              <span>~0.001 ETH</span>
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Slippage</span>
            <div className="flex gap-1">
              {SLIPPAGE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlippage(s)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    slippage === s
                      ? "bg-brand-600 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  )}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>

          {!confirmOpen ? (
            <Button
              className="w-full"
              size="lg"
              disabled={!canSwap}
              onClick={() => setConfirmOpen(true)}
            >
              Swap
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
              <p className="text-sm font-medium">Confirm swap</p>
              <p className="text-sm text-zinc-500">
                {amount} {fromToken} → ~{estimatedOut.toFixed(4)} {toToken}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSwap} disabled={swapping}>
                  {swapping ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Swapping…
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
