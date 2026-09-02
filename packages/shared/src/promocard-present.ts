export type PromoCardPerk = {
  id: string;
  title: string;
  detail?: string;
};

export type PromoCardOffer = {
  title: string;
  detail: string;
  href: string;
  stub: string;
  place?: string;
};

export type PromoCardSurfaceInput = {
  holder?: string;
  spendable?: number;
  limit?: number;
  cardNumber?: string | null;
  places?: string;
  placesCount?: number;
  currency?: string;
  perks?: PromoCardPerk[];
  nextOffer?: PromoCardOffer | null;
};

export const FALLBACK_PROMOCARD_OFFER: PromoCardOffer = {
  title: "Find a night nearby",
  detail: "Check in, and eligible savings land on your PromoCard.",
  href: "/discover",
  stub: "Go",
  place: "Tonight",
};

export const PROMOCARD_COPY = {
  present: {
    eyebrow: "PromoCard",
    title: "Show this at checkout",
    description: "Eligible savings come off the bill. You pay the rest.",
  },
  offer: {
    eyebrow: "PromoCard",
    title: "Tonight puts value on your card",
    description: "Nothing to show yet. Go, and it lands here.",
  },
  presentDialog: {
    heading: "Present to cashier",
    body: "They apply this first. You pay the rest as usual.",
  },
  refillHint: "Points and Keys refill the card. They are not what you show.",
} as const;

export function formatPromoCardSpend(amount: number, currency = "USD"): string {
  const safe = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  if (String(currency).toUpperCase() === "JMD") {
    return `J$${Math.round(safe).toLocaleString("en-US")}`;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}

export function formatPromoCardSerial(cardNumber?: string | null): string {
  const digits = String(cardNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (digits.length >= 4) return `PR · ${digits.slice(-4)}`;
  return "PR · 0842";
}

export function offerFromOpportunity(item?: {
  title?: string;
  description?: string;
  peopleGet?: string;
  sourceKind?: string;
} | null): PromoCardOffer {
  if (!item?.title) return { ...FALLBACK_PROMOCARD_OFFER };
  return {
    title: item.title,
    detail: item.peopleGet || item.description || "Show up, and it can land on your PromoCard.",
    href: item.sourceKind === "offer" ? "/discover" : "/earn",
    stub: "Go",
    place: "Tonight",
  };
}

export type PromoCardPresentSurface = {
  mode: "present";
  holder: string;
  spendable: number;
  available: string;
  limit: string;
  caption: string;
  places: string;
  serial: string;
  showSpendFace: boolean;
  perks: PromoCardPerk[];
  presentLabel: string;
};

export type PromoCardOfferSurface = {
  mode: "offer";
  holder: string;
  offer: PromoCardOffer;
  presentLabel: string;
};

export type PromoCardSurface = PromoCardPresentSurface | PromoCardOfferSurface;

export function resolvePromoCardSurface(input: PromoCardSurfaceInput = {}): PromoCardSurface {
  const holder = String(input.holder || "Member").trim() || "Member";
  const spendable = Math.max(0, Number(input.spendable || 0));
  const perks = Array.isArray(input.perks) ? input.perks.filter((perk) => perk?.id && perk?.title) : [];
  const currency = input.currency || "USD";
  const serial = formatPromoCardSerial(input.cardNumber);
  const places =
    input.places ||
    (Number(input.placesCount) > 0 ? `${Number(input.placesCount)} partner shops` : "Partner shops nearby");

  if (spendable > 0 || perks.length > 0) {
    const showSpendFace = spendable > 0;
    return {
      mode: "present",
      holder,
      spendable,
      available: showSpendFace ? formatPromoCardSpend(spendable, currency) : perks[0].title,
      limit: showSpendFace ? formatPromoCardSpend(Number(input.limit || spendable), currency) : "",
      caption: showSpendFace ? "Available to spend" : "Ready to show",
      places: showSpendFace ? places : "Ready tonight",
      serial,
      showSpendFace,
      perks,
      presentLabel: "Show this",
    };
  }

  return {
    mode: "offer",
    holder,
    offer: input.nextOffer?.title ? input.nextOffer : { ...FALLBACK_PROMOCARD_OFFER },
    presentLabel: "Go — it lands on your card",
  };
}
