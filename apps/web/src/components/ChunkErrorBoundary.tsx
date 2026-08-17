import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChunkErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    const isChunkError =
      error.message?.includes("Cannot read properties of undefined") ||
      error.message?.includes("reading 'default'") ||
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("Loading chunk") ||
      error.message?.includes("Importing a module script failed") ||
      error.message?.includes("404");

    if (isChunkError) {
      const CHUNK_RELOAD_KEY = "promorang:chunk-reload";
      const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);

      // Reload page automatically if deployment updated asset hashes
      if (Date.now() - lastReload > 2_000) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background text-foreground">
          <h2 className="text-xl font-bold mb-2">Application Updated</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            A new version of Promorang was just released. Please refresh your browser to view the latest changes.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium shadow hover:opacity-90 transition-opacity"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
