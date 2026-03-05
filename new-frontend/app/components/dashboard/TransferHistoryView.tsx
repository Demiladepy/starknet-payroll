import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CopyWallet } from "~/components/ui/copy-wallet";
import { useCompanyStore, type UnifiedTransfer, type TransferType, type TokenSymbol } from "~/state/companyStore";
import { formatRelativeTime } from "~/lib/format";
import { History, Download } from "lucide-react";
import { cn } from "~/lib/utils";

export function TransferHistoryView() {
  const transfers = useCompanyStore((s) => s.transfers);
  const historyFilters = useCompanyStore((s) => s.historyFilters);
  const setHistoryFilters = useCompanyStore((s) => s.setHistoryFilters);

  const [typeFilter, setTypeFilter] = useState<TransferType | "">(historyFilters.type ?? "");
  const [tokenFilter, setTokenFilter] = useState<TokenSymbol | "">(historyFilters.token ?? "");

  const filtered = useMemo(() => {
    let list = [...transfers].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (typeFilter) list = list.filter((t) => t.type === typeFilter);
    if (tokenFilter) list = list.filter((t) => t.token === tokenFilter);
    if (historyFilters.fromDate) {
      list = list.filter((t) => t.timestamp >= historyFilters.fromDate!);
    }
    if (historyFilters.toDate) {
      list = list.filter((t) => t.timestamp.slice(0, 10) <= historyFilters.toDate!);
    }
    if (historyFilters.employeeId) {
      list = list.filter((t) => t.to.address === historyFilters.employeeId || t.to.name === historyFilters.employeeId);
    }
    return list;
  }, [transfers, typeFilter, tokenFilter, historyFilters]);

  const totalsByMethod = useMemo(() => {
    const byType: Record<TransferType, number> = {
      direct: 0,
      starkzap: 0,
      tongo: 0,
    };
    transfers.forEach((t) => {
      if (t.status === "completed") byType[t.type] += t.amount;
    });
    return byType;
  }, [transfers]);

  function exportCsv() {
    const headers = ["Date", "Type", "Recipient", "Address", "Amount", "Token", "Status", "Tx Hash"];
    const rows = filtered.map((t) => [
      new Date(t.timestamp).toISOString(),
      t.type,
      t.to.name,
      t.to.address,
      t.amount,
      t.token,
      t.status,
      t.txHash,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transfers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">Transfer History</h1>

      <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            Totals by method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-lg bg-blue-500/10 px-4 py-2">
              <span className="text-sm text-zinc-500">Direct</span>
              <p className="text-lg font-semibold text-blue-400">${totalsByMethod.direct.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 px-4 py-2">
              <span className="text-sm text-zinc-500">StarkZap</span>
              <p className="text-lg font-semibold text-amber-400">${totalsByMethod.starkzap.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-violet-500/10 px-4 py-2">
              <span className="text-sm text-zinc-500">Tongo</span>
              <p className="text-lg font-semibold text-violet-400">${totalsByMethod.tongo.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/30">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            All transfers
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => {
                const v = e.target.value as TransferType | "";
                setTypeFilter(v);
                setHistoryFilters({ type: v || undefined });
              }}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              <option value="direct">Direct</option>
              <option value="starkzap">StarkZap</option>
              <option value="tongo">Tongo</option>
            </select>
            <select
              value={tokenFilter}
              onChange={(e) => {
                const v = e.target.value as TokenSymbol | "";
                setTokenFilter(v);
                setHistoryFilters({ token: v || undefined });
              }}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              aria-label="Filter by token"
            >
              <option value="">All tokens</option>
              <option value="STRK">STRK</option>
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
            <Button size="sm" variant="outline" onClick={exportCsv}>
              <Download className="size-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-zinc-500">No transfers match the filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 text-left text-zinc-400">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">From</th>
                    <th className="pb-3 pr-4">To</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Token</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-3 pr-4" title={new Date(t.timestamp).toLocaleString()}>
                        {formatRelativeTime(t.timestamp)}
                      </td>
                      <td className="py-3 pr-4">
                        <TypeBadge type={t.type} />
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs truncate max-w-[100px]" title={t.from}>
                        {t.from.slice(0, 8)}…
                      </td>
                      <td className="py-3 pr-4">
                        {t.to.name} <CopyWallet value={t.to.address} />
                      </td>
                      <td className="py-3 pr-4">${t.amount.toLocaleString()}</td>
                      <td className="py-3 pr-4">{t.token}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3">
                        <CopyWallet value={t.txHash} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TypeBadge({ type }: { type: TransferType }) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded text-xs font-medium",
        type === "starkzap" && "bg-amber-600/20 text-amber-400",
        type === "tongo" && "bg-violet-600/20 text-violet-400",
        type === "direct" && "bg-blue-600/20 text-blue-400"
      )}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: UnifiedTransfer["status"] }) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded text-xs",
        status === "completed" && "bg-emerald-600/20 text-emerald-400",
        status === "pending" && "bg-amber-600/20 text-amber-400",
        status === "failed" && "bg-red-600/20 text-red-400"
      )}
    >
      {status}
    </span>
  );
}
