# Skardela

Daily puzzle web application built with React 19, React Router 8, and Vite 8.

Skardela delivers daily logic and word puzzles directly in the web browser. The application runs entirely on the client side with zero user accounts, zero cookies, zero backend servers, and zero tracking.

## Core Features

- **Deterministic Daily Rotation:** Selects puzzles deterministically from UTC dates. Every player gets the same puzzle each day.
- **Accessible Design:** Meets WCAG 2.1 AA requirements. Pairs colors with geometric symbols (`●`, `■`, `✓`, `↔`, `✗`), provides full keyboard navigation, and announces state changes to screen readers.
- **Theming:** Supports light, dark, and system themes through native CSS `light-dark()` tokens without screen flicker.

## Puzzle Catalog

### 1. Colour Binary

A grid logic puzzle where players place red (`●`) and blue (`■`) tokens:

- Each row and column contains an equal number of red and blue tokens.
- No three consecutive tokens of the same color can appear in any row or column.
- Every row and column is unique.
- Includes a deductive hint engine and a backtracking solver.

### 2. Guzzle

A word puzzle where four words cross at a shared center letter:

- Words span horizontal, vertical, and diagonal paths.
- Letter tiles show exact status: green (`✓`) for correct placement, yellow (`↔`) for wrong position, and red (`✗`) for absent letters.
- Includes full keyboard support, letter banks, and mistake counters.

### 3. 3D Kinematics Rubik's Cube (`src/shared/rubiks-3d/`)

An interactive 3D puzzle element designed for human users and AI agent interfaces:

- **Buttonless Mouse Kinematics:** Uses raycasting and 2D-to-3D screen projection to lock rotation axes based on cursor drag vectors.
- **Spring Physics:** Harmonic spring solver snaps slices to 90-degree angles and supports momentum flicking.
- **LLM State Synchronization:** Computes standard Singmaster move notation, tracks 54-facelet state (URFDLB sequence), and outputs real-time entropy metrics.
- **Dual Implementations:** Includes both a React Three Fiber component (`RubiksCubeR3F.tsx`) and a standalone WebGL2 canvas (`RubiksCubeCanvas.tsx`).

## Route Structure

| Route                | Description                                      |
| -------------------- | ------------------------------------------------ |
| `/`                  | Daily puzzle dashboard with difficulty selection |
| `/puzzles/:puzzleId` | Interactive puzzle board                         |
| `/archive`           | Calendar archive of previous daily puzzles       |
| `/archive/:date`     | Date-filtered puzzle archive                     |
| `/atlas`             | Visual world map of puzzle categories            |
| `/studio`            | Puzzle authoring and validation studio           |
| `/duel`              | Puzzle challenge duel interface                  |
| `/expeditions`       | Multi-puzzle journey mode                        |
| `/learn`             | Interactive puzzle tutorials and rules           |
| `/exchange`          | Puzzle import and export tool                    |

## Development

### Prerequisites

- Node.js 24 (`.nvmrc`)
- npm 11

### Local Setup

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build the static production bundle:

```bash
npm run build
```

### Verification and Testing

Run all repository validation checks (formatting, linting, typechecking, tests):

```bash
npm run check
```

Run unit tests:

```bash
npm run test
```

Run 3D Rubik's Cube projection and kinematics tests:

```bash
npx vitest run src/shared/rubiks-3d/
```

Fix formatting and lint issues automatically:

```bash
npm run fix
```

## Deployment

Skardela deploys to Netlify as a Single Page Application (SPA).

### Netlify Configuration

Configuration lives in `netlify.toml`:

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** Node 24 (`NODE_VERSION = "24"`)
- **SPA Fallback:** Rewrites `/*` to `/index.html` with status `200` for client routing.

### CI/CD Pipeline

GitHub Actions workflow `.github/workflows/deploy-netlify.yml` automates deployment on push to `main`:

1. Checks out repository code.
2. Sets up Node.js 24.
3. Runs `npm run check` to validate code quality.
4. Deploys the `dist/` directory to Netlify production.

### Required Secrets

Set these secrets in repository **Settings > Secrets and variables > Actions**:

- `NETLIFY_AUTH_TOKEN`: Personal access token for Netlify API access.
- `NETLIFY_SITE_ID`: Target site identifier in Netlify.
