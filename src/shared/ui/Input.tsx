import type { ComponentProps } from "react";
import { cn } from "../utils";

// ASD-STE100 Simplified Technical English comments.
// Render a styled single-line text input primitive.
export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "w-full min-h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-h)] shadow-[var(--shadow-sm)] transition-colors placeholder:text-[var(--text-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
