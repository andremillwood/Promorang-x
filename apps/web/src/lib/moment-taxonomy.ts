export const momentCategories = [
  { value: "social", label: "Social Gathering" },
  { value: "workshop", label: "Workshop" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "food", label: "Food & Drink" },
  { value: "music", label: "Music & Entertainment" },
  { value: "networking", label: "Networking" },
  { value: "outdoor", label: "Outdoor Adventure" },
  { value: "arts", label: "Arts & Culture" },
] as const;

export const venueCategories = [
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "nightlife", label: "Nightlife" },
  { value: "fashion_retail", label: "Fashion Retail" },
  { value: "beauty_retail", label: "Beauty Retail" },
  { value: "grocery", label: "Grocery & Everyday Commerce" },
  { value: "personal_service", label: "Personal Service" },
  { value: "fitness_wellness", label: "Fitness & Wellness" },
  { value: "entertainment", label: "Entertainment & Culture" },
  { value: "learning_networking", label: "Learning & Networking" },
  { value: "community_civic", label: "Community & Civic" },
  { value: "hospitality_travel", label: "Hospitality & Travel" },
  { value: "family_kids", label: "Family & Kids" },
  { value: "auto_mobility", label: "Auto & Mobility" },
  { value: "healthcare_light", label: "Light Healthcare" },
  { value: "home_property", label: "Home & Property" },
] as const;

export const momentArchetypes = [
  { value: "gathering", label: "Gathering", description: "Live density, atmosphere, and coordinated turnout." },
  { value: "visit", label: "Visit", description: "A low-friction foot-traffic or presence moment." },
  { value: "service", label: "Service", description: "A completion-based service interaction like barber, salon, or spa." },
  { value: "drop", label: "Drop", description: "A scarcity or launch window with urgency and exclusivity." },
  { value: "ritual", label: "Ritual", description: "A repeatable visit or streak-based loyalty loop." },
  { value: "content", label: "Content", description: "A creator-led digital-to-physical unlock path." },
  { value: "sampling", label: "Sampling", description: "A product demo or trial moment." },
  { value: "appointment", label: "Appointment", description: "A booking or timeslot-driven moment." },
  { value: "referral", label: "Referral", description: "A bring-a-friend or social spread moment." },
  { value: "founder", label: "Founder", description: "An early-adopter or founding-member identity moment." },
] as const;

export const conversionTypes = [
  { value: "check_in", label: "Check-in" },
  { value: "purchase", label: "Purchase" },
  { value: "appointment", label: "Appointment" },
  { value: "try_on", label: "Try-on" },
  { value: "sample", label: "Sample" },
  { value: "booking", label: "Booking" },
  { value: "scan", label: "Scan" },
  { value: "review", label: "Review" },
  { value: "referral", label: "Referral" },
  { value: "repeat_visit", label: "Repeat Visit" },
] as const;

export const TAXONOMY_LABEL_KEYS = {
  moment: {
    social: "tax.moment.social",
    workshop: "tax.moment.workshop",
    fitness: "tax.moment.fitness",
    food: "tax.moment.food",
    music: "tax.moment.music",
    networking: "tax.moment.networking",
    outdoor: "tax.moment.outdoor",
    arts: "tax.moment.arts",
  },
  venue: {
    food_beverage: "tax.venue.food_beverage",
    nightlife: "tax.venue.nightlife",
    fashion_retail: "tax.venue.fashion_retail",
    beauty_retail: "tax.venue.beauty_retail",
    grocery: "tax.venue.grocery",
    personal_service: "tax.venue.personal_service",
    fitness_wellness: "tax.venue.fitness_wellness",
    entertainment: "tax.venue.entertainment",
    learning_networking: "tax.venue.learning_networking",
    community_civic: "tax.venue.community_civic",
    hospitality_travel: "tax.venue.hospitality_travel",
    family_kids: "tax.venue.family_kids",
    auto_mobility: "tax.venue.auto_mobility",
    healthcare_light: "tax.venue.healthcare_light",
    home_property: "tax.venue.home_property",
  },
  arch: {
    gathering: "tax.arch.gathering",
    visit: "tax.arch.visit",
    service: "tax.arch.service",
    drop: "tax.arch.drop",
    ritual: "tax.arch.ritual",
    content: "tax.arch.content",
    sampling: "tax.arch.sampling",
    appointment: "tax.arch.appointment",
    referral: "tax.arch.referral",
    founder: "tax.arch.founder",
  },
  conv: {
    check_in: "tax.conv.check_in",
    purchase: "tax.conv.purchase",
    appointment: "tax.conv.appointment",
    try_on: "tax.conv.try_on",
    sample: "tax.conv.sample",
    booking: "tax.conv.booking",
    scan: "tax.conv.scan",
    review: "tax.conv.review",
    referral: "tax.conv.referral",
    repeat_visit: "tax.conv.repeat_visit",
  },
} as const;

export type TaxonomyGroup = keyof typeof TAXONOMY_LABEL_KEYS;

export function taxonomyLabelKey(group: TaxonomyGroup, value?: string | null): string | null {
  if (!value) return null;
  const table = TAXONOMY_LABEL_KEYS[group] as Record<string, string>;
  return table[value] || null;
}

export const getTaxonomyLabel = (
  options: readonly { value: string; label: string }[],
  value?: string | null
) => Array.isArray(options) ? options.find((option) => option.value === value)?.label || value || "" : value || "";
