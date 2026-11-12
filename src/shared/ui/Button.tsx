import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import type { HTMLMotionProps } from "framer-motion";
import * as m from "framer-motion/m";
import { TAP_PRESS, TAP_TRANSITION } from "../motion-presets";
import { cn } from "../utils";
import { buttonVariants } from "./button-variants";

// ASD-STE100 Simplified Technical English comments.
// Render a reusable button primitive with accessible focus and tactile press feedback.
export type ButtonProps = Omit<ComponentProps<"button">, keyof HTMLMotionProps<"button">> &
  HTMLMotionProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  disabled,
  whileTap,
  transition,
  ...props
}: ButtonProps) {
  return (
    <m.button
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), className)}
      whileTap={disabled ? undefined : (whileTap ?? TAP_PRESS)}
      transition={transition ?? TAP_TRANSITION}
      {...props}
    />
  );
}
