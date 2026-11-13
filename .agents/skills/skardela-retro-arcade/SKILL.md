---
name: skardela-retro-arcade
description: Implements highly stylized retro 3D displays and CRT effects. Use when the user mentions a 3D display, CRT, retro arcade mode, or pixelated 3D elements.
---

# Skardela Retro Arcade

## Summary

This skill ensures the agent builds visually stunning, retro-styled WebGL interfaces for the Skardela app. It prioritizes impressive visual fidelity using WebGL post-processing and a vibrant custom color palette with Bayer dithering, while preserving the app's strict bundle budget through lazy loading.

## When to Use

- The user asks for a "3D display" or "CRT".
- The user requests a retro arcade mode or pixelated 3D mini-games (like a Rubik's cube).
- Tasks involving retro visual effects (scanlines, chromatic aberration, dithering) using React Three Fiber.

## Core Directives & Steps

### 1. WebGL CRT Post-Processing (Maximum Visual Impact)

- **NEVER** use basic CSS overlays for the CRT effect.
- **ALWAYS** implement a custom WebGL post-processing pipeline using `@react-three/postprocessing` or custom GLSL shaders.
- Include barrel distortion (screen curvature), RGB chromatic aberration (color fringing at the edges), dynamic horizontal scanlines, and a deep vignette.
- The power-on animation must be a shader-driven effect (for example, an expanding horizontal bright line that snaps open to reveal the 3D scene).

### 2. Vibrant Retro Palette & Bayer Dithering

- Prioritize style over strict legacy hardware optimization. Use a rich, high-contrast arcade palette (neon pinks, cyans, deep purples, and vibrant primary colors for puzzle pieces).
- Apply 8x8 Bayer dithering via custom shader materials on 3D meshes to give them a distinct, crunchy pixel-art aesthetic without sacrificing modern color depth.
- Disable default Three.js anti-aliasing to keep pixel edges sharp.

### 3. Aggressive Code Splitting (Bundle Protection)

- Three.js is heavy. Wrap the entire Arcade/3D Canvas component in `React.lazy()` and `<Suspense>`.
- Ensure the 3D payload is chunked separately from the main `HomePage.tsx` bundle to satisfy Vite bundle budgets.

### 4. Procedural Geometry

- Generate 3D assets (like a Rubik's cube) procedurally using R3F primitives (e.g., `<Box>`, `<InstancedMesh>`). Do not load external `.gltf` or `.glb` files.

## Gotchas

- Forgetting to disable standard WebGL anti-aliasing ruins the pixelated look.
- Failing to use `<Suspense>` will break the `bundle-budget.test.ts` limit.
- Ensure the WebGL context properly unmounts and disposes of materials/geometries when the CRT screen is toggled off to prevent memory leaks.
