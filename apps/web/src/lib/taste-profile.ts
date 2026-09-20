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

export type TasteCategory = (typeof TASTE_CATEGORIES)[number]["value"];

const STORAGE_KEY = "promorang.taste.categories.v1";

export function readStoredTasteCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function writeStoredTasteCategories(values: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set(values))));
}
