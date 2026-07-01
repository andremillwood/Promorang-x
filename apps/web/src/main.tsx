import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { HelmetProvider } from 'react-helmet-async';

const CHUNK_RELOAD_KEY = "promorang:chunk-reload";

// A deployment can replace hashed lazy-route chunks while an open tab still
// references the previous build. Reload once so the tab picks up the new HTML
// and asset manifest instead of leaving the user on a blank screen.
window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();

    const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
    if (Date.now() - lastReload < 10_000) {
        return;
    }

    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
    window.location.reload();
});

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((error) => {
            console.error("Service worker registration failed", error);
        });
    });
}

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <App />
    </HelmetProvider>
);
