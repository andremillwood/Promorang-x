import {
  Activity,
  BarChart3,
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

const MERCHANT_NAV: StakeholderNavItem[] = [
  { icon: Home, label: "Home", href: "/dashboard", group: "primary" },
  { icon: Gift, label: "Promotions", href: "/dashboard?tab=promotions", group: "primary", accent: true },
  { icon: Users, label: "Customers", href: "/dashboard?tab=customers", group: "primary" },
  { icon: BarChart3, label: "Sales & Results", href: "/dashboard?tab=results", group: "primary" },
  { icon: Store, label: "Business", href: "/dashboard?tab=business", group: "primary" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
];

export function stakeholderNavItems(role: StakeholderNavRole): StakeholderNavItem[] {
  // Merchants need a business operating model, not the internal Promorang object model.
  // The merchant workspace still uses the same offer, redemption, storefront, and analytics
  // infrastructure underneath these outcome-oriented destinations.
  if (role === "merchant") return MERCHANT_NAV;

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
