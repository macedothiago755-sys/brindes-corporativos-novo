import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground",
        accent: "bg-accent text-accent-foreground",
        outline: "border border-border",
        success: "bg-success/15 text-success",
        destructive: "bg-destructive/15 text-destructive",
        magenta: "bg-brand-magenta text-white",
        blue: "bg-brand-blue text-white",
        warning: "bg-brand-yellow/20 text-amber-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
