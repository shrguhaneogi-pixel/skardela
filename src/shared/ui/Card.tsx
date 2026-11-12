import type { ComponentProps } from "react";
import { cn } from "../utils";

// ASD-STE100 Simplified Technical English comments.
// Provide reusable tactile glass card containers and typography subcomponents.
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("sk-surface-card p-5 sm:p-6", className)} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function CardTitle({ className, children, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "font-display text-xl font-bold tracking-[-0.02em] text-[var(--text-h)] m-0",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-[var(--text-muted)] leading-relaxed m-0", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("pt-3", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-3 pt-4", className)} {...props} />;
}
