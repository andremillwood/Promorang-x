export type StakeholderNeedId =
  | "people_tonight"
  | "more_visits"
  | "tell_the_story"
  | "put_budget_to_work"
  | "run_for_clients"
  | "somewhere_to_go";

export type StakeholderNeedRole = "host" | "merchant" | "creator" | "brand" | "agency" | "participant";

export type StakeholderNeedPersona = "mayor" | "merchant" | "creator" | "brand" | "agency" | "explorer";

export type StakeholderNeed = {
  id: StakeholderNeedId;
  role: StakeholderNeedRole;
  persona: StakeholderNeedPersona;
  title: string;
  need: string;
  routesBecause: string;
};

export const STAKEHOLDER_NEEDS: StakeholderNeed[] = [
  {
    id: "people_tonight",
    role: "host",
    persona: "mayor",
    title: "I need people through the door tonight",
    need: "The bar, venue, or night is already happening. People should be able to find it and show up.",
    routesBecause: "That is a host job. We start you on tonight.",
  },
  {
    id: "more_visits",
    role: "merchant",
    persona: "merchant",
    title: "I need more visits to my place",
    need: "I run a shop, restaurant, or venue and want people to come in and come back.",
    routesBecause: "That is a merchant job. We attach your place to nights people already want.",
  },
  {
    id: "tell_the_story",
    role: "creator",
    persona: "creator",
    title: "I need my story to move people",
    need: "I make the night visible — clips, flyers, voice — and I want that to bring people out.",
    routesBecause: "That is a creator job. We start you on one night people can join.",
  },
  {
    id: "put_budget_to_work",
    role: "brand",
    persona: "brand",
    title: "I need budget to reach people who show up",
    need: "I have money to put behind real rooms, not just ads nobody can prove.",
    routesBecause: "That is a brand job. We connect spend to verified presence.",
  },
  {
    id: "run_for_clients",
    role: "agency",
    persona: "agency",
    title: "I need to run this for clients",
    need: "I coordinate brands, venues, and creators and have to show what happened.",
    routesBecause: "That is an agency job. We start you on one client activation.",
  },
  {
    id: "somewhere_to_go",
    role: "participant",
    persona: "explorer",
    title: "I need somewhere worth going",
    need: "I am going out. I want a night, a room, or a crowd — not a dashboard.",
    routesBecause: "That is a guest job. We show you what is on.",
  },
];

const BY_ID = Object.fromEntries(STAKEHOLDER_NEEDS.map((need) => [need.id, need])) as Record<StakeholderNeedId, StakeholderNeed>;

export function resolveStakeholderNeed(id?: string | null): StakeholderNeed | null {
  if (!id) return null;
  return BY_ID[id as StakeholderNeedId] ?? null;
}

export function resolveNeedFromPersona(persona?: string | null): StakeholderNeed | null {
  return STAKEHOLDER_NEEDS.find((need) => need.persona === persona) ?? null;
}

export function needsConsumerTasteSteps(role?: string | null): boolean {
  return !role || role === "participant";
}

export function landingPathForNeed(need: StakeholderNeed): string {
  if (need.role === "brand" || need.role === "agency") return "/dashboard";
  if (need.role === "participant") return "/?firstNight=true";
  return "/?firstNight=true";
}

export function isVenueNeed(need?: StakeholderNeed | null): boolean {
  return need?.role === "host" || need?.role === "merchant";
}
