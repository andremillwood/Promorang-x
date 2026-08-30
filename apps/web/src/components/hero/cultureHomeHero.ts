export const HERO_LAYER_IDS = ["tonight", "spend", "proof", "keep"] as const;
export type HeroLayerId = (typeof HERO_LAYER_IDS)[number];

export type LiveHeroMoment = {
  title: string;
  detail: string;
  value: string;
  href: string;
  image?: string | null;
  checkIns?: number;
};

export type LiveHeroCard = {
  available: string;
  limit: string;
  holder: string;
  places?: string;
};

export function nextHeroLayer(current: HeroLayerId): HeroLayerId {
  const index = HERO_LAYER_IDS.indexOf(current);
  return HERO_LAYER_IDS[(index + 1) % HERO_LAYER_IDS.length];
}

export function previousHeroLayer(current: HeroLayerId): HeroLayerId {
  const index = HERO_LAYER_IDS.indexOf(current);
  return HERO_LAYER_IDS[(index - 1 + HERO_LAYER_IDS.length) % HERO_LAYER_IDS.length];
}

export function formatHeroMoney(amount: number, currency = "USD") {
  if (!Number.isFinite(amount)) return "$0.00";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function buildProofReceipt(moment?: LiveHeroMoment | null) {
  return {
    heading: "Visit receipt",
    lines: [
      { label: "Showed up", value: moment?.title || "A funded night" },
      { label: "Place", value: moment?.detail || "Partner venue" },
      { label: "When", value: moment?.value || "This weekend" },
      { label: "Kept", value: "Proof of the night", strong: true as const },
    ],
    footer: "Your visit becomes a receipt, not a disappearing story.",
  };
}

export function buildKeepRelic(moment?: LiveHeroMoment | null) {
  return {
    serial: "PR · PIECE 01",
    title: moment?.title ? `A piece of ${moment.title}` : "A piece of the night",
    origin: moment?.detail || "Held from a funded moment nearby",
    perk: "Come back with standing, not just a memory.",
  };
}
