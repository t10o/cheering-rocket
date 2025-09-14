import "@capacitor-community/safe-area";

import ReactDOM from "react-dom/client";
import { SafeArea } from "@capacitor-community/safe-area";
import * as Sentry from "@sentry/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { AuthProvider } from "./providers/auth/AuthProvider";
import { routeTree } from "./routeTree.gen";

import "./index.css";

SafeArea.enable({
  config: {
    customColorsForSystemBars: true,
    statusBarColor: "#00000000",
    statusBarContent: "light",
    navigationBarColor: "#00000000",
    navigationBarContent: "light",
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

Sentry.init({
  dsn: "https://79ee2e6325dc22551d94ee58c9843a0a@o4507400443002880.ingest.us.sentry.io/4510018125365248",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
}
