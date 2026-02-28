import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white",
        secondary:
          "border-transparent bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        success:
          "border-transparent bg-green-500/20 text-green-700 dark:text-green-400",
        destructive:
          "border-transparent bg-red-500/20 text-red-700 dark:text-red-400",
        outline: "text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
