import { Gift, HelpCircle, Share2, Store, Ticket } from "lucide-react";

export const DISCOVER_TAB_IDS = ["discoveries", "perks", "moments", "distribute", "places"] as const;

export type DiscoverTab = (typeof DISCOVER_TAB_IDS)[number];

export const DISCOVER_TABS: Array<{
  id: DiscoverTab;
  label: string;
  icon: typeof HelpCircle;
}> = [
  { id: "discoveries", label: "Discoveries", icon: HelpCircle },
  { id: "perks", label: "Perks", icon: Gift },
  { id: "moments", label: "Moments", icon: Ticket },
  { id: "distribute", label: "Share", icon: Share2 },
  { id: "places", label: "Places", icon: Store },
];

export function isDiscoverTab(value: string | null | undefined): value is DiscoverTab {
  return Boolean(value && DISCOVER_TAB_IDS.includes(value as DiscoverTab));
}
