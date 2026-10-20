# Hybrid Puzzle Studio — Branch Design Specification & Audit Ledger

## 1. Visual Direction & Architecture

- **Branch Name:** `design/hybrid-puzzle-studio`
- **Base Branch:** `design/modern-puzzle-journal` (verified commit `f32cacab2f7ae63a91946a23f3da1ae226d077d9`)
- **Historical Baseline:** `34235fa`
- **Visual Direction:** Hybrid Puzzle Studio — Editorial Precision × Computational Play × Tactile Game Feel.
- **Synthesis Concept:**
  - **Editorial Personality (Layer A):** Distinctive masthead hierarchy, daily-edition stamps, and literary display typography.
  - **Systemic Precision (Layer B):** Obsidian depth layering, disciplined 1px hairline borders, elevated dark surfaces, and strict performance limits.
  - **Computational Game Feel (Layer C):** Semantic geometric previews, subtle 24px coordinate grid alignment, tactile cell transitions, and monospace telemetry badges.
- **Primary Priority:** Balance puzzle usability, instant tactile feedback, accessible typography, and production stability.

## 2. Design Tokens & Typographic Synthesis

- **Color Palette & Contrast (WCAG 2.1 AA Compliant):**
  - Dark Surface / Background: Deep obsidian ink `#0d0f14` with layered vellum/charcoal cards (`rgba(18, 22, 32, 0.90)` and `#161b26`).
  - Light Surface / Background: Warm newsprint alabaster `#f8f9fa` with crisp card surfaces (`#ffffff`).
  - Primary Accent: Rich vermilion / amber ink (`#c2410c` light, `#fb923c` dark) with WCAG AA >= 4.5:1 contrast against all backgrounds.
  - Computational Secondary: Precision cyan annotation accent (`#0284c7` light, `#38bdf8` dark) for semantic state markers.
- **Typography Matrix:**
  - Editorial Headlines: `Syne` and serif display scales for publication masthead and page titles.
  - Body & Instructions: `Inter` for high-legibility clue reading and puzzle instructions.
  - Technical Annotations: Clean monospace (`ui-monospace`, `SFMono-Regular`, monospace) for coordinate stamps and edition metadata.
- **Surfaces, Grids & Hairlines:**
  - Dual-layer background: Subtle 24px geometric grid pattern combined with warm editorial radial vignettes.
  - Hairline borders: Precision 1px borders with inset glass specular highlights.
  - Tactile puzzle cells: Letterpress inset bevels and immediate keyboard focus indicators.

## 3. ReactBits Custom Cursor Evaluation Matrix

| Candidate        | Visual Fit                                                                         | Click Precision                                             | Text Readability                                         | Rendering Overhead                                                    | Touch / Coarse Fallback                            | Selected |
| :--------------- | :--------------------------------------------------------------------------------- | :---------------------------------------------------------- | :------------------------------------------------------- | :-------------------------------------------------------------------- | :------------------------------------------------- | :------- |
| **Shape Blur**   | Poor (diffuse blur softens sharp typography and borders)                           | Low (soft gradient edge prevents exact coordinate clicks)   | Medium (blur halos reduce clue reading comfort)          | High (continual GPU rasterization of blur kernel)                     | Requires media query kill switch                   | No       |
| **Crosshair**    | **Exceptional** (combines editorial register mark with precision drafting reticle) | **Superior** (1-pixel intersection aligns with tile grid)   | **Superior** (automatically suppressed over text inputs) | **Optimal** (hardware accelerated transform3d, zero React re-renders) | **Native fallback** via `@media (pointer: coarse)` | **YES**  |
| **Glyph Stream** | Low (random floating characters clash with word puzzles and clues)                 | Low (drifting glyph particles distract from cursor hotspot) | Low (conflicts directly with letter bank and grid)       | Moderate (continuous particle animation tick)                         | Requires media query kill switch                   | No       |

## 4. Engineering Gates & Budget Constraints

- Main JavaScript Bundle: Strict budget `< 550 kB` (Current baseline: `~452 kB`).
- Total CSS Bundle: Strict budget `< 80 kB` (Current baseline: `~72 kB`).
- Lazy Puzzle Chunks: Strict budget `< 40 kB` each.
- Contrast Ratio: Minimum 4.5:1 for normal text, 3:1 for large text / graphical borders.
- Responsive Range: Complete usability verified from `320px` to `1440px`.
- Keyboard Accessibility: Full 2D navigation, visible focus rings with `outline-offset: 2px`.
- Reduced Motion: Full functional equivalence under `prefers-reduced-motion: reduce`.

## 5. Improvement Sequence

1. `docs(hybrid): establish design audit and quality baseline`
2. `feat(hybrid): refine hybrid design tokens and typography`
3. `feat(hybrid): integrate editorial shell and responsive navigation`
4. `feat(hybrid): enhance daily challenge and puzzle previews`
5. `feat(hybrid): improve tactile puzzle interactions and feedback`
6. `feat(hybrid): apply hybrid studio styling across secondary pages`
7. `feat(hybrid): integrate semantic geometric visualizations`
8. `feat(hybrid): implement evaluated responsive cursor treatment`
9. `feat(hybrid): refine motion and completion states`
10. `fix(hybrid): resolve responsive accessibility regressions`
11. `docs(hybrid): finalize quality assessment and comparison report`
