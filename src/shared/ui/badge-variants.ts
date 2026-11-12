import { cva } from "class-variance-authority";

// ASD-STE100 Simplified Technical English comments.
// Define shared badge variants for status pills, metadata tags, and labels.
export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-semibold tracking-[0.02em] transition-colors",
  {
    variants: {
      variant: {
        default:
          "rounded-[var(--radius-xs)] bg-[var(--surface-muted)] border border-[var(--border)] px-2.5 py-1 font-mono text-xs uppercase tracking-[0.05em] text-[var(--text-h)]",
        accent:
          "rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent-text)]",
        success:
          "rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--green)] px-2 py-0.5 text-xs font-semibold text-[var(--green)]",
        muted:
          "rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
