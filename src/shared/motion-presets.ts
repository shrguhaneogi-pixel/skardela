// ASD-STE100 Simplified Technical English comments.
// Shared Framer Motion transition curves and reusable micro-interaction presets.

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const CARD_ENTER_INITIAL = { opacity: 0, y: 10 } as const;
export const CARD_ENTER_ANIMATE = { opacity: 1, y: 0 } as const;
export const CARD_ENTER_TRANSITION = { duration: 0.24, ease: EASE_OUT_EXPO } as const;

export const PANEL_ENTER_INITIAL = { opacity: 0, scale: 0.96, y: 8 } as const;
export const PANEL_ENTER_ANIMATE = { opacity: 1, scale: 1, y: 0 } as const;
export const PANEL_ENTER_EXIT = { opacity: 0, scale: 0.96, y: 6 } as const;
export const PANEL_ENTER_TRANSITION = { duration: 0.2, ease: EASE_OUT_EXPO } as const;

export const OVERLAY_INITIAL = { opacity: 0 } as const;
export const OVERLAY_ANIMATE = { opacity: 1 } as const;
export const OVERLAY_EXIT = { opacity: 0 } as const;
export const OVERLAY_TRANSITION = { duration: 0.16, ease: EASE_OUT_EXPO } as const;

export const HINT_INITIAL = { opacity: 0, y: 8 } as const;
export const HINT_ANIMATE = { opacity: 1, y: 0 } as const;
export const HINT_EXIT = { opacity: 0, y: -6 } as const;
export const HINT_TRANSITION = { duration: 0.18, ease: EASE_OUT_EXPO } as const;

export const ITEM_ENTER_INITIAL = { opacity: 0, y: 8 } as const;
export const ITEM_ENTER_ANIMATE = { opacity: 1, y: 0 } as const;
export const ITEM_ENTER_EXIT = { opacity: 0, y: -6 } as const;
export const ITEM_TRANSITION = { duration: 0.18, ease: EASE_OUT_EXPO } as const;

export const ROSETTE_INITIAL = { opacity: 0, scale: 0.65, rotate: -18 } as const;
export const ROSETTE_ANIMATE = { opacity: 1, scale: 1, rotate: 0 } as const;
export const ROSETTE_TRANSITION = { type: "spring", stiffness: 280, damping: 20 } as const;

export const TAP_PRESS = { scale: 0.97 } as const;
export const TAP_TRANSITION = { duration: 0.1 } as const;
