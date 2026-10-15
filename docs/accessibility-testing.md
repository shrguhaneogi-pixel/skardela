# Accessibility Testing & Verification Protocol

This document defines automated regression checks and manual screen-reader verification requirements for Skardela.

## 1. Automated Coverage

The automated accessibility regression suite (`src/app/a11y-regression.test.tsx`) verifies:

- **Landmark Navigation**: Presence of skip link (`#main`), `<main tabIndex={-1}>`, and labeled `<nav>`.
- **Keyboard Traversal**: 2D directional arrow navigation (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) skipping unplayable squares.
- **Focus Indicators**: Visible `:focus-visible` outlines with 2px offset.
- **Contrast Invariants**: WCAG 2.1 AA compliant relative luminance ratios (>= 4.5:1 for body text, >= 3:1 for large graphical elements).
- **Media Query Resilience**: Full `@media (prefers-reduced-motion: reduce)` cancellation of animations and `@media (forced-colors: active)` border adaptations.

## 2. Essential Manual Screen Reader Checks

Automated testing cannot evaluate auditory speech output or screen-reader pronunciation. Perform the following checks manually with physical screen readers:

### NVDA (Windows / Firefox or Chrome)

1. Navigate to HomePage with `Tab` and verify the Skip Link appears visibly and moves focus directly to `#main`.
2. Open Colour Binary. Use arrow keys to navigate the grid. Verify NVDA speaks row, column, current colour, fixed status, and any active logic premise.
3. Type `r` or `b`. Verify NVDA announces colour placement.

### VoiceOver (macOS / Safari & iOS)

1. Navigate with VO cursor (`Control` + `Option` + arrows) through Guzzle board.
2. Verify live announcements in the `<output role="status" aria-live="polite">` region read feedback for correct, present, and absent letter moves.
3. Test double-tap letter bank selection on iOS touch screens.

### TalkBack (Android / Chrome)

1. Touch explore each puzzle cell. Verify double-tap activates the cell.
2. Verify dual-symbol indicators (● for Red, ■ for Blue, ✓/↔/✗ for Guzzle) are announced cleanly.

## 3. High-Contrast and Zoom Verification

1. Enable Windows High Contrast Mode / Forced Colors (`Alt` + `Left Shift` + `Print Screen`). Verify all puzzle borders, grid lines, and interactive states render with system `Highlight` and `ButtonText` colours.
2. Zoom browser viewport to 200% and 400%. Verify grid layout scales responsively without horizontal overflow clipping.
