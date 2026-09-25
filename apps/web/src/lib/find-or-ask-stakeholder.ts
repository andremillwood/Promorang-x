export type FindOrAskStakeholderRole = "merchant" | "host" | "creator" | "brand";

export type StakeholderRoute = {
  action: string;
  objectType: "place" | "offer" | "moment" | "content" | "opportunity" | "proof";
  href: string;
  labelKey: string;
};

function withOrigin(path: string, discoveryId: string, action: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}origin_discovery=${encodeURIComponent(discoveryId)}&origin_action=${encodeURIComponent(action)}`;
}

export function stakeholderRoutes(role: string | null | undefined, discoveryId: string): StakeholderRoute[] {
  if (role === "merchant") {
    return [
      { action: "confirm_fact", objectType: "proof", href: withOrigin("/scout/enrichment", discoveryId, "confirm_fact"), labelKey: "findOrAsk.route.confirmFact" },
      { action: "update_place", objectType: "place", href: withOrigin("/scout/enrichment", discoveryId, "update_place"), labelKey: "findOrAsk.route.updatePlace" },
      { action: "create_offer", objectType: "offer", href: withOrigin("/offers", discoveryId, "create_offer"), labelKey: "findOrAsk.route.createOffer" },
    ];
  }
  if (role === "host") {
    return [{ action: "create_moment", objectType: "moment", href: withOrigin("/create/moment", discoveryId, "create_moment"), labelKey: "findOrAsk.route.createMoment" }];
  }
  if (role === "creator") {
    return [
      { action: "answer", objectType: "proof", href: withOrigin("/create", discoveryId, "answer"), labelKey: "findOrAsk.route.answer" },
      { action: "create_content", objectType: "content", href: withOrigin("/content-drops", discoveryId, "create_content"), labelKey: "findOrAsk.route.createContent" },
      { action: "accept_opportunity", objectType: "opportunity", href: withOrigin("/earn", discoveryId, "accept_opportunity"), labelKey: "findOrAsk.route.acceptOpportunity" },
    ];
  }
  if (role === "brand") {
    return [
      { action: "validate", objectType: "proof", href: withOrigin("/activate", discoveryId, "validate"), labelKey: "findOrAsk.route.validate" },
      { action: "sponsor", objectType: "offer", href: withOrigin("/offers", discoveryId, "sponsor"), labelKey: "findOrAsk.route.sponsor" },
      { action: "commission", objectType: "opportunity", href: withOrigin("/stock", discoveryId, "commission"), labelKey: "findOrAsk.route.commission" },
    ];
  }
  return [];
}
