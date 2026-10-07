import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@/ui/theme.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/ui/app/App";
import { startWithProject } from "@/ui/app/openSharedProject";
import { dismissSplash } from "@/ui/splash/dismissSplash";

const container = document.getElementById("root");
if (!container) throw new Error("Élément #root introuvable dans index.html");

void startWithProject().then(() => {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  dismissSplash();
});
