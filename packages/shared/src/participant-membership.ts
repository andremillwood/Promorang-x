export const PARTICIPANT_MEMBERSHIP_POOL = {
  promosharePercent: 0.05,
  liquidityPercent: 0,
  localImpactPercent: 0,
} as const;

export const PARTICIPANT_ECONOMY = {
  pointsPerPromoKey: 500,
  maxDailyPromoKeyConversions: 3,
  masterKeyDurationHours: 24,
  pool: PARTICIPANT_MEMBERSHIP_POOL,
  tiers: {
    starter: {
      label: "Starter",
      checkoutPlanId: null,
      price: 0,
      priceLabel: "$0",
      pointsMultiplier: 1,
      dailyMasterKeyProofs: 5,
      promoKeysLimited: true,
      monthlyGemCeiling: 300,
      withdrawalsEnabled: false,
      gemAllowance: 0,
      featured: false,
    },
    professional: {
      label: "Professional",
      checkoutPlanId: "professional",
      price: 10,
      priceLabel: "$10 / month",
      pointsMultiplier: 1.5,
      dailyMasterKeyProofs: 2,
      promoKeysLimited: false,
      monthlyGemCeiling: null,
      withdrawalsEnabled: true,
      gemAllowance: 5,
      featured: true,
    },
    power_user: {
      label: "Power User",
      checkoutPlanId: "power_user",
      price: 30,
      priceLabel: "$30 / month",
      pointsMultiplier: 2,
      dailyMasterKeyProofs: 1,
      promoKeysLimited: false,
      monthlyGemCeiling: null,
      withdrawalsEnabled: true,
      gemAllowance: 15,
      featured: false,
    },
  },
} as const;

export type ParticipantEconomyTierId = keyof typeof PARTICIPANT_ECONOMY.tiers;

export const PARTICIPANT_TIER_ALIASES: Record<string, ParticipantEconomyTierId> = {
  free: "starter",
  starter: "starter",
  plus: "professional",
  premium: "professional",
  pro: "professional",
  professional: "professional",
  promorang_plus: "professional",
  participant_plus: "professional",
  promorang_pro: "professional",
  participant_pro: "professional",
  elite: "power_user",
  super: "power_user",
  power: "power_user",
  power_user: "power_user",
  promorang_elite: "power_user",
  participant_elite: "power_user",
};

export function normalizeParticipantTierKey(tier?: string | null): ParticipantEconomyTierId {
  const raw = String(tier || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  return PARTICIPANT_TIER_ALIASES[raw] || "starter";
}

export function resolveParticipantEconomyTier(tier?: string | null) {
  const id = normalizeParticipantTierKey(tier);
  return { id, ...PARTICIPANT_ECONOMY.tiers[id] };
}

export function listPaidParticipantTiers() {
  return (Object.keys(PARTICIPANT_ECONOMY.tiers) as ParticipantEconomyTierId[])
    .filter((id) => PARTICIPANT_ECONOMY.tiers[id].price > 0)
    .map((id) => ({ id, ...PARTICIPANT_ECONOMY.tiers[id] }));
}

export function participantWithdrawalsEnabled(tier?: string | null) {
  return resolveParticipantEconomyTier(tier).withdrawalsEnabled;
}
