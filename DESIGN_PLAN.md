# Design Plan: Skardela Visual Design Overhaul

## 1. Executive Summary

This document describes the visual design overhaul plan for **Skardela**, a free, client-side daily puzzle web application.
The goal is to elevate Skardela to a world-class, premium product experience with the clarity, precision, and restrained beauty of an Apple interface, while keeping the puzzle board as the hero.

---

## 2. Workspace Audit Findings

### Architectural Foundations

- **Stack:** React 19, Vite 8, React Router 8, TypeScript 6, Node 24.
- **Styling Architecture:** Pure CSS Modules, standard CSS custom properties, and native `light-dark()` color resolution.
- **Accessibility:** Dual visual encoding (colors paired with geometric symbols `●`, `■`, `✓`, `↔`, `✗`), WCAG 2.1 AA targets, full keyboard accessibility, live status `<output>` announcements.
- **Theme Handling:** Synchronous head script in `index.html` prevents Flash of Unstyled Content (FOUC). Themes supported: `system`, `light`, `dark`.

### Visual Weaknesses in Current Implementation

1. **Flat, Low-Contrast Cards & Containers:**
   - Cards on the home page and the rules panel in the puzzle page use simple flat backgrounds with basic box-shadows.
   - They lack depth, modern hierarchy, and refined tactile edges.
2. **Generic Application Shell:**
   - The header displays plain text for "Skardela" and an unstyled native `<select>` element.
   - There is no distinct product badge, subtle glass banner, or refined layout rhythm.
3. **Puzzle Board Presentation:**
   - Grid squares in `Colour Binary` and `Guzzle` have simple 2px borders with minimal surface feedback.
   - Empty squares look flat and inactive rather than inviting interaction.
   - The fixed center letter in `Guzzle` is not clearly distinguished as the intersecting anchor of all four words.
4. **Interactive Controls & Letter Bank:**
   - Difficulty pill links on the home page and keyboard letter keys in `Guzzle` lack tactile depth.
   - Letter keys feel like flat grey blocks rather than responsive keyboard controls with active press feedback.
5. **Feedback & Status States:**
   - The status box is a standard bordered rectangle.
   - The solved state changes background color but lacks celebratory polish, refined glow, or delight.
6. **Background & Atmosphere:**
   - The global page background is a single solid color (`#fdfbf7` in light, `#151413` in dark).
   - It lacks ambient lighting, depth, or visual warmth.

---

## 3. Art Direction Selection

### Selected Direction: Direction A — Apple-Inspired Glassmorphism (with Tactile Game Mechanics)

**Rationale:**
Skardela is a calm, contemplative daily puzzle application. It requires clarity, focus, and elegance.
Apple-inspired glassmorphism provides:

- **Restrained Translucent Surfaces:** Frosted glass panels (`backdrop-filter: blur(16px)`) with fine highlights that group controls without obscuring the canvas.
- **Soft Ambient Backgrounds:** Luminous radial gradients that create subtle depth and atmosphere without distracting from gameplay.
- **Tactile Precision Mechanics:** Puzzle cells remain crisp, solid, and tactile. They do not get lost in blur or low contrast.
- **Dual Light/Dark Palettes:** Dedicated, harmonious palettes for both appearances that exceed WCAG 2.1 AA contrast requirements.
- **Fluid Motion & Microinteractions:** Responsive spring-like tactile presses on buttons and cells, with strict `prefers-reduced-motion` compliance.

---

## 4. Design System Tokens (`src/index.css`)

### Color System (Using `light-dark()`)

- **Backgrounds:**
  - `--bg`: Luminous canvas with soft ambient glow (`light-dark(#f8f9fa, #0c0d10)`).
  - `--bg-radial-1`: Soft warm ambient light highlight.
  - `--bg-radial-2`: Gentle secondary ambient glow.
- **Surfaces & Glass:**
  - `--surface`: Translucent glass panel (`light-dark(rgba(255, 255, 255, 0.82), rgba(22, 24, 31, 0.82))`).
  - `--surface-elevated`: Opaque/elevated card (`light-dark(#ffffff, #1a1d26)`).
  - `--surface-muted`: Soft pill/button fill (`light-dark(rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.07))`).
  - `--surface-muted-hover`: Hover state (`light-dark(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.12))`).
- **Borders & Highlights:**
  - `--border`: Subdued border (`light-dark(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.10))`).
  - `--border-focus`: High-contrast interactive border.
  - `--glass-highlight`: Top-edge subtle frosted reflection (`light-dark(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.14))`).
- **Typography:**
  - `--text-h`: High-contrast headings (`light-dark(#111827, #f9fafb)`).
  - `--text`: Body text (`light-dark(#374151, #d1d5db)`).
  - `--text-muted`: Secondary metadata (`light-dark(#6b7280, #9ca3af)`).
- **Accents:**
  - `--accent`: Deep amber terracotta (`light-dark(#c2410c, #fb923c)`).
  - `--accent-hover`: (`light-dark(#9a3412, #fdba74)`).
  - `--accent-bg`: Subdued translucent accent fill.
  - `--accent-border`: Subtle accent stroke.
- **Puzzle Colors & WCAG 2.1 AA Compliance:**
  - `--red`: `#dc2626` (light) / `#ef4444` (dark).
  - `--blue`: `#2563eb` (light) / `#3b82f6` (dark).
  - `--green`: `#16a34a` (light) / `#22c55e` (dark).
  - `--yellow`: `#eab308` (light) / `#facc15` (dark).
  - All text colors on filled squares exceed 4.5:1 contrast against their backgrounds.
- **Elevation & Shadows:**
  - `--shadow-glass`: Frosted glass soft shadow with ambient diffusion.
  - `--shadow-key`: Tactile button shadow for interactive controls.
- **Border Radii:**
  - `--radius-sm`: 6px.
  - `--radius-md`: 10px.
  - `--radius-lg`: 16px.
  - `--radius-full`: 9999px.

---

## 5. Component Overhaul Plan

### 1. Application Shell (`Layout.tsx`, `Layout.module.css`, `ThemeSwitcher.module.css`)

- Introduce a refined glass navigation header with subtle backdrop blur.
- Style the site title with a modern monogram brand badge.
- Upgrade the theme switcher into an Apple-style segmented or frosted select pill with a smooth icon indicator.
- Maintain skip link visibility and functionality for keyboard navigation.

### 2. Home Page (`HomePage.tsx`, `HomePage.module.css`)

- Hero section: Polished typography, refined hierarchy, and subtle badge.
- Puzzle type cards:
  - Frosted glass containers with subtle hover lift.
  - Distinctive visual badges for each puzzle type.
  - Tactile difficulty pills (`Easy`, `Medium`, `Hard`) with clear hover and active states.

### 3. Puzzle View & Layout (`PuzzlePage.tsx`, `PuzzlePage.module.css`)

- Header: Elegant title block, clean metadata row with frosted level pill.
- Desktop layout: Sticky rules panel styled as a clean glass card with structured sections.
- Mobile layout: Immediate focus on the board without vertical scrolling obstruction.

### 4. Colour Binary Board (`Board.tsx`, `Board.module.css`, `shared/Board.module.css`)

- Empty cells: Subtle recessed frosted look with soft hover cues.
- Filled cells: Rich tactile jewel tones (`red` ●, `blue` ■) with subtle top highlight.
- Fixed clues: Clean frosted lock ring/indicator that clearly signals immovable cells.
- Hint state: Luminous pulse/ring highlighting the target cell.
- Solved state: Harmonious status banner with subtle emerald/accent celebratory glow.

### 5. Guzzle Board (`Board.tsx`, `Grid.tsx`, `Controls.tsx`, `Board.module.css`)

- Center cell: Distinctive intersecting anchor presentation with clear prominence.
- Letter cells: Bold letter typography, polished corner symbol badges (`✓`, `↔`, `✗`).
- Keyboard & Letter Bank:
  - Tactile key styling with physical keypress depth.
  - Clear counter badges for remaining letters.
  - Smooth focus and selection transitions.
- Mistakes counter: Tabular numbers with neat badge presentation.

### 6. Accessibility & Motion

- All transitions conditioned on `@media (prefers-reduced-motion: no-preference)`.
- Visible focus rings with high-contrast outlines (`--ring`).
- Maintain all existing ARIA labels, `aria-pressed`, `aria-disabled`, and `<output>` live regions.
- Touch target sizing maintained at >= 44x44px.

---

## 6. Verification Plan

- `npm run fix` (Oxfmt and Oxlint).
- `npm run check` (TypeScript, Vite build, Vitest unit tests, dataset validation).
- Git commits after each major phase.
