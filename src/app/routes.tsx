import { type RouteObject } from "react-router";
import { Layout } from "./Layout";
import { RouteError } from "./RouteError";
import { text } from "../text/en";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { archiveLoader, homeLoader, puzzleLoader } from "./puzzles";

// ASD-STE100 Simplified Technical English comments.
// The route tree keeps the app shell, home page, and lazy-loaded secondary pages in one place.
// This reduces the main JavaScript bundle size while keeping initial home rendering fast.
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        loader: homeLoader,
        element: <HomePage />,
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "archive",
        loader: archiveLoader,
        lazy: async () => ({ Component: (await import("./pages/ArchivePage")).ArchivePage }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "archive/:date",
        loader: archiveLoader,
        lazy: async () => ({ Component: (await import("./pages/ArchivePage")).ArchivePage }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "atlas",
        lazy: async () => ({ Component: (await import("./pages/AtlasPage")).AtlasPage }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "studio",
        lazy: async () => ({ Component: (await import("./pages/StudioPage")).StudioPage }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "duel",
        lazy: async () => ({ Component: (await import("./pages/DuelPage")).DuelPage }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "expeditions",
        lazy: async () => ({
          Component: (await import("./pages/ExpeditionsPage")).ExpeditionsPage,
        }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "learn",
        lazy: async () => ({ Component: (await import("./pages/LearnPage")).LearnPage }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "exchange",
        lazy: async () => ({ Component: (await import("./pages/ExchangePage")).ExchangePage }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "arcade",
        lazy: async () => ({ Component: (await import("./pages/ArcadePage")).ArcadePage }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "puzzles/:puzzleId",
        loader: puzzleLoader,
        lazy: async () => ({ Component: (await import("./pages/PuzzlePage")).PuzzlePage }),
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
