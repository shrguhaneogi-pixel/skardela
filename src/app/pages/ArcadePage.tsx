// ASD-STE100 Simplified Technical English comments.
// Retro Arcade page for Skardela.
// Renders the hardware-accelerated WebGL CRT display with 3D Rubik's puzzle execution.

import { lazy, Suspense } from "react";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";

const RetroArcadeScreen = lazy(() => import("../../shared/retro-arcade/RetroArcadeScreen"));

export function ArcadePage() {
  return (
    <section className="sk-hero">
      <title>{text.arcade.title} | {text.siteName}</title>
      <h1>
        <span aria-hidden="true">{symbols.cube.cube} </span>
        {text.arcade.title}
      </h1>
      <p className="sk-intro">{text.arcade.subtitle}</p>

      <Suspense fallback={<p>{text.puzzlePage.loading}</p>}>
        <RetroArcadeScreen />
      </Suspense>
    </section>
  );
}

export default ArcadePage;
