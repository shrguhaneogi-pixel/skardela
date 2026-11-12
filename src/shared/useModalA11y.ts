import { useEffect, useRef } from "react";

// ASD-STE100 Simplified Technical English comments.
// Provide accessible Escape dismissal, backdrop click, and focus management for modal dialogs.

const FOCUSABLE_SELECTOR =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(panel: HTMLElement): HTMLElement[] {
  return [...panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (el) => !el.closest('[hidden], [aria-hidden="true"]'),
  );
}

function trapTabKey(event: KeyboardEvent, panel: HTMLElement) {
  const focusable = getFocusableElements(panel);
  if (focusable.length === 0) {
    event.preventDefault();
    panel.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;

  const active = document.activeElement;
  if (!panel.contains(active)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
    return;
  }

  if (event.shiftKey) {
    if (active === first || active === panel) {
      event.preventDefault();
      last.focus();
    }
  } else if (active === last || active === panel) {
    event.preventDefault();
    first.focus();
  }
}

export function useModalA11y(onClose: () => void) {
  const overlayRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      } else if (event.key === "Tab" && panelRef.current) {
        trapTabKey(event, panelRef.current);
      }
    }

    const overlay = overlayRef.current;
    function handleBackdropClick(event: MouseEvent) {
      if (event.target === overlay) onCloseRef.current();
    }

    document.addEventListener("keydown", handleKeyDown);
    overlay?.addEventListener("click", handleBackdropClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      overlay?.removeEventListener("click", handleBackdropClick);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return { overlayRef, panelRef };
}
