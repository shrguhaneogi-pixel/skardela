import { type RouteObject } from "react-router";
import { Layout } from "./Layout";
import { RouteError } from "./RouteError";
import { text } from "../text/en";
import { ArchivePage } from "./pages/ArchivePage";
import { AtlasPage } from "./pages/AtlasPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PuzzlePage } from "./pages/PuzzlePage";
import { archiveLoader, homeLoader, puzzleLoader } from "./puzzles";

// The route tree keeps the app shell and each page in one place.
// This makes it easy to follow the main flow for the home page, archive, and puzzle pages.
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
        element: <ArchivePage />,
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "archive/:date",
        loader: archiveLoader,
        element: <ArchivePage />,
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "atlas",
        element: <AtlasPage />,
      },
      {
        path: "puzzles/:puzzleId",
        loader: puzzleLoader,
        element: <PuzzlePage />,
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
