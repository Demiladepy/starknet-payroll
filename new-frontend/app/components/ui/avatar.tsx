import { cn } from "~/lib/utils";
import { getAvatarColorClass } from "~/lib/avatar";

export function Avatar({
  name,
  initials,
  className,
}: {
  name: string;
  initials?: string;
  className?: string;
}) {
  const letters =
    initials ??
    name
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  const colorClass = getAvatarColorClass(name);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-xs font-medium",
        colorClass,
        className
      )}
      aria-label={name}
    >
      {letters}
    </div>
  );
}
