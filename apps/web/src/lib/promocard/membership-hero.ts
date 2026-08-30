export const MEMBERSHIP_LANES = [
  {
    href: "/shop?from=promocard",
    kicker: "Places",
    title: "Spend at checkout",
    detail: "See the offer and what the card covers before you go.",
    stub: "Use",
  },
  {
    href: "/discover/moments",
    kicker: "Moments",
    title: "Show up nearby",
    detail: "Check in at a gathering. Verified visits can refill spend.",
    stub: "Go",
  },
  {
    href: "/promoshare",
    kicker: "Shares",
    title: "Pass it on",
    detail: "A verified share can restore value for the next outing.",
    stub: "Send",
  },
  {
    href: "/discover/rewards",
    kicker: "Access",
    title: "Keys and invites",
    detail: "Members get the next door, not only a lower bill.",
    stub: "Open",
  },
] as const;

export type MembershipHighlightKind = "place" | "moment" | "share";

export type MembershipHighlight = {
  id: string;
  kind: MembershipHighlightKind;
  title: string;
  detail: string;
  href: string;
  stub: string;
};

export const FALLBACK_MEMBERSHIP_HIGHLIGHTS: MembershipHighlight[] = [
  {
    id: "place-fallback",
    kind: "place",
    title: "Partner tables tonight",
    detail: "Food, drinks and local experiences that take PromoCard.",
    href: "/shop?from=promocard",
    stub: "Place",
  },
  {
    id: "moment-fallback",
    kind: "moment",
    title: "Moments worth showing up for",
    detail: "Check in, get remembered, and refill the card.",
    href: "/discover/moments",
    stub: "Moment",
  },
  {
    id: "share-fallback",
    kind: "share",
    title: "Share a drop, refill spend",
    detail: "PromoShare turns a pass-along into the next outing.",
    href: "/promoshare",
    stub: "Share",
  },
];

type DiscoveryMoment = {
  id: string;
  title?: string | null;
  venue?: string | null;
  href: string;
  when?: string | null;
};

type DiscoveryPlace = {
  id: string;
  title?: string | null;
  merchant?: string | null;
  href: string;
  price?: string | null;
};

export function membershipHighlightsFromDiscovery(input: {
  moments?: DiscoveryMoment[];
  places?: DiscoveryPlace[];
}): MembershipHighlight[] {
  const fromPlaces = (input.places || []).slice(0, 2).map((place) => ({
    id: `place-${place.id}`,
    kind: "place" as const,
    title: place.title?.trim() || "A place that takes PromoCard",
    detail: place.merchant?.trim() || "Partner place nearby",
    href: place.href,
    stub: place.price?.trim() || "Place",
  }));

  const fromMoments = (input.moments || []).slice(0, 2).map((moment) => ({
    id: `moment-${moment.id}`,
    kind: "moment" as const,
    title: moment.title?.trim() || "A Moment nearby",
    detail: moment.venue?.trim() || "Show up and refill",
    href: moment.href,
    stub: moment.when?.trim() || "Moment",
  }));

  const highlights = [...fromPlaces, ...fromMoments];
  return highlights.length > 0 ? highlights : FALLBACK_MEMBERSHIP_HIGHLIGHTS;
}

export function membershipHighlightKicker(kind: MembershipHighlightKind) {
  if (kind === "place") return "Use the card here";
  if (kind === "share") return "Membership share";
  return "Show up with membership";
}
