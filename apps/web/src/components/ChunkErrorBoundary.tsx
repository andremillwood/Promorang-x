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

    if (this.state.isChunkError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background text-foreground">
          <h2 className="text-xl font-bold mb-2">Application Updated</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            The browser is holding an older application chunk. Reload to use the latest Promorang build.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium shadow hover:opacity-90 transition-opacity"
          >
            Reload latest app
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background text-foreground">
        <h2 className="text-xl font-bold mb-2">This view hit an error</h2>
        <p className="text-muted-foreground mb-5 max-w-md">
          This is not being treated as an application update. Retry the view, or reload if the problem persists.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={this.retryView}
            className="px-5 py-2.5 border border-border bg-card text-foreground rounded-full font-medium hover:bg-muted transition-colors"
          >
            Retry view
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium shadow hover:opacity-90 transition-opacity"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default ChunkErrorBoundary;
