import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../utils";
import { buttonVariants } from "./button-variants";

// ASD-STE100 Simplified Technical English comments.
// Render a reusable button primitive with accessible focus and press feedback.
export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
