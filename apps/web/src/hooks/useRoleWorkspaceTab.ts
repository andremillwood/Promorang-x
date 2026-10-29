import { useSearchParams } from "react-router-dom";

/** URL is the source of truth, including Back, reset and invalid deep links. */
export function useRoleWorkspaceTab(fallback: string, allowed: readonly string[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const activeTab = requested && allowed.includes(requested) ? requested : fallback;
  const setActiveTab = (value: string) => {
    if (!allowed.includes(value)) return;
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("tab", value);
      return next;
    });
  };
  return { activeTab, setActiveTab, searchParams };
}
