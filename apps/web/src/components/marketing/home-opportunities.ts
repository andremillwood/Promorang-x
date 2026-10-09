import type { Offer } from "@/hooks/useOffers";
import type { CanonicalMoment } from "@/services/moment-feed";
export type OpportunityKind = "offers" | "moments" | "missions";
export type HomeMission = { id: string; action_text?: string; reward_value?: string; moment?: { id: string }; content?: { title?: string; description?: string } };
export type HomeOpportunity = { id: string; kind: OpportunityKind; title: string; benefit?: string; href: string; image?: string; date?: string; location?: string };
export function buildHomeOpportunities(offers: Offer[], moments: CanonicalMoment[], missions: HomeMission[], now: number): HomeOpportunity[] {
  // Lead with live events, then complete, stakeholder-created listings in the next fortnight.
  const featuredRank = (moment: CanonicalMoment) => moment.lifecycle === "live" ? 2
    : moment.content_origin === "stakeholder_created" && moment.image_url && Date.parse(moment.starts_at) <= now + 14 * 86400000 ? 1 : 0;
  const activeMoments = moments.filter(moment => moment.lifecycle !== "recently_ended" && Date.parse(moment.effective_ends_at) > now)
    .sort((a, b) => featuredRank(b) - featuredRank(a) || Date.parse(a.starts_at) - Date.parse(b.starts_at));
  const validOffers = offers.filter(offer => offer.status === "active" && Date.parse(offer.starts_at) <= now && (!offer.ends_at || Date.parse(offer.ends_at) > now) && (offer.quantity_total == null || offer.quantity_total > offer.quantity_reserved + offer.quantity_redeemed) && offer.offer_distributions?.some(d => d.channel === "direct" && d.is_active === true && (d.allocation_limit == null || (d.allocation_count != null && d.allocation_count < d.allocation_limit))));
  return [
    ...validOffers.map(offer => ({ id: offer.id, kind: "offers" as const, title: offer.title, benefit: offer.terms || offer.description || undefined, href: `/offers/${encodeURIComponent(offer.id)}`, date: offer.ends_at || undefined })),
    ...activeMoments.map(moment => ({ id: moment.id, kind: "moments" as const, title: moment.title, benefit: moment.description || undefined, href: `/moments/${encodeURIComponent(moment.slug || moment.id)}`, image: moment.image_url || undefined, date: moment.starts_at, location: moment.venue_name || moment.location || undefined })),
    ...missions.flatMap(mission => {
      const moment = activeMoments.find(item => item.id === mission.moment?.id);
      return moment && mission.id && mission.content?.title ? [{ id: mission.id, kind: "missions" as const, title: mission.content.title, benefit: [mission.action_text, mission.reward_value].filter(Boolean).join(" · ") || undefined, href: `/missions/${encodeURIComponent(mission.id)}`, image: moment.image_url || undefined, location: moment.venue_name || moment.location || undefined }] : [];
    }),
  ];
}
