# Computational Playground — Branch Design Specification & Audit Ledger

## 1. Visual Direction & Architecture

- **Branch Name:** `design/computational-playground`
- **Visual Direction:** Computational Playground — An experimental interactive puzzle environment where geometric computation, spatial logic, and algorithmic patterns become the visual identity.
- **Visual Ambition:** High visual impact via lightweight procedural SVG / HTML5 canvas patterns without bloated external WebGL engines. Strict budget compliance (< 550 kB JS, < 80 kB CSS).
- **Primary Priority:** Visual identity, spatial pattern discovery, connected cell relationships, and deductive feedback.

## 2. Design Tokens & Typographic Hierarchy

- **Color Palette:**
  - Dark Surface / Background: Deep computational matrix `#0b0d12` with elevated technical panels (`rgba(17, 24, 39, 0.85)` and `#131b2a`).
  - Light Surface / Background: High-contrast technical blueprint `#f3f4f6` with clean white panels (`#ffffff`).
  - Primary Accent: High-energy electric amber/orange (`#f97316` / `#ea580c`), cyan computational accents (`#06b6d4`), and crisp state indicators.
  - WCAG 2.1 AA Compliance: Contrast invariants preserved with 4.5:1 minimum ratio on all text elements.
- **Typography:**
  - Technical Badging: Tabular monospace coordinates `[X:04, Y:02]`, algorithmic step counters `ALG-01`.
  - Display Font: `Syne` with technical uppercase tracking.
  - Body Font: `Inter` for clue and rule accessibility.
- **Surfaces & Vectors:**
  - Geometric dot-grid background and circuit-like boundary separators.
  - Vector connection indicators between adjacent puzzle cells.

## 3. ReactBits Custom Cursor Evaluation Matrix

| Candidate | Visual Fit | Click Precision | Text Readability | Rendering Overhead | Touch / Coarse Fallback | Selected |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Shape Blur** | Low (diffuse blur softens sharp geometric grid lines) | Low (soft gradient edge prevents exact coordinate clicks) | Medium (blur halos interfere with letter legibility) | High (continual GPU rasterization of blur kernel) | Requires media query kill switch | No |
| **Crosshair** | **Exceptional** (hairline coordinate axes perfectly complement computational matrix) | **Superior** (1-pixel intersection matches tile coordinate grid) | **Superior** (suppressed over text inputs, clean 1px lines) | **Optimal** (hardware accelerated CSS transform3d, 0 renders) | **Native fallback** via `@media (pointer: coarse)` | **YES** |
| **Glyph Stream** | Moderate (matrix glyph concept fits computational theme) | Low (trailing glyph particle trail obscures adjacent cells) | Low (stream characters collide with word puzzle letter banks) | Moderate (continuous particle requestAnimationFrame ticks) | Requires media query kill switch | No |

## 4. Implementation Steps & Verification Plan

1. **Tokens & Matrix Background:** Add computational dot-grid backgrounds and geometric panel tokens to `src/index.css`.
2. **Technical Shell:** Style navigation with monospace indicators, circuit dividers, and technical theme switcher.
3. **Algorithmic Desk:** Redesign HomePage with coordinate tags, algorithmic previews, and technical level switches.
4. **Connected Board Cells:** Enhance `Board.module.css` with geometric corner markers and spatial axis cues.
5. **Secondary Pages:** Elevate Archive, Atlas, Studio, and Duels with computational lab styling.
6. **Technical Reticle Cursor:** Implement precision coordinate crosshair reticle with instant hardware transforms.
