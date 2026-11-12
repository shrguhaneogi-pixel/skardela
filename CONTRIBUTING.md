# Contributing to Skardela

This guide explains how to work on Skardela and how to add a new puzzle type.

## Core Rules

- Write all documentation, UI text, and code comments in ASD-STE100 Simplified Technical English.
- Keep all puzzle logic browser-safe and pure.
- Do not add server code, backend logic, or database changes. This is a UI-only project.
- Use strict TypeScript. Do not use `any` or `@ts-ignore`.
- Put all UI text in `src/text/en.ts` (or a slice imported there) and all symbols in `src/text/symbols.ts`.
- Pair every colour signal with a shape, symbol, or text label for accessibility.
- Use Conventional Commits for commit messages (for example: `feat: add new puzzle type` or `fix: repair practice links`).

## Development Setup

1. Install Node.js 24 and npm 11.
2. Run `npm install`.
3. Run `npm run dev` to start the local development server.
4. Run `npm run fix && npm run check` before you finish any change.

## Add a New Puzzle Type

Follow these steps in order when you add a puzzle type `<name>`:

1. **Create the puzzle folder:**
   Create `src/app/puzzle-types/<name>/`.

2. **Write the rules:**
   Create `src/app/puzzle-types/<name>/rules.md` to explain the rules and include a step-by-step example.

3. **Add an example puzzle:**
   Create `src/app/puzzle-types/<name>/examples/<name>-0000.json` matching the example in `rules.md`.

4. **Implement pure puzzle logic:**
   Add TypeScript files in `src/app/puzzle-types/<name>/` for the puzzle type definition, rules check, solver or hint logic, and `findPuzzleProblems`. Keep these files free of React and browser APIs.

5. **Add the puzzle pool:**
   Create `puzzles/<name>.json` with at least one valid puzzle for each difficulty (`easy`, `medium`, `hard`). Each puzzle ID must match `<name>-XXXX` (4 digits) and use `"license": "CC-BY-4.0"`.

6. **Register the puzzle type:**
   Update `src/app/puzzle-types/registry.ts`:
   - Add `<name>` to `PuzzleMap`.
   - Add a lazy `loadPuzzles` entry to `puzzleTypes`.
     Then follow the TypeScript errors across the project.

7. **Create the accessible board UI:**
   Build `Board.tsx`, `BoardView.tsx`, and supporting components in `src/app/puzzle-types/<name>/`. Reuse shared styles in `src/shared/Board.module.css` and shared components in `src/shared/`. Use `<output aria-live="polite">` for status regions (which have an implicit `status` role), and support full keyboard navigation.

8. **Register the lazy board component:**
   Add a `lazy(() => ...)` entry for `<name>` in `src/app/puzzle-types/boards.ts`.

9. **Add UI text and symbols:**
   - Add symbols to `src/text/symbols.ts`.
   - Add all localized strings, rules, labels, and status messages to `src/text/en.ts`.

10. **Update shared puzzle integrations:**
    Check shared helpers that switch on `PuzzleType` or puzzle metadata, such as `src/shared/puzzle-validator.ts`, `src/shared/practice-queue.ts`, `src/shared/logic-atlas.ts`, `src/shared/postcard.ts`, `src/shared/expeditions.ts`, `src/shared/learning-pathways.ts`, and `src/shared/EditorialPuzzleDiagram.tsx`.

11. **Add validation and bundle budget checks:**
    - Register the example and `findProblems` check for `<name>` in `tools/puzzles.test.ts`.
    - Add the lazy chunk prefix check for `<name>` in `isPuzzleChunk` in `tools/bundle-budget.test.ts`, and ensure all CSS and JS bundle budgets pass (`< 80 kB` total CSS, `< 550 kB` main JS, `< 40 kB` per lazy puzzle chunk).

12. **Add unit tests and verify everything:**
    Add unit tests for the new puzzle logic and board interactions. Then run:

    ```bash
    npm run fix && npm run check
    ```

    A change is complete only when formatting, linting, TypeScript checks, production build, unit tests, and tool validations all pass.
