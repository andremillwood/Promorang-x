import {
  Activity,
  Briefcase,
  Compass,
  CreditCard,
  Gift,
  Home,
  MapPin,
  Plus,
  Radio,
  Settings,
  Sparkles,
  Store,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  getStakeholderLens,
  type StakeholderNavRole,
  type StakeholderObjectId,
} from "@promorang/shared";

export type StakeholderNavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  experimental?: boolean;
  group?: "primary" | "growth" | "manage" | "utility";
  accent?: boolean;
};

const OBJECT_ICONS: Record<StakeholderObjectId, LucideIcon> = {
  today: Home,
  world: Compass,
  activity: Activity,
  putIn: Plus,
  promoCard: CreditCard,
};

const PUT_IN_ICONS: Partial<Record<StakeholderNavRole, LucideIcon>> = {
  participant: Sparkles,
  creator: Sparkles,
  host: Plus,
  merchant: Gift,
  brand: Gift,
  agency: Briefcase,
  promoter: Sparkles,
  marketing: Gift,
};

const EXTRA_ICONS: Record<string, LucideIcon> = {
  "/people": Users,
  "/demand": Compass,
  "/wallet": WalletCards,
  "/dashboard/settings": Settings,
  "/dashboard?view=studio": Store,
  "/dashboard?view=studio&tab=storefront": Store,
  "/dashboard?view=studio&tab=redemptions": Gift,
  "/dashboard?view=studio&tab=clients": Briefcase,
  "/staff/scanner": Gift,
  "/organizer/check-ins": Activity,
  "/stock": Gift,
  "/dashboard/venues/add": MapPin,
  "/create/campaign": Briefcase,
  "/content-drops": Radio,
};

export function stakeholderNavItems(role: StakeholderNavRole): StakeholderNavItem[] {
  const lens = getStakeholderLens(role);
  const primary = lens.destinations.map((item) => ({
    icon: item.id === "putIn" ? PUT_IN_ICONS[lens.role] || Plus : OBJECT_ICONS[item.id],
    label: item.label,
    href: item.href,
    group: "primary" as const,
    accent: item.accent,
  }));
  const extras = lens.extras.map((item) => ({
    icon: EXTRA_ICONS[item.href] || Settings,
    label: item.label,
    href: item.href,
    group: item.group,
  }));
  return [...primary, ...extras];
}

export function stakeholderMobileNav(role: StakeholderNavRole): StakeholderNavItem[] {
  return stakeholderNavItems(role)
    .filter((item) => item.group === "primary")
    .map((item) => ({ ...item, accent: item.accent }));
}
