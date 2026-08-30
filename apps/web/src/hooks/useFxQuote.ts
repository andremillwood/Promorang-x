import { useQuery } from "@tanstack/react-query";
import { resolveFxQuote, type FxQuote } from "@promorang/shared";

const FX_CACHE_KEY = "promorang:fx:usd";
const FX_CACHE_MS = 6 * 60 * 60 * 1000;

type LiveUsdTable = {
  fetchedAt: string;
  rates: Record<string, number>;
};

function readCachedRates(): LiveUsdTable | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FX_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveUsdTable;
    if (!parsed.fetchedAt || !parsed.rates) return null;
    if (Date.now() - new Date(parsed.fetchedAt).getTime() > FX_CACHE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedRates(table: LiveUsdTable) {
  try {
    window.localStorage.setItem(FX_CACHE_KEY, JSON.stringify(table));
  } catch {
    // ignore quota / private mode
  }
}

async function fetchUsdRates(): Promise<LiveUsdTable> {
  const cached = readCachedRates();
  if (cached) return cached;

  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!response.ok) throw new Error("FX feed unavailable");
  const payload = await response.json() as { result?: string; time_last_update_utc?: string; rates?: Record<string, number> };
  if (payload.result !== "success" || !payload.rates) throw new Error("FX feed invalid");

  const table = {
    fetchedAt: payload.time_last_update_utc || new Date().toISOString(),
    rates: payload.rates,
  };
  writeCachedRates(table);
  return table;
}

export function useFxQuote(currency: string): FxQuote {
  const quote = (currency || "USD").toUpperCase();
  const liveQuery = useQuery({
    queryKey: ["fx-usd-table"],
    queryFn: fetchUsdRates,
    staleTime: FX_CACHE_MS,
    gcTime: FX_CACHE_MS,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const liveRate = liveQuery.data?.rates?.[quote];
  if (typeof liveRate === "number" && liveRate > 0) {
    return resolveFxQuote(quote, {
      quote,
      localPerUsd: liveRate,
      asOf: liveQuery.data?.fetchedAt,
      source: "live",
    });
  }

  return resolveFxQuote(quote);
}
