# Skardela Visual Design Overhaul Architecture & Baseline

## 1. Project Baseline & Architecture

- **Framework:** React 19.3.0
- **Routing:** React Router 8.4.0
- **Build Tool:** Vite 8.3.1 with React Compiler Babel preset
- **Type Checking:** TypeScript 6.0.2 with strict mode
- **Linting & Formatting:** Oxlint 1.86.0 and Oxfmt 0.71.0
- **Testing:** Vitest 5.0.2 (unit tests with JSDOM and validation tests with Node)
- **Styling Architecture:** Pure CSS Modules (`*.module.css`) + global CSS custom properties (`src/index.css`)
- **Accessibility Invariants:** WCAG 2.1 AA text contrast, dual visual encoding, `:focus-visible` offset outlines, `@media (prefers-reduced-motion)` overrides, and landmark navigation.
- **Initial Verification:** All 37 unit test files (167 tests) and 6 validation suites (19 tests) pass with zero errors or warnings.

---

## 2. Art Direction: Precision Puzzle Studio

The visual overhaul establishes Skardela as a **Precision Puzzle Studio**:

- **Aesthetic:** Editorial, focused, dark-first, quietly sophisticated, and mathematically disciplined.
- **Palette:** Rich obsidian/charcoal surfaces with deep radial ambient gradients, paired with warm glowing orange/amber accents (`--accent`) and crisp contrast for puzzle state indicators.
- **Surfaces:** Tactile elevated glass panels with restrained backdrop filters (`backdrop-filter: blur(16px)`), razor-thin hairline borders (`--border`), and inner rim highlights.
- **Focus:** Complete preservation of puzzle mechanics, keyboard navigation, high contrast, and responsive layout integrity.

---

## 3. Reactive Cursor Evaluation Matrix

Three candidate cursor treatments from React Bits were systematically evaluated against Skardela's specific logic and word-puzzle context:

| Evaluation Criterion          | Shape Blur                                                                                 | Glyph Stream                                                                  | Crosshair (Selected)                                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product Fit**               | Moderate. Lens blur fits photography/creative tools, but feels ungrounded in a logic grid. | Low. Cascading letters/glyphs create visual noise across static puzzle grids. | **Exceptional.** Crosshairs and precision reticles directly embody mathematical precision, coordinate geometry, and deduction.                                                                     |
| **Visual Clarity**            | Poor. Distorts and blurs puzzle cell numbers, letters, and instructions under the cursor.  | Poor. Trailing stream of floating symbols obscures board states.              | **High.** Razor-thin 1px coordinate guides and fine reticle ring preserve 100% board readability.                                                                                                  |
| **Interaction Usability**     | Degrades puzzle clicking accuracy by obscuring cell boundaries.                            | Obstructs target feedback on interactive cells.                               | **High.** Enhances targeting feel; reticle expands smoothly over clickable elements and contracts over the board.                                                                                  |
| **Performance**               | High GPU cost (heavy canvas/SVG filter calculations on pointer movement).                  | High DOM/canvas overhead tracking multiple glyph particles.                   | **Optimal.** Zero extra dependencies; animated via `requestAnimationFrame` and CSS hardware-accelerated transforms (`translate3d`).                                                                |
| **Implementation Complexity** | High; requires external canvas shaders or SVG blur pipelines.                              | High; Pro component requiring proprietary upstream code/tokens.               | **Clean & Self-Contained.** Pure TypeScript + CSS Module component with zero bundle bloat.                                                                                                         |
| **Accessibility & Fallback**  | Hard to isolate; risk of obscuring content for low-vision users.                           | Violates calm focus; perpetual movement distracts neurodivergent users.       | **Robust.** Automatically disabled on coarse pointers (`pointer: coarse`, touch screens), suppressed under `prefers-reduced-motion`, and hidden over text inputs to preserve native I-beam cursor. |
| **Availability & Licensing**  | Available in React Bits.                                                                   | React Bits Pro (restricted access / paywalled).                               | **Available & Verified.** Built according to open React Bits crosshair patterns.                                                                                                                   |
| **Maintainability**           | Fragile canvas resize and context handling.                                                | Complex particle lifecycles and memory leaks.                                 | **High.** Clean React lifecycle with passive event listeners and cancellation.                                                                                                                     |

**Decision:**
**Crosshair** is selected. It reinforces Skardela's precision puzzle studio identity without compromising readability, performance, or accessibility.

---

## 4. Phased Implementation Roadmap

1. `chore: establish visual overhaul baseline` — Architectural audit and reactive cursor evaluation matrix.
2. `feat: introduce cohesive design token system` — Modernized design tokens for surface depth, contrast, spacing, elevation, and motion.
3. `feat: integrate display and body typography` — Typography hierarchy pairing `Syne` (display) and `Inter` (body) with fluid optical scaling.
4. `feat: refine buttons and interaction states` — Accessible tactile button states, active scale response, and focus illumination.
5. `feat: implement responsive reactive cursor` — Performant crosshair reticle with coordinate tracking, touch detection, and input pass-through.
6. `feat: polish page layouts and puzzle cards` — Hero presentation, daily challenge card, puzzle cards, navigation, and practice queue.
7. `fix: improve responsive accessibility and visual regressions` — Multi-viewport responsive polish and WCAG validation.
