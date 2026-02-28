import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface CopyWalletProps {
  value: string;
  truncated?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function CopyWallet({
  value,
  truncated = true,
  className,
  showLabel = false,
}: CopyWalletProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    });
  }, [value]);

  const display = truncated
    ? `${value.slice(0, 6)}…${value.slice(-4)}`
    : value;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="font-mono text-xs max-w-[120px] truncate" title={value}>
        {display}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy address"}
      >
        {copied ? (
          <Check className="size-3.5 text-green-500" />
        ) : (
          <Copy className="size-3.5 text-zinc-500" />
        )}
      </Button>
      {showLabel && copied && (
        <span className="text-xs text-zinc-500">Copied!</span>
      )}
    </span>
  );
}
