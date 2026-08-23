import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { HelmetProvider } from 'react-helmet-async';
import { I18nProvider } from "./i18n/I18nContext.tsx";

const CHUNK_RELOAD_KEY = "promorang:chunk-reload";

// A deployment can replace hashed lazy-route chunks while an open tab still
// references the previous build. Reload once so the tab picks up the new HTML
// and asset manifest instead of leaving the user on a blank screen.
const purgeCachesAndReload = async () => {
    const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
    if (Date.now() - lastReload < 8_000) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));

    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
        }
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }
    } catch {
        // ignore fallback errors
    } finally {
        window.location.reload();
    }
};

window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    purgeCachesAndReload();
});

window.addEventListener("error", (event) => {
    const msg = event.message || event.error?.message || "";
    const isChunkError =
        msg.includes("Cannot read properties of undefined") ||
        msg.includes("Failed to fetch") ||
        msg.includes("Loading chunk") ||
        msg.includes("Script error") ||
        msg.includes("import");

    if (isChunkError) {
        purgeCachesAndReload();
    }
});

window.addEventListener("unhandledrejection", (event) => {
    const msg = event.reason?.message || String(event.reason || "");
    if (
        msg.includes("Cannot read properties of undefined") ||
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Loading chunk")
    ) {
        purgeCachesAndReload();
    }
});

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                                console.log("New Promorang update ready.");
                            }
                        };
                    }
                };
            })
            .catch((error) => {
                console.warn("PWA Service Worker registration failed:", error);
            });
    });
}

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <I18nProvider>
            <App />
        </I18nProvider>
    </HelmetProvider>
);
