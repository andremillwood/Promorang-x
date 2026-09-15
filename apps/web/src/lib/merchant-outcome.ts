export type MerchantOutcomeFacts = {
  venueCount: number;
  offerCount: number;
  activeOfferCount: number;
  totalRedemptions: number;
};

export type MerchantOutcomeStageStatus = "complete" | "current" | "upcoming";

export function resolveMerchantNextMove(facts: MerchantOutcomeFacts) {
  if (facts.venueCount === 0) {
    return {
      id: "setup" as const,
      title: "Add the place where customers will redeem promotions.",
      href: "/dashboard?tab=business",
    };
  }

  if (facts.offerCount === 0) {
    return {
      id: "launch" as const,
      title: "Launch your first customer promotion.",
      href: "/dashboard?tab=promotions",
    };
  }

  if (facts.totalRedemptions === 0) {
    return {
      id: "verify" as const,
      title: "Get the live promotion in front of customers.",
      href: "/dashboard?tab=business",
    };
  }

  return {
    id: "repeat" as const,
    title: "Give verified customers a reason to return.",
    href: "/dashboard?tab=promotions",
  };
}

export function resolveMerchantOutcomeStages(facts: MerchantOutcomeFacts) {
  const ready = facts.venueCount > 0;
  const live = facts.activeOfferCount > 0;
  const verified = facts.totalRedemptions > 0;

  return [
    { id: "ready", label: "Business ready", status: ready ? "complete" : "current" },
    { id: "live", label: "Promotion live", status: live ? "complete" : ready ? "current" : "upcoming" },
    { id: "customer", label: "First verified customer", status: verified ? "complete" : live ? "current" : "upcoming" },
    { id: "value", label: "Business value", status: verified ? "current" : "upcoming" },
    { id: "repeat", label: "Repeat customer", status: "upcoming" },
    { id: "economics", label: "Positive economics", status: "upcoming" },
  ] as Array<{ id: string; label: string; status: MerchantOutcomeStageStatus }>;
}
