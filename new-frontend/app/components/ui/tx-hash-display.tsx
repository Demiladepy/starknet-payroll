import { Copy, Check, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";
import { getTxUrl, isMockTxHash } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface TxHashDisplayProps {
  hash: string;
  className?: string;
  truncated?: boolean;
}

/** Shows tx hash with copy; links to Starkscan only when hash is real (not 0xMOCK_). */
export function TxHashDisplay({ hash, className, truncated = true }: TxHashDisplayProps) {
  const [copied, setCopied] = useState(false);
  const url = getTxUrl(hash);
  const mock = isMockTxHash(hash);
  const display = truncated ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : hash;

  const copy = useCallback(() => {
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [hash]);

  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-xs", className)}>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline truncate max-w-[180px]"
          title={hash}
        >
          {display}
        </a>
      ) : (
        <span className="truncate max-w-[180px]" title={hash}>
          {display}
        </span>
      )}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-zinc-500 hover:text-primary"
          aria-label="View on Starkscan"
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy hash"}
      >
        {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5 text-zinc-500" />}
      </Button>
      {mock && (
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider" title="Local record, not on-chain">
          mock
        </span>
      )}
    </span>
  );
}
