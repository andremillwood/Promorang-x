export type PromoCardMomentStakeholder =
  | "participant"
  | "host"
  | "creator"
  | "merchant"
  | "venue"
  | "brand"
  | "community";

export type PromoCardMomentStage = "before" | "during" | "after";

export type PromoCardMomentImpact = {
  role: PromoCardMomentStakeholder;
  label: string;
  value: string;
  outcome: string;
  signal: string;
};

export const PROMOCARD_MOMENT_LOOP: Array<{
  stage: PromoCardMomentStage;
  label: string;
  title: string;
  meaning: string;
}> = [
  {
    stage: "before",
    label: "Before",
    title: "Make showing up easier",
    meaning: "Eligible access or partner value is visible before a person commits, so PromoCard changes the decision—not only the checkout.",
  },
  {
    stage: "during",
    label: "At the Moment",
    title: "Turn presence into qualified action",
    meaning: "Check-ins, purchases, contributions and stories connect participation to the people and partners who made it possible.",
  },
  {
    stage: "after",
    label: "After",
    title: "Carry value into the next move",
    meaning: "Verified activity can recharge future spending value while attributed outcomes help stakeholders decide what to repeat or fund next.",
  },
];

export const PROMOCARD_MOMENT_IMPACTS: Record<PromoCardMomentStakeholder, PromoCardMomentImpact> = {
  participant: {
    role: "participant",
    label: "People",
    value: "Useful value before and after showing up",
    outcome: "Lower friction to join, a clear reason to contribute and more capacity for the next outing.",
    signal: "Joined, checked in, contributed, redeemed, returned",
  },
  host: {
    role: "host",
    label: "Host",
    value: "A stronger room and a visible return loop",
    outcome: "See which invitations and actions produced attendance, contribution and repeat participation.",
    signal: "Reservations, arrivals, completions, repeat guests",
  },
  creator: {
    role: "creator",
    label: "Creator",
    value: "Attribution beyond views",
    outcome: "Content can be connected to qualified visits, purchases, participation and future invitations.",
    signal: "Attributed joins, visits, stories, conversions",
  },
  merchant: {
    role: "merchant",
    label: "Merchant",
    value: "Controlled offers that bring paying customers",
    outcome: "Set eligible value and purchase terms, then see attributable spend and repeat demand.",
    signal: "Redemptions, basket value, paid remainder, return rate",
  },
  venue: {
    role: "venue",
    label: "Place",
    value: "Demand shaped around real capacity",
    outcome: "Use value to strengthen quieter windows, improve arrival confidence and grow repeat visits.",
    signal: "Footfall, capacity filled, dwell, repeat visits",
  },
  brand: {
    role: "brand",
    label: "Partner",
    value: "Funding tied to human and commercial outcomes",
    outcome: "Sponsor access or recharges without taking over the Moment, then follow value through to action.",
    signal: "Qualified actions, attributed spend, reach-to-visit, lift",
  },
  community: {
    role: "community",
    label: "Scene",
    value: "Value that helps participation recur",
    outcome: "Keep more benefit circulating among the people and places that make the Scene worth returning to.",
    signal: "New members, returning members, shared value, next Moment",
  },
};

export function getPromoCardMomentImpacts(primaryRole?: PromoCardMomentStakeholder) {
  const impacts = Object.values(PROMOCARD_MOMENT_IMPACTS);
  if (!primaryRole) return impacts;
  return [PROMOCARD_MOMENT_IMPACTS[primaryRole], ...impacts.filter((impact) => impact.role !== primaryRole)];
}
