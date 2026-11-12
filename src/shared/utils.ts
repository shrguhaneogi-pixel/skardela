import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ASD-STE100 Simplified Technical English comments.
// Merge Tailwind CSS classes and conditional class names without conflicts.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
