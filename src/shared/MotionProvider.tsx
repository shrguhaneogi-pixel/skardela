import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "framer-motion";

// ASD-STE100 Simplified Technical English comments.
// Load DOM animation features asynchronously so the main JavaScript bundle stays small.
const loadMotionFeatures = () => import("./motion-features").then((mod) => mod.default);

// Provide LazyMotion and user reduced-motion configuration across the application tree.
export function MotionProvider({ children }: { readonly children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
