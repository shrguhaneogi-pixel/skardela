import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { router } from "./app/router.ts";
import { registerServiceWorker } from "./shared/pwa.ts";

void registerServiceWorker();

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error('The page has no element with the ID "root".');
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
