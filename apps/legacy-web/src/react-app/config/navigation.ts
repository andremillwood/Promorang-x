import {
  Users,
  FileText,
  History,
  Settings as SettingsIcon,
  BarChart3,
  CalendarDays,
  Target,
  Plus,
  FileSearch,
  Sun,
  Gift,
  type LucideIcon,
} from 'lucide-react';

export type SidebarSection = 'primary' | 'wallet' | 'account' | 'business';
export type ViewMode = 'participant' | 'business';

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
  /** Minimum user state (0-3) required to see this item */
  minState?: number;
}

/**
 * Unified Navigation Configuration
 * Single source of truth for all navigation across the app
 * 
 * State-aware visibility:
 * - minState: 0 = visible to all
 * - minState: 2 = visible after first reward (State 2+)
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  // Primary Navigation (Sidebar + Bottom Nav)
  // TODAY is the new behavioral home - always visible
  {
    name: 'Timeline',
    href: '/today',
    icon: Sun,
    description: "Your historical weight and daily presence",
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: true,
    sidebarSection: 'primary',
    minState: 0,
  },
  {
    name: 'Invitations',
    href: '/earn',
    icon: Target,
    description: 'Grow your presence through new encounters',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: true,
    sidebarSection: 'primary',
    minState: 0,
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
    minState: 2,
  },


  {
    name: 'Presence Circle',
    href: '/referrals',
    icon: FileSearch,
    description: 'The community you have built',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'primary',
    minState: 2,
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
    minState: 2,
  },
  {
    name: 'Recognition',
    href: '/my-coupons',
    icon: Gift,
    description: 'The value of being present',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'primary',
  },

  // Wallet & Currency (Mobile Drawer)
  {
    name: 'Resonance Record',
    href: '/ledger',
    icon: FileText,
    description: 'The weight of your experiences',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'wallet',
    minState: 2,
  },
  // Settlement & Audit (Mobile Drawer)
  {
    name: 'Proven Presence',
    href: '/ledger?tab=history',
    icon: History,
    description: 'Your verified presence timeline',
    requiresAuth: true,
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'wallet',
    minState: 0,
  },

  // Account & Settings (Mobile Drawer)

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


  {
    name: 'Advertiser Dashboard',
    href: '/advertiser/dashboard',
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
    name: 'Team Settings',
    href: '/advertiser/settings/team',
    icon: Users,
    description: 'Manage your team members',
    requiresAuth: true,
    requiredRole: 'advertiser',
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'business',
  },
  {
    name: 'Store Team',
    href: '/merchant/settings/team',
    icon: Users,
    description: 'Manage store team',
    requiresAuth: true,
    requiredRole: 'merchant',
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'business',
  },
  {
    name: 'Business Operations',
    href: '/operator/dashboard',
    icon: BarChart3,
    description: 'Campaign verification and management',
    requiresAuth: true,
    requiredRole: 'operator',
    showInSidebar: true,
    showInMobile: true,
    showInBottomNav: false,
    sidebarSection: 'business',
  },
];

const SIDEBAR_SECTION_LABELS: Record<SidebarSection, string> = {
  primary: 'Presence',
  wallet: 'Recognition & History',
  account: 'Account',
  business: 'Brand Hub',
};

const SIDEBAR_SECTION_ORDER: SidebarSection[] = ['primary', 'wallet', 'account', 'business'];

/**
 * Get navigation items for sidebar
 * @param userRole - User role (advertiser, merchant, etc.)
 * @param userState - User progression state (0-3)
 */
export function getSidebarNavigation(userRole?: string, userState: number = 0, viewMode: ViewMode = 'participant'): NavigationItem[] {
  return NAVIGATION_ITEMS.filter(item => {
    if (!item.showInSidebar) return false;

    // View Mode Filtering
    if (viewMode === 'business') {
      // In Business Mode, HIDE 'primary' and 'wallet' sections
      if (['primary', 'wallet'].includes(item.sidebarSection || 'primary')) {
        return false;
      }
    } else {
      // In Participant Mode, HIDE 'business' section
      if (item.sidebarSection === 'business') {
        return false;
      }
    }

    if (item.requiredRole && item.requiredRole !== userRole) return false;
    // State-aware filtering
    if (item.minState !== undefined && userState < item.minState) return false;
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

export function getSidebarNavigationGroups(userRole?: string, userState: number = 0, viewMode: ViewMode = 'participant'): NavigationGroup[] {
  const items = getSidebarNavigation(userRole, userState, viewMode);
  return groupNavigationBySection(items);
}

/**
 * Get navigation items for mobile drawer
 */
export function getMobileDrawerNavigation(userRole?: string, userState: number = 0, viewMode: ViewMode = 'participant'): NavigationItem[] {
  return NAVIGATION_ITEMS.filter(item => {
    if (!item.showInMobile) return false;

    // View Mode Filtering
    if (viewMode === 'business') {
      if (['primary', 'wallet'].includes(item.sidebarSection || 'primary')) {
        return false;
      }
    } else {
      if (item.sidebarSection === 'business') {
        return false;
      }
    }

    if (item.requiredRole && item.requiredRole !== userRole) return false;
    if (item.minState !== undefined && userState < item.minState) return false;
    return true;
  });
}

/**
 * Get navigation items for bottom nav (mobile)
 */
export function getBottomNavigation(userRole?: string, userState: number = 0, viewMode: ViewMode = 'participant'): NavigationItem[] {
  return NAVIGATION_ITEMS.filter(item => {
    if (!item.showInBottomNav) return false;

    // View Mode Filtering
    if (viewMode === 'business') {
      if (['primary', 'wallet'].includes(item.sidebarSection || 'primary')) {
        return false;
      }
    } else {
      if (item.sidebarSection === 'business') {
        return false;
      }
    }

    if (item.requiredRole && item.requiredRole !== userRole) return false;
    if (item.minState !== undefined && userState < item.minState) return false;
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
