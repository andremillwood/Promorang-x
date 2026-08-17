import { ComponentType, lazy } from "react";

/**
 * Robust wrapper around React.lazy that automatically catches 404 / stale chunk hash errors
 * caused by new production deployments and forces a clean page reload with cache busting.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem("promorang_chunk_retry") || "false"
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem("promorang_chunk_retry", "false");
      return component;
    } catch (error: any) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Marks that we tried a refresh once so we avoid infinite loops
        window.sessionStorage.setItem("promorang_chunk_retry", "true");
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }

      // If we already refreshed and it still failed, throw the error
      throw error;
    }
  });
}
