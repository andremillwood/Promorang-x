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

export const getTaxonomyLabel = (
  options: readonly { value: string; label: string }[],
  value?: string | null
) => Array.isArray(options) ? options.find((option) => option.value === value)?.label || value || "" : value || "";
