import { isRecoverableChunkError } from "./lib/chunk-recovery";
import { I18nProvider } from "./i18n/I18nContext.tsx";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/participant-world.css";

import { HelmetProvider } from 'react-helmet-async';

const CHUNK_RELOAD_KEY = "promorang:chunk-reload";
let lastChunkReload = 0;

// A deployment can replace hashed lazy-route chunks while an open tab still
// references the previous build. Reload once so the tab picks up the new HTML
// and asset manifest instead of leaving the user on a blank screen.
const purgeCachesAndReload = async () => {
    if (!navigator.onLine) return;
    let lastReload = lastChunkReload;
    try { lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? lastReload); } catch { /* Use the in-memory guard. */ }
    if (Date.now() - lastReload < 8_000) return;
    lastChunkReload = Date.now();
    try { sessionStorage.setItem(CHUNK_RELOAD_KEY, String(lastChunkReload)); } catch { /* Storage is optional. */ }

    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter(key => key.startsWith("promorang-pwa-shell-")).map(async key => {
                const cache = await caches.open(key);
                const requests = await cache.keys();
                await Promise.all(requests.filter(request => new URL(request.url).pathname.startsWith("/assets/")).map(request => cache.delete(request)));
            }));
        }

    } catch {
        // ignore fallback errors
    } finally {
        window.location.reload();
    }
};

window.addEventListener("vite:preloadError", (event) => {
    if (!navigator.onLine) return;
    event.preventDefault();
    purgeCachesAndReload();
});

window.addEventListener("error", (event) => {
    const msg = event.message || event.error?.message || "";
    const isChunkError = isRecoverableChunkError(msg);

    if (isChunkError) {
        purgeCachesAndReload();
    }
});

window.addEventListener("unhandledrejection", (event) => {
    const msg = event.reason?.message || String(event.reason || "");
    if (isRecoverableChunkError(msg)) {
        purgeCachesAndReload();
    }
});

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js", { updateViaCache: "none" })
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

const syncDisplayMode = () => {
    const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    document.documentElement.toggleAttribute("data-pwa", standalone);
};

syncDisplayMode();
window.matchMedia("(display-mode: standalone)").addEventListener?.("change", syncDisplayMode);

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <I18nProvider>
            <App />
        </I18nProvider>
    </HelmetProvider>
);
