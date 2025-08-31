import "@capacitor-community/safe-area";

import ReactDOM from "react-dom/client";
import { SafeArea } from "@capacitor-community/safe-area";
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

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
}
