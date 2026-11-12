import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../utils";
import { badgeVariants } from "./badge-variants";

// ASD-STE100 Simplified Technical English comments.
// Render a compact status or category badge.
export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
