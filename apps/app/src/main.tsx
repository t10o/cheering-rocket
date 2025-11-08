import "@capacitor-community/safe-area";

import ReactDOM from "react-dom/client";
import { SafeArea } from "@capacitor-community/safe-area";
import * as Sentry from "@sentry/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { enableForegroundPushNotifications } from "./libs/pushNotifications";
import { captureException } from "./libs/sentry";
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
  // 開発モードではSentryを無効化
  enabled: !import.meta.env.DEV,
  environment: import.meta.env.DEV ? "development" : "production",
});

enableForegroundPushNotifications();

// グローバルエラーハンドラーを設定
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
  console.error("Error filename:", event.filename);
  console.error("Error line:", event.lineno);
  console.error("Error col:", event.colno);
  captureException(event.error, "Global Error Handler");
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  captureException(event.reason, "Unhandled Promise Rejection");
});

// より詳細なエラーキャッチ
window.addEventListener("uncaughtException", (event) => {
  console.error("Uncaught exception:", event);
  captureException(event, "Uncaught Exception");
});

// ネットワークエラーもキャッチ
window.addEventListener(
  "error",
  (event) => {
    if (event.target && event.target !== window) {
      console.error("Resource error:", event.target);
      captureException(
        new Error(`Resource error: ${event.target}`),
        "Resource Error",
      );
    }
  },
  true,
);

const rootElement = document.getElementById("root")!;

try {
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ErrorBoundary>,
    );
  }
} catch (error) {
  console.error("React initialization error:", error);
  captureException(error, "React Initialization Error");
}
