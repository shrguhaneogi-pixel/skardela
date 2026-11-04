# Skardela Project Constitution

## 1. Core Identity
- **Project Name:** Skardela
- **Stitch Project ID:** `[Stitch Project ID]`
- **Mission:** Deliver free daily logic and spatial puzzles directly in the web browser with zero tracking, zero accounts, and zero installation friction.
- **Target Audience:** Puzzle enthusiasts, daily logic game players, students, and accessibility-first web users.
- **Voice:** Calm, precise, elegant, and focused.

## 2. Visual Language
- **Primary Aesthetic:** Apple-inspired glassmorphism.
- **Secondary Aesthetic:** Tactile precision mechanics.
- **Tertiary Aesthetic:** Restrained minimalist typography.
- **Visual Design Rules:**
  - Use translucent frosted panels with subtle borders.
  - Maintain high contrast ratios that exceed WCAG 2.1 AA standards.
  - Pair every color code with a distinctive geometric symbol.
  - Support light and dark color schemes through native CSS tokens.
  - Respect user motion preferences through reduced motion styles.

## 3. Architecture and File Structure
- **Execution Model:** 100% client-side Single Page Application (SPA).
- **Core Stack:** React 19, React Router 8, Vite 8, TypeScript 6.
- **Directory Layout:**
  - `src/app/pages/`: Page components and route screens.
  - `src/app/puzzle-types/`: Modular puzzle logic, rule engines, and interactive boards.
  - `src/shared/`: Shared components, utilities, and 3D kinematics modules.
  - `src/shared/rubiks-3d/`: 3D Rubik's Cube kinematics, spring physics, and LLM state sync.
  - `src/text/`: Localized application strings (`en.ts`) and symbols (`symbols.ts`).
- **Asset Flow:**
  - Development build outputs to local memory.
  - Production build outputs static files to `dist/`.
  - Deployment publishes `dist/` directly to Netlify static edge storage.
- **Navigation Strategy:**
  - Global app header with title, theme switcher, and navigation links.
  - React Router 8 handles client-side page transitions with zero full-page reloads.

## 4. Live Sitemap
- [x] `/` (Home page with daily puzzles, difficulty selection, and play modes)
- [x] `/puzzles/:puzzleId` (Interactive puzzle board for the selected puzzle)
- [x] `/archive` (Archive of previous daily puzzles by calendar date)
- [x] `/archive/:date` (Filtered archive view for a specific UTC date)
- [x] `/atlas` (Atlas view showing the puzzle world map and themes)
- [x] `/studio` (Puzzle creation studio and validator tool)
- [x] `/duel` (Competitive puzzle duel interface)
- [x] `/expeditions` (Multi-stage puzzle expedition tracks)
- [x] `/learn` (Tutorials, guides, and rule demonstrations)
- [x] `/exchange` (Community puzzle exchange and import/export)
- [x] `*` (Accessible 404 Not Found error page)

## 5. The Roadmap (Backlog)

### High Priority
- [x] Implement deterministic daily puzzle rotation via UTC epoch arithmetic.
- [x] Build Colour Binary puzzle type with deductive hint engine.
- [x] Build Guzzle word puzzle type with interactive letter keyboard.
- [x] Implement 3D Rubik's Cube UI element with buttonless mouse kinematics.
- [x] Add dual visual accessibility indicators for color-blind accessibility.

### Medium Priority
- [ ] Mount the 3D Rubik's Cube agent interface into a dedicated agent playground page.
- [ ] Add offline service worker support for complete offline gameplay.
- [ ] Add sound effects for tactile cell interactions with mute control.
- [ ] Expand daily puzzle pool with automated pre-validated puzzle sets.

### Low Priority
- [ ] Add animated celebration particle effects for solved states.
- [ ] Add exportable puzzle summary cards for social sharing.
- [ ] Add custom color theme customization within high-contrast bounds.

## 6. Creative Freedom Guidelines
- Keep all puzzle logic browser-safe, synchronous, and pure.
- Do not introduce backend servers, databases, external network APIs, or authentication layers.
- Preserve accessibility by ensuring interactive elements have minimum 44x44px touch targets.
- Ensure all automated unit tests pass before shipping changes.
