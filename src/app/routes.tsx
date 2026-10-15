import { type RouteObject } from "react-router";
import { Layout } from "./Layout";
import { RouteError } from "./RouteError";
import { text } from "../text/en";
import {
  ArchivePage,
  AtlasPage,
  DuelPage,
  ExchangePage,
  ExpeditionsPage,
  HomePage,
  LearnPage,
  NotFoundPage,
  PuzzlePage,
  StudioPage,
} from "./pages";
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
        path: "studio",
        element: <StudioPage />,
      },
      {
        path: "duel",
        element: <DuelPage />,
      },
      {
        path: "expeditions",
        element: <ExpeditionsPage />,
      },
      {
        path: "learn",
        element: <LearnPage />,
      },
      {
        path: "exchange",
        element: <ExchangePage />,
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
