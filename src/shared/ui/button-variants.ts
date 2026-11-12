import { cva } from "class-variance-authority";

// ASD-STE100 Simplified Technical English comments.
// Define shared button style variants for buttons and styled links.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-semibold text-sm transition-all duration-150 cursor-pointer no-underline select-none focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-55 active:translate-y-px active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-[var(--on-accent)] border border-transparent forced-colors:border-[ButtonText] shadow-[var(--shadow-sm)] hover:bg-[var(--accent-hover)] hover:-translate-y-px hover:shadow-[var(--shadow-md),var(--accent-glow)]",
        secondary:
          "bg-[var(--surface)] text-[var(--text-h)] border border-[var(--border)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-muted-hover)] hover:border-[var(--accent-border)] hover:-translate-y-px",
        accentTint:
          "bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] shadow-[var(--shadow-sm)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-[var(--on-accent)] hover:-translate-y-px hover:shadow-[var(--shadow-md),var(--accent-glow)]",
        destructive:
          "bg-[var(--surface-elevated)] text-[var(--red)] border border-[var(--border)] shadow-[var(--shadow-sm)] hover:bg-[var(--red)] hover:text-[var(--on-colour)] hover:border-[var(--red)] hover:-translate-y-px hover:shadow-[var(--shadow-md)]",
        ghost:
          "bg-transparent text-[var(--text-muted)] border border-transparent hover:bg-[var(--surface-hover)] hover:text-[var(--text-h)]",
      },
      size: {
        default: "min-h-10 px-5 py-2",
        sm: "min-h-9 px-3.5 py-1.5 text-[0.8125rem]",
        lg: "min-h-11 px-5 py-2.5",
        pill: "min-h-10 px-6 py-2.5 rounded-full text-[0.9375rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);
