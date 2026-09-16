const previewRole = () => {
  if (typeof window === "undefined") return "participant";
  return new URLSearchParams(window.location.search).get("role") || "participant";
};

export function isPublicAppPreview() {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/app-preview");
}

const roleCopy: Record<string, { givenName: string; earned: number; people: number; happening: number; perksGiven: number }> = {
  participant: { givenName: "Leslie", earned: 0, people: 0, happening: 1, perksGiven: 0 },
  creator: { givenName: "Creator", earned: 18500, people: 42, happening: 3, perksGiven: 2 },
  host: { givenName: "Host", earned: 32000, people: 86, happening: 2, perksGiven: 4 },
  merchant: { givenName: "Merchant", earned: 46800, people: 64, happening: 3, perksGiven: 5 },
  brand: { givenName: "Brand", earned: 0, people: 128, happening: 4, perksGiven: 6 },
  agency: { givenName: "Agency", earned: 0, people: 214, happening: 7, perksGiven: 8 },
  admin: { givenName: "Admin", earned: 0, people: 0, happening: 5, perksGiven: 0 },
};

const readyPerk = {
  id: "preview-perk-ready",
  title: "Complimentary coffee after your next verified visit",
  detail: "A real partner-funded benefit ready to use in this preview state.",
  redemptionCode: "MOVE50",
  status: "claimed",
  fulfillmentState: "claimed",
  fulfillmentType: "code",
  expiresAt: "2026-10-31T23:59:59-05:00",
  issuer: { name: "Kingston Coffee Lab" },
  eligibility: { who: "PromoCard holder" },
  availableQuantity: 18,
  redemption: { recorded: false, code: "MOVE50" },
  fromDiscover: true,
};

const nearbyPerk = {
  id: "preview-perk-nearby",
  title: "Two-for-one lunch feature",
  detail: "Available nearby after a qualifying PROMORANG action.",
  status: "available",
  fulfillmentState: "available",
  fulfillmentType: "merchant_validation",
  expiresAt: "2026-10-15T23:59:59-05:00",
  issuer: { name: "Barbican Kitchen" },
  eligibility: { who: "Eligible PROMORANG participants" },
  availableQuantity: 24,
  redemption: { recorded: false, code: null },
  fromDiscover: true,
};

export function previewHomeFixture() {
  const role = previewRole();
  const state = roleCopy[role] || roleCopy.participant;
  const participant = role === "participant";

  return {
    role: participant ? "member" : "contributor",
    givenName: state.givenName,
    name: state.givenName,
    earned: state.earned,
    people: state.people,
    happening: state.happening,
    communities: participant ? [{ id: "preview-community", name: "Kingston After Dark" }] : [],
    outcomes: {
      suppliesInventory: role === "merchant" || role === "brand",
      ledger: {
        perksGiven: state.perksGiven,
        cardPerks: participant ? 2 : 0,
        perksClaimed: participant ? 1 : 0,
      },
    },
    happened: {
      buckets: {
        claimed: participant ? 1 : 0,
        used: participant ? 1 : 0,
      },
    },
    card: {
      perks: participant ? [readyPerk, nearbyPerk] : [],
      useThis: participant ? readyPerk : null,
      nearby: participant ? [nearbyPerk] : [],
      nextBenefit: participant ? nearbyPerk : null,
    },
    world: {
      latestReturn: { heading: "Your last verified move counted" },
      latestMemory: { issuedAt: "2026-09-15T21:15:00-05:00" },
      promoCard: { sceneMark: "Kingston", crewMark: "Move Jamaica" },
      identity: { line: "You move through Kingston with intention." },
      invitation: { title: "See what fits next", body: "Find the next useful move around you.", href: "/discover" },
    },
  } as any;
}

export function previewCardFixture() {
  return {
    givenName: "Leslie",
    name: "Leslie",
    aim: { id: "food", label: "Food + taste" },
    useThis: readyPerk,
    perks: [readyPerk],
    benefits: [readyPerk],
    nearby: [nearbyPerk],
    nextBenefit: nearbyPerk,
    memberships: [
      { id: "preview-membership", name: "Kingston After Dark", status: "active" },
    ],
    points: 240,
    promoPoints: 240,
    promoKeys: 2,
  } as any;
}

export function previewNearbyFixture() {
  return {
    benefits: [nearbyPerk],
    nearby: [nearbyPerk],
  } as any;
}
