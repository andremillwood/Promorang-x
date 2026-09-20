export const TASTE_CATEGORIES = [
  { value: "food", label: "Food & Drink", emoji: "🍽️", prompt: "More food, restaurants and things worth tasting?" },
  { value: "music", label: "Music & Entertainment", emoji: "🎵", prompt: "More music, parties, performances and listening experiences?" },
  { value: "outdoor", label: "Outdoor Adventures", emoji: "🏕️", prompt: "More outdoors, nature, road trips and active experiences?" },
  { value: "fitness", label: "Fitness & Wellness", emoji: "🧘", prompt: "More wellness, movement, fitness and reset time?" },
  { value: "arts", label: "Arts & Culture", emoji: "🎨", prompt: "More art, culture, film, design and creative experiences?" },
  { value: "social", label: "Social Gatherings", emoji: "🎉", prompt: "More social plans, gatherings and reasons to meet people?" },
  { value: "networking", label: "Networking", emoji: "🤝", prompt: "More business, creator and professional connection?" },
  { value: "workshop", label: "Workshops & Learning", emoji: "📚", prompt: "More classes, workshops and things that help you learn?" },
] as const;

export const MOTIVATION_TRIGGERS = [
  { value: "complimentary", label: "Complimentary something", emoji: "🥂", detail: "A drink, sample, tasting or small extra that makes trying it easier." },
  { value: "exclusive_access", label: "Exclusive access", emoji: "🔐", detail: "Something limited, private or unavailable to everyone." },
  { value: "early_access", label: "Early access", emoji: "⚡", detail: "A chance to get in, try it or know first." },
  { value: "bring_friend", label: "Bring-a-friend value", emoji: "👥", detail: "A reason to make the move social instead of going alone." },
  { value: "meaningful_savings", label: "Meaningful savings", emoji: "🏷️", detail: "A real enough saving to change the decision—not a token discount." },
  { value: "points_keys", label: "Points or a Key", emoji: "🗝️", detail: "Progress, access or something useful unlocked through participation." },
  { value: "paid_gig", label: "Paid opportunity", emoji: "💼", detail: "A compensated Gig with a clear deliverable and proof." },
  { value: "special_experience", label: "A special experience", emoji: "✨", detail: "Something memorable enough to be the reason to move." },
] as const;

export type TasteCategory = (typeof TASTE_CATEGORIES)[number]["value"];
export type MotivationTrigger = (typeof MOTIVATION_TRIGGERS)[number]["value"];

const CATEGORY_KEY = "promorang.taste.categories.v1";
const MOTIVATION_KEY = "promorang.taste.motivations.v1";

function readArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, values: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(values))));
}

export const readStoredTasteCategories = () => readArray(CATEGORY_KEY);
export const writeStoredTasteCategories = (values: string[]) => writeArray(CATEGORY_KEY, values);
export const readStoredMotivations = () => readArray(MOTIVATION_KEY);
export const writeStoredMotivations = (values: string[]) => writeArray(MOTIVATION_KEY, values);
