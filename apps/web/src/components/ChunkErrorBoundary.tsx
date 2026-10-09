import { useI18n } from "@/i18n/I18nContext";
import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

const isDynamicImportFailure = (error: Error) => {
  const message = String(error?.message || "");
  const name = String(error?.name || "");

  return (
    name === "ChunkLoadError"
    || message.includes("Failed to fetch dynamically imported module")
    || message.includes("Importing a module script failed")
    || /Loading chunk [\w-]+ failed/i.test(message)
    || /dynamically imported module.*404/i.test(message)
  );
};

export class ChunkErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, isChunkError: false };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      isChunkError: isDynamicImportFailure(error),
    };
  }

  componentDidCatch(error: Error) {
    if (!isDynamicImportFailure(error)) {
      console.error("Promorang view error", error);
      return;
    }

    const CHUNK_RELOAD_KEY = "promorang:chunk-reload";
    const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);

    // One automatic reload is useful after deployment/HMR changes asset hashes.
    // Do not loop if the new bundle is still unavailable.
    if (Date.now() - lastReload > 10_000) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
      window.location.reload();
    }
  }

  private retryView = () => {
    this.setState({ hasError: false, isChunkError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return <ChunkErrorContent isChunkError={this.state.isChunkError} onRetry={this.retryView} />;
  }
}

function ChunkErrorContent({ isChunkError, onRetry }: { isChunkError: boolean; onRetry: () => void }) {
  const { t } = useI18n();
    if (isChunkError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background text-foreground">
          <h2 className="text-xl font-bold mb-2">{t("web.appUpdated")}</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            {t("web.oldChunk")}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium shadow hover:opacity-90 transition-opacity"
          >
            {t("web.reloadLatest")}
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background text-foreground">
        <h2 className="text-xl font-bold mb-2">{t("web.viewError")}</h2>
        <p className="text-muted-foreground mb-5 max-w-md">
          {t("web.viewErrorHelp")}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={onRetry}
            className="px-5 py-2.5 border border-border bg-card text-foreground rounded-full font-medium hover:bg-muted transition-colors"
          >
            {t("web.retryView")}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium shadow hover:opacity-90 transition-opacity"
          >
            {t("web.reloadPage")}
          </button>
        </div>
      </div>
    );
}

export default ChunkErrorBoundary;
