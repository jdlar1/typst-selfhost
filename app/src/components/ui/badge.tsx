import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 font-semibold text-[0.72rem] uppercase tracking-[0.04em]",
  {
    variants: {
      variant: {
        default:
          "border-border text-muted-foreground before:size-1.5 before:rounded-full before:bg-success before:content-['']",
        warning:
          "border-border text-muted-foreground before:size-1.5 before:rounded-full before:bg-warning before:content-['']",
        destructive:
          "border-border text-muted-foreground before:size-1.5 before:rounded-full before:bg-destructive before:content-['']",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
