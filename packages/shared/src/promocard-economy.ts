/**
 * PromoCard promotional credit
 *
 * Ledger truth: PromoCard value is promotional Gems.
 * Canonical peg: 1 Gem = 1 USD of platform promotional value.
 * Local currency (JMD, TTD, …) is a display conversion from recent FX.
 * PromoCard is not cash, a loan, or a general-purpose payment card.
 */

export const GEMS_USD_VALUE = 1;
export const PROMOCARD_CREDIT_UNIT = "GEMS" as const;
export const FALLBACK_FX_AS_OF = "2026-08-28";

/** Local units per 1 USD. Display only — never a ledger rate. */
export const FALLBACK_USD_TO_LOCAL: Record<string, number> = {
  USD: 1,
  BMD: 1,
  BSD: 1,
  PAB: 1,
  BBD: 2,
  XCD: 2.7,
  AWG: 1.8,
  XCG: 1.8,
  KYD: 0.83,
  EUR: 0.86,
  JMD: 157.5,
  TTD: 6.78,
  GYD: 209,
  CUP: 24,
  HTG: 131,
  SRD: 36,
  GHS: 12.4,
  NGN: 1530,
  DOP: 60.5,
  COP: 4020,
  BRL: 5.45,
  MXN: 18.6,
  GTQ: 7.67,
  HNL: 26.2,
  NIO: 36.8,
  CRC: 506,
  ARS: 1350,
  BOB: 6.91,
  CLP: 965,
  PYG: 7480,
  PEN: 3.55,
  UYU: 40.2,
  VES: 145,
};

export type FxQuoteSource = "fallback" | "live";

export type FxQuote = {
  base: "USD";
  quote: string;
  localPerUsd: number;
  asOf: string;
  source: FxQuoteSource;
};

export function gemsToUsd(gems: number) {
  return Number(gems || 0) * GEMS_USD_VALUE;
}

export function resolveFxQuote(currency?: string | null, live?: Partial<FxQuote> | null): FxQuote {
  const quote = (currency || "USD").toUpperCase();
  if (live?.localPerUsd && live.localPerUsd > 0 && (!live.quote || live.quote.toUpperCase() === quote)) {
    return {
      base: "USD",
      quote,
      localPerUsd: live.localPerUsd,
      asOf: live.asOf || new Date().toISOString(),
      source: "live",
    };
  }
  return {
    base: "USD",
    quote,
    localPerUsd: FALLBACK_USD_TO_LOCAL[quote] ?? 1,
    asOf: FALLBACK_FX_AS_OF,
    source: "fallback",
  };
}

export function gemsToLocal(gems: number, quote: FxQuote) {
  return gemsToUsd(gems) * quote.localPerUsd;
}

export function formatGemsCredit(gems: number, locale = "en") {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(gems || 0))} Gems`;
}

export function formatLocalFromGems(gems: number, quote: FxQuote, locale = "en") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: quote.quote,
    maximumFractionDigits: quote.localPerUsd >= 50 ? 0 : 2,
  }).format(gemsToLocal(gems, quote));
}

export function describePromoCardValue(gems: number, quote: FxQuote, locale = "en") {
  return {
    unit: PROMOCARD_CREDIT_UNIT,
    gems: Number(gems || 0),
    gemsLabel: formatGemsCredit(gems, locale),
    usdLabel: `US$${gemsToUsd(gems).toFixed(2)} promotional value`,
    localLabel: formatLocalFromGems(gems, quote, locale),
    fx: quote,
    disclaimer: "Promotional Gems you can spend with partners — not cash in a bank.",
  };
}
