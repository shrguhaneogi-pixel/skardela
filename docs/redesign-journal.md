# Modern Puzzle Journal — Branch Design Specification & Audit Ledger

## 1. Visual Direction & Architecture

- **Branch Name:** `design/modern-puzzle-journal`
- **Visual Direction:** Modern Puzzle Journal — A bold editorial puzzle journal that combines the intimacy of a daily ritual with the polish of a contemporary digital publication.
- **Visual Ambition:** High editorial polish using literary typography, warm ink-and-parchment surfaces, and print-inspired layouts while preserving lightweight execution and strict bundle budgets.
- **Primary Priority:** Balance of puzzle usability, tactile solving, and distinctive publication identity.

## 2. Design Tokens & Typographic Hierarchy

- **Color Palette:**
  - Dark Surface / Background: Deep printing ink `#0d0f14` with vellum dark card layers (`rgba(22, 26, 35, 0.88)`).
  - Light Surface / Background: Warm newsprint / alabaster `#f8f9fa` with crisp vellum card surfaces (`#ffffff`).
  - Primary Accent: Rich amber / vermillion printing ink (`#c2410c` light, `#fb923c` dark).
  - WCAG 2.1 AA Compliance: All text and heading tokens exceed 4.5:1 contrast ratio against respective backgrounds.
- **Typography:**
  - Display Font: `Syne` and serif editorial headlines ("THE SKARDELA CHRONICLE").
  - Content & Grid Font: `Inter` and high-legibility system sans for clear clues, rules, and puzzle cells.
  - Edition Markers: Small-caps editorial volume and issue stamps (`VOL. IV • NO. 294`).
- **Surfaces & Borders:**
  - Fine ink hairline borders and classic typographic section rules.
  - Letterpress tactile inset bevels on interactive puzzle squares.

## 3. ReactBits Custom Cursor Evaluation Matrix

| Candidate        | Visual Fit                                                                                    | Click Precision                                                  | Text Readability                                            | Rendering Overhead                                            | Touch / Coarse Fallback                            | Selected |
| :--------------- | :-------------------------------------------------------------------------------------------- | :--------------------------------------------------------------- | :---------------------------------------------------------- | :------------------------------------------------------------ | :------------------------------------------------- | :------- |
| **Shape Blur**   | Poor (diffuse blur clashes with sharp editorial typography and ink rules)                     | Low (blurry edge prevents exact cell placement)                  | Medium (blur halos reduce clue reading comfort)             | High (continual GPU rasterization of blur kernel)             | Requires media query kill switch                   | No       |
| **Crosshair**    | **Exceptional** (fine hairline drafting reticle evokes editorial proofreader's register mark) | **Superior** (1-pixel intersection matches tile coordinate grid) | **Superior** (suppressed over text inputs, clean 1px lines) | **Optimal** (hardware accelerated CSS transform3d, 0 renders) | **Native fallback** via `@media (pointer: coarse)` | **YES**  |
| **Glyph Stream** | Low (random stream characters clash with carefully typeset editorial copy)                    | Low (floating glyphs distract from crossword/letter solving)     | Low (stream glyphs collide with puzzle letters)             | Moderate (continuous particle animation tick)                 | Requires media query kill switch                   | No       |

## 4. Implementation Steps & Verification Plan

1. **Tokens & Editorial Atmosphere:** Add warm ink surfaces, editorial typography, and print rules to `src/index.css`.
2. **Masthead Shell:** Style header with publication masthead aesthetic, refined edition navigation, and theme switcher.
3. **Daily Edition (Front Page):** Redesign HomePage as an editorial morning edition with issue date stamps and puzzle features.
4. **Letterpress Boards:** Enhance `Board.module.css` with clean editorial ink borders and crisp tactile cell states.
5. **Back Issues & Archive:** Elevate Archive, Atlas, Studio, and Duels with bound-volume catalog styling.
6. **Editorial Reticle Cursor:** Implement fine proofreader's register crosshair with instant hardware transforms.
