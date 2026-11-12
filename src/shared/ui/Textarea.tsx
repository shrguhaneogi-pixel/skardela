import type { ComponentProps } from "react";
import { cn } from "../utils";

// ASD-STE100 Simplified Technical English comments.
// Render a styled multiline textarea primitive for JSON and code input.
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full min-h-40 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-card)] p-3 font-mono text-sm text-[var(--text)] shadow-[inset_0_1px_2px_var(--border)] transition-colors placeholder:text-[var(--text-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
