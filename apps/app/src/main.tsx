import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@rocket/ui/styles.css";
import "@capacitor-community/safe-area";

import { SafeArea } from "@capacitor-community/safe-area";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

SafeArea.enable({
  config: {
    customColorsForSystemBars: true,
    statusBarColor: "#00000000",
    statusBarContent: "light",
    navigationBarColor: "#00000000",
    navigationBarContent: "light",
  },
});
