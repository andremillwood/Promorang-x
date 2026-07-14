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

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.getRegistrations()
            .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
            .then(() => caches.keys())
            .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
            .catch((error) => console.error("Service worker cleanup failed", error));
    });
}

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <App />
    </HelmetProvider>
);
