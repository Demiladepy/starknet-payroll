import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "~/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [open, setOpen] = useState(false);

  const trigger = (
    <span
      className={cn("inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
    </span>
  );

  if (typeof document === "undefined") return trigger;
  if (!open) return trigger;

  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];

  return (
    <span className="relative inline-flex">
      {children}
      {createPortal(
        <div
          className={cn(
            "absolute z-50 rounded-md border border-zinc-200 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 shadow-md dark:border-zinc-700",
            positionClass
          )}
          role="tooltip"
        >
          {content}
        </div>,
        document.body
      )}
    </span>
  );
}
