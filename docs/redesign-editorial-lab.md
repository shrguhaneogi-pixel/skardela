# Editorial Interactive Visual Lab — Design Specification & Audit Ledger

## 1. Verified Baseline & Branch Integrity

- **Branch Name:** `design/editorial-interactive-visuals`
- **Parent Branch:** `design/hybrid-puzzle-studio`
- **Parent Commit Hash:** `cfe6c89099d5fb86f7e9c43e50617c88db1594fa`
- **Predecessor Branches & Hashes:**
  - `design/hybrid-puzzle-studio`: `cfe6c89099d5fb86f7e9c43e50617c88db1594fa`
  - `design/modern-puzzle-journal`: `f32cacab2f7ae63a91946a23f3da1ae226d077d9`
  - `design/obsidian-editorial`: `0a3281ee77143523e2efc840a2ac23a685e8ceb5`
  - `design/computational-playground`: `98a413b20bf4b74deabbdccdf0e609ffd624c0ff`
  - `main`: `f3c4cab33b1bdfd8e136aab6403717abf71b6486`
- **Working Tree Status:** Clean.
- **Baseline Build Metrics:**
  - Main JavaScript bundle: `451.61 kB` (Strict budget `< 550 kB`, Headroom: `98.39 kB`).
  - Total CSS bundle: `75.33 kB` (Strict budget `< 80 kB`, Headroom: `4.67 kB`).
  - Lazy puzzle chunks: `colour-binary` (`7.48 kB`), `guzzle` (`2.14 kB`), `Board` chunks (`11.05 kB`, `17.17 kB`) (Strict budget `< 40 kB` each).
  - Unit tests: 38 files, 174 tests passing.
  - Validation tests: 6 files, 19 tests passing.
  - Typecheck: 0 errors (`tsc -b`).
  - Lint: 0 errors, 0 warnings (`oxlint`).
  - Formatter: 179 files checked (`oxfmt`).

## 2. Visual Opportunity Map & Defect Analysis

| Route / Area            | Current State & Weakness                                                                                                        | Opportunity & Proposed Technique                                                                                                          | Technology                                             |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| **Global Shell & Hero** | Static badge and text intro; lacks distinctive editorial-computational identity.                                                | Interactive hero illustration that reacts to current daily puzzle data; subtle geometric editorial compass reticle.                       | SVG + Selective WebGL hero shader with canvas fallback |
| **Puzzle Previews**     | Four static glyphs (`● ■ ■ ●`); not connected to actual puzzle progress or layout.                                              | State-aware interactive preview: reads saved local puzzle progress and renders live board state or preview diagram with coordinate marks. | Deterministic SVG / CSS                                |
| **Colour Binary**       | Letters and colors change, but row/column parity count and trio-prevention constraints are invisible until a hint is requested. | Parity balance telemetry indicators along row/col headers, subtle cell state bloom, tactile solved configuration resolution.              | CSS + SVG state projection                             |
| **Guzzle**              | Words are typed into squares; letter relationship to the center anchor is purely conceptual.                                    | Semantic letter-graph connection lines showing discovered words, center letter radial anchor pulse, tactile keystroke confirmation.       | SVG overlay + CSS transitions                          |
| **Atlas**               | Generic progress bars and metric boxes; no spatial visualization of deduction skills.                                           | Constellation skill-radar chart showing real proficiency percentages; procedural geometric badge for streak.                              | Pure SVG data visualization                            |
| **Studio**              | Simple text forms; no live state-aware preview of generated boards.                                                             | Live responsive preview canvas responding immediately to size, seed, and difficulty controls.                                             | SVG preview engine                                     |
| **Duels & Expeditions** | Static list of cards and stages without visual progression feel.                                                                | Dynamic expedition route map with interconnected milestone nodes; duel challenge card with computational telemetry.                       | SVG path graphics + CSS                                |
| **Learn & Exchange**    | Flat text cards; lacks publication journal styling.                                                                             | Editorial diagrammatic callouts, tactile lesson step progression, cryptographic pack stamp for exchange.                                  | Editorial CSS + SVG                                    |
| **Solved States**       | Simple status message popup with basic scale animation.                                                                         | Publication seal of completion with procedural geometric rosette and verified badge.                                                      | SVG animation + CSS spring                             |

## 3. Rendering Hierarchy & Selective WebGL Strategy

1. **CSS First:** All layout, typography, focus outlines, button hover/press states, and transitions.
2. **SVG for Structure & Data:** Dynamic board state projections, constellation charts, expedition routes, letter-connection rays. Crisp at all DPIs, accessible, 0 external dependencies.
3. **Selective WebGL Experiment:**
   - Candidate: **Editorial Daily Hero Visualization (`EditorialHeroCanvas`)**.
   - Purpose: Visualizes the daily puzzle's computational essence as an interactive, subtly undulating vellum ink field with mathematical coordinate lines.
   - Implementation: Vanilla WebGL/WebGL2 shader without external dependencies (0 kB npm bloat).
   - Lifecycle: Clean WebGL context management, `webglcontextlost` / `webglcontextrestored` listeners, pause when out of viewport (IntersectionObserver), respect `prefers-reduced-motion`, full graceful fallback to deterministic SVG graphic.

## 4. Engineering & Performance Gates

- Strict CSS budget: `< 80 kB` (Current: `75.33 kB` -> must not exceed `80.0 kB`). Keep CSS additions under `4.0 kB` total.
- Strict JS budget: `< 550 kB` (Current: `451.61 kB`).
- Lazy chunk budget: `< 40 kB` each.
- Contrast: WCAG 2.1 AA >= 4.5:1.
- No external libraries introduced; pure React 19 + TypeScript + CSS Modules.
