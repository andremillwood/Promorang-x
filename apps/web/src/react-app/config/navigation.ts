import {
  Home,
  DollarSign,
  ShoppingBag,
  Plus,
  TrendingUp,
  Rocket,
  Users,
  Wallet,
  RefreshCw,
  Key,
  Trophy,
  Instagram,
  Award,
  ArrowUpCircle,
  Settings as SettingsIcon,
  BarChart3,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';

export type SidebarSection = 'primary' | 'wallet' | 'community' | 'account' | 'business';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  requiresAuth?: boolean;
  showInSidebar?: boolean;
  showInMobile?: boolean;
  showInBottomNav?: boolean;
  requiredRole?: string;
  sidebarSection?: SidebarSection;
}

/**
 * Unified Navigation Configuration
 * Single source of truth for all navigation across the app
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  // Primary Navigation (Sidebar + Bottom Nav)
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home,
    description: 'Your personalized feed',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: true,
    sidebarSection: 'primary',
  },
  {
    name: 'Earn',
    href: '/earn',
    icon: DollarSign,
    description: 'Complete tasks and earn rewards',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: true,
    sidebarSection: 'primary',
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
    description: 'Browse and shop products',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'primary',
  },
  {
    name: 'Create',
    href: '/create',
    icon: Plus,
    description: 'Create new content',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: true,
    sidebarSection: 'primary',
  },
  {
    name: 'Invest',
    href: '/invest',
    icon: TrendingUp,
    description: 'Invest in creators',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: true,
    sidebarSection: 'primary',
  },
  {
    name: 'Growth Hub',
    href: '/growth-hub',
    icon: Rocket,
    description: 'Grow your presence',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'primary',
  },
  {
    name: 'Referrals',
    href: '/referrals',
    icon: Users,
    description: 'Invite friends and earn',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'primary',
  },
  {
    name: 'Events',
    href: '/events',
    icon: CalendarDays,
    description: 'Discover and attend events',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'primary',
  },

  // Wallet & Currency (Mobile Drawer)
  {
    name: 'Wallet',
    href: '/wallet',
    icon: Wallet,
    description: 'Manage your balance',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'wallet',
  },
  {
    name: 'Convert Currency',
    href: '/wallet?tab=convert',
    icon: RefreshCw,
    description: 'Convert between currencies',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'wallet',
  },
  {
    name: 'Master Key',
    href: '/wallet?tab=master-key',
    icon: Key,
    description: 'Your master key benefits',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'wallet',
  },

  // Gamification & Social (Mobile Drawer)
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
    description: 'Top performers',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'community',
  },
  {
    name: 'Instagram Rewards',
    href: '/earn?category=instagram',
    icon: Instagram,
    description: 'Earn from Instagram',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'community',
  },
  {
    name: 'Achievements',
    href: '/rewards',
    icon: Award,
    description: 'Your achievements',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'community',
  },

  // Account & Settings (Mobile Drawer)
  {
    name: 'Upgrade Tier',
    href: '/wallet?action=upgrade',
    icon: ArrowUpCircle,
    description: 'Upgrade your account',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'account',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    description: 'Account settings',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'account',
  },

  // Advertiser Dashboard (Conditional)
  {
    name: 'Advertiser Dashboard',
    href: '/advertiser',
    icon: BarChart3,
    description: 'Manage campaigns',
    requiresAuth: true,
    requiredRole: 'advertiser',
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'business',
  },
  {
    name: 'Season Operator',
    href: '/operator',
    icon: BarChart3,
    description: 'Run your own hubs',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'business',
  },
];

const SIDEBAR_SECTION_LABELS: Record<SidebarSection, string> = {
  primary: 'Overview',
  wallet: 'Wallet',
  community: 'Community',
  account: 'Account',
  business: 'Business',
};

const SIDEBAR_SECTION_ORDER: SidebarSection[] = ['primary', 'wallet', 'community', 'account', 'business'];

/**
 * Get navigation items for sidebar
 */
export function getSidebarNavigation(userRole?: string): NavigationItem[] {
  return NAVIGATION_ITEMS.filter(item => {
    if (!item.showInSidebar) return false;
    if (item.requiredRole && item.requiredRole !== userRole) return false;
    return true;
  });
}

export interface NavigationGroup {
  section: SidebarSection;
  label: string;
  items: NavigationItem[];
}

export function groupNavigationBySection(items: NavigationItem[]): NavigationGroup[] {
  const grouped = new Map<SidebarSection, NavigationItem[]>();

  items.forEach((item) => {
    const section = item.sidebarSection ?? 'primary';
    if (!grouped.has(section)) {
      grouped.set(section, []);
    }
    grouped.get(section)!.push(item);
  });

  return SIDEBAR_SECTION_ORDER
    .filter((section) => grouped.has(section))
    .map((section) => ({
      section,
      label: SIDEBAR_SECTION_LABELS[section],
      items: grouped.get(section)!,
    }));
}

export function getSidebarNavigationGroups(userRole?: string): NavigationGroup[] {
  const items = getSidebarNavigation(userRole);
  return groupNavigationBySection(items);
}

/**
 * Get navigation items for mobile drawer
 */
export function getMobileDrawerNavigation(userRole?: string): NavigationItem[] {
  return NAVIGATION_ITEMS.filter(item => {
    if (!item.showInMobile) return false;
    if (item.requiredRole && item.requiredRole !== userRole) return false;
    return true;
  });
}

/**
 * Get navigation items for bottom nav (mobile)
 */
export function getBottomNavigation(userRole?: string): NavigationItem[] {
  return NAVIGATION_ITEMS.filter(item => {
    if (!item.showInBottomNav) return false;
    if (item.requiredRole && item.requiredRole !== userRole) return false;
    return true;
  });
}

/**
 * Check if a path is active
 */
export function isPathActive(currentPath: string, itemHref: string): boolean {
  // Exact match
  if (currentPath === itemHref) return true;

  // For query param routes, check base path
  const [basePath] = itemHref.split('?');
  if (currentPath === basePath) return true;

  // For nested routes
  if (currentPath.startsWith(itemHref + '/')) return true;

  return false;
}
