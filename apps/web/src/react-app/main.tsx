// Import React shim first to ensure React is available globally
import "@/react-shim";
import "@/lib/i18n-init";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { ThemeProvider } from "@/react-app/context/ThemeContext";
import { ToastProvider } from "@/react-app/components/ui/use-toast";
import { LanguageProvider } from "@/react-app/contexts/LanguageProvider";

console.log("🚀 main.tsx: Starting application...");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen-dynamic">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <App />
            </Suspense>
          </ErrorBoundary>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>
);
