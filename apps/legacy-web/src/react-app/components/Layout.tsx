import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link as _Link, useLocation, useNavigate } from "react-router-dom";
const Link = _Link as any;
import SuccessGuide from '@/react-app/components/SuccessGuide';
import { useAuth } from '../hooks/useAuth';
import api from '@/react-app/lib/api';
import { API_BASE_URL } from '../config';
import {
  User as _User,
  LogOut as _LogOut,
  Coins as _Coins,
  Key as _Key,
  Star as _Star,
  Trophy as _Trophy,
  Megaphone as _Megaphone,
  Search as _Search,
  X as _X,
  Wallet as _Wallet,
  ChevronDown as _ChevronDown,
  Crown as _Crown,
  Bell as _Bell,
  Sun as _Sun,
  BarChart3 as _BarChart3,
  Store as _Store,
  Settings as _Settings,
} from 'lucide-react';

const Sun = _Sun as any;
const BarChart3 = _BarChart3 as any;
const Store = _Store as any;
const SettingsIcon = _Settings as any;

import { Zap } from 'lucide-react';

const User = _User as any;
const LogOut = _LogOut as any;
const Coins = _Coins as any;
const Key = _Key as any;
const Star = _Star as any;
const Trophy = _Trophy as any;
const Megaphone = _Megaphone as any;
const Search = _Search as any;
const X = _X as any;
const Wallet = _Wallet as any;
const ChevronDown = _ChevronDown as any;
const Crown = _Crown as any;
const Bell = _Bell as any;
const ShoppingBag = _ShoppingBag as any;
const Rocket = _Rocket as any;

import UserLink from '@/react-app/components/UserLink';
import Tooltip from '@/react-app/components/Tooltip';
import NotificationCenter from '@/react-app/components/NotificationCenter';
import DesktopSidebar from '@/react-app/components/DesktopSidebar';
import RightSidebar from '@/react-app/components/RightSidebar';
import MobileNav from '@/react-app/components/MobileNav';
import QuickActionsButton from '@/react-app/components/QuickActionsButton';
import MasterKeyModal from '@/react-app/components/MasterKeyModal';
import InstagramVerificationModal from '@/react-app/components/InstagramVerificationModal';
import UserTierUpgradeModal from '@/react-app/components/UserTierUpgradeModal';
import SearchModal from '@/react-app/components/SearchModal';
import AccountSwitcher from '@/react-app/components/AccountSwitcher';
import MerchantAccountSwitcher from '@/react-app/components/MerchantAccountSwitcher';
import { useNotifications } from '@/react-app/hooks/useNotifications';
import { Routes as RoutePaths } from '@/react-app/utils/url';
import {
  getSidebarNavigationGroups,
  getMobileDrawerNavigation,
  getBottomNavigation,
  groupNavigationBySection,
  isPathActive,
  type NavigationItem,
  type ViewMode,
} from '@/react-app/config/navigation';
import { useMaturity } from '@/react-app/context/MaturityContext';



interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth() as any;
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [showMasterKeyModal, setShowMasterKeyModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSuccessGuide, setShowSuccessGuide] = useState(true);
  const { unreadCount } = useNotifications();
  const apiBase = API_BASE_URL || '';
  const withApiBase = (path: string) => `${apiBase}${path}`;

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowWalletMenu(false);
        setShowMobileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.user-menu') && !target.closest('.wallet-menu')) {
        setShowUserMenu(false);
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/me');

      if (response && response.success && response.user) {
        setUserData(response.user);
      } else if (response && typeof response === 'object' && 'id' in response) {
        setUserData(response);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const userRole = (userData?.user_type || user?.user_type || user?.role) ?? undefined;

  // Dynamic View Mode: Derived from current URL path
  const viewMode: ViewMode = location.pathname.startsWith('/advertiser') || location.pathname.startsWith('/merchant') || location.pathname.startsWith('/operator')
    ? 'business'
    : 'participant';

  const inBusinessView = viewMode === 'business';

  // Get user's progression state for state-aware navigation
  const { maturityState } = useMaturity();

  const sidebarGroups = getSidebarNavigationGroups(userRole, maturityState, viewMode);
  const mobileNavItems = getMobileDrawerNavigation(userRole, maturityState, viewMode);
  const bottomNavItems = getBottomNavigation(userRole, maturityState, viewMode);

  const quickActionNavNames = new Set([
    'Wallet',
    'Master Key',
    'Instagram Rewards',
  ]);

  const overlayNavGroups = groupNavigationBySection(mobileNavItems)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !quickActionNavNames.has(item.name)),
    }))
    .filter((group) => group.items.length > 0);

  const isActive = (path: string) => isPathActive(location.pathname, path);

  const getTotalBalance = () => {
    if (!userData) return 0;
    // Removed verified_credits and gold from the total balance calculation
    return (userData.points_balance || 0) + (userData.keys_balance || 0);
  };

  const profileSlug =
    userData?.username ||
    (userData?.email ? userData.email.split('@')[0] : undefined) ||
    (user?.username ? String(user.username) : undefined) ||
    (user?.email ? user.email.split('@')[0] : undefined) ||
    'me';

  const profilePath = RoutePaths.profile(profileSlug);

  const handleSidebarNavClick = (item: NavigationItem) => {
    switch (item.name) {
      case 'Master Key':
        setShowMasterKeyModal(true);
        return true;
      case 'Upgrade Tier':
        setShowUpgradeModal(true);
        return true;
      case 'Instagram Rewards':
        setShowInstagramModal(true);
        return true;
      default:
        return false;
    }
  };

  const handleWalletAction = (action: string) => {
    setShowWalletMenu(false);
    switch (action) {
      case 'instagram':
        setShowInstagramModal(true);
        break;
      case 'masterkey':
        setShowMasterKeyModal(true);
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      // Call the Mocha auth logout first to clear authentication state
      await signOut();

      // Clear any local storage or session storage
      localStorage.clear();
      sessionStorage.clear();

      // Call our backend logout endpoint to clear server-side session
      try {
        await fetch(withApiBase('/api/auth/logout'), {
          method: 'POST',
          credentials: 'include'
        });
      } catch (backendError) {
        console.error('Backend logout failed:', backendError);
        // Continue with redirect even if backend logout fails
      }

      // Use React Router navigate to go to the marketing page
      navigate('/', { replace: true });

    } catch (error) {
      console.error('Logout failed:', error);

      // Fallback: Force clear everything and redirect anyway
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.error('Failed to clear storage:', storageError);
      }

      // Still redirect to marketing page even if logout fails
      navigate('/', { replace: true });
    }
  };

  const handleUserAction = (action: string) => {
    setShowUserMenu(false);
    switch (action) {
      case 'profile':
        navigate(profilePath);
        break;
      case 'upgrade':
        setShowUpgradeModal(true);
        break;
      case 'advertiser':
        if (!userData || (userData as any).user_type !== 'advertiser') {
          navigate('/advertiser/onboarding');
        } else {
          navigate('/advertiser');
        }
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* DESKTOP: TRUE 3-COLUMN GRID LAYOUT */}
      <div className="min-h-screen bg-pr-surface-background grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
        {/* LEFT SIDEBAR - Desktop Only (260px fixed) */}
        <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[260px] border-r border-pr-border bg-pr-surface-card z-30">
          <DesktopSidebar
            groups={sidebarGroups}
            isActive={isActive}
            onNavClick={handleSidebarNavClick}
            onLogout={handleLogout}
            onSearch={() => setShowSearchModal(true)}
            userData={userData}
            profilePath={profilePath}
            showSuccessGuide={showSuccessGuide}
            onToggleSuccessGuide={() => setShowSuccessGuide(true)}
          />
        </aside>

        {/* MAIN CONTENT AREA (Center Column) */}
        <div className="flex flex-col min-w-0 min-h-screen lg:col-start-2">
          {/* Top Header - Mobile & Tablet */}
          <header className="bg-pr-surface-1 shadow-sm border-b border-pr-surface-3 sticky top-0 z-40 lg:hidden">
            <div className="max-w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Left Side - Logo & Search */}
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
                    <img
                      src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png"
                      alt="Promorang"
                      className="h-8 w-8 sm:h-10 sm:w-10 transition-transform group-hover:scale-105"
                    />
                  </Link>
                  {userRole === 'advertiser' && (
                    <div className="ml-2">
                      <AccountSwitcher />
                    </div>
                  )}
                  {userRole === 'merchant' && (
                    <div className="ml-2">
                      <MerchantAccountSwitcher />
                    </div>
                  )}
                </div>

                {/* Right Side - Actions & User Menu */}
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {/* Desktop Search Button */}
                  <Tooltip content="Search (⌘K)" position="bottom" compact={true}>
                    <button
                      onClick={() => setShowSearchModal(true)}
                      className="hidden md:flex items-center space-x-2 px-3 py-2 bg-pr-surface-2 hover:bg-pr-surface-3 rounded-lg transition-colors"
                    >
                      <Search className="w-4 h-4 text-pr-text-2" />
                      <span className="text-sm text-pr-text-2">Search...</span>
                      <kbd className="hidden lg:inline-flex items-center px-2 py-1 text-xs font-medium text-pr-text-2 bg-pr-surface-card border border-pr-surface-3 rounded">
                        ⌘K
                      </kbd>
                    </button>
                  </Tooltip>

                  {/* Desktop Notifications */}
                  <Tooltip content="Notifications" position="bottom" compact={true}>
                    <button
                      onClick={() => setShowNotifications(true)}
                      className="hidden md:flex relative p-2 text-gray-400 hover:text-pr-text-2 transition-colors rounded-lg hover:bg-pr-surface-2"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </Tooltip>


                  {/* Desktop Wallet Menu */}
                  {(user || userData) && (
                    <div className="relative wallet-menu hidden md:block">
                      <Tooltip content="Your wallet balance" position="bottom" compact={true}>
                        <button
                          onClick={() => setShowWalletMenu(!showWalletMenu)}
                          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition-all duration-200 border border-blue-200/50 shadow-sm hover:shadow-md"
                        >
                          <Wallet className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-blue-900 truncate max-w-[80px] md:max-w-none">
                            {getTotalBalance().toLocaleString()}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform flex-shrink-0 ${showWalletMenu ? 'rotate-180' : ''}`} />
                        </button>
                      </Tooltip>

                      {/* Wallet Dropdown */}
                      {showWalletMenu && (
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#141414] rounded-lg shadow-lg border border-pr-surface-3 py-2 z-50">
                          <div className="px-4 py-2 border-b border-pr-border">
                            <h3 className="text-sm font-medium text-pr-text-1">Your Balances</h3>
                          </div>

                          <div className="py-2">
                            <Tooltip content="Earn points from engagement" position="left">
                              <button
                                onClick={() => handleWalletAction('instagram')}
                                className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-3">
                                  <Coins className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-pr-text-1">Points</span>
                                </div>
                                <span className="text-sm font-medium text-blue-900">{userData?.points_balance || 0}</span>
                              </button>
                            </Tooltip>

                            <Tooltip content="Unlock premium features" position="left">
                              <button
                                onClick={() => handleWalletAction('masterkey')}
                                className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-3">
                                  <Key className="w-4 h-4 text-orange-600" />
                                  <span className="text-sm text-pr-text-1">Keys</span>
                                </div>
                                <span className="text-sm font-medium text-orange-900">{userData?.keys_balance || 0}</span>
                              </button>
                            </Tooltip>


                          </div>

                          <div className="border-t border-pr-border pt-2">
                            <Tooltip content="Full wallet management" position="left" compact={true}>
                              <button
                                onClick={() => handleWalletAction('wallet')}
                                className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                              >
                                <Wallet className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-pr-text-1">View Full Wallet</span>
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Desktop User Menu - Show login buttons if not authenticated */}
                  {!user ? (
                    <div className="hidden md:flex items-center space-x-2">
                      <Link
                        to="/auth"
                        className="px-4 py-2 text-sm font-medium text-pr-text-1 hover:bg-pr-surface-2 rounded-lg transition-colors"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/auth?mode=signup"
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  ) : (
                    <div className="relative user-menu hidden md:block">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-pr-surface-2 transition-all duration-200 group"
                      >
                        <UserLink
                          username={userData?.username || user?.email?.split('@')[0]}
                          displayName={userData?.display_name || user?.google_user_data?.name || user?.google_user_data?.given_name}
                          avatarUrl={userData?.avatar_url || user?.google_user_data?.picture}
                          className="flex items-center space-x-2"
                          size="sm"
                        />
                        <div className="hidden lg:block text-left ml-1 sm:ml-2">
                          <div className="text-xs sm:text-sm font-medium text-pr-text-1 truncate max-w-24 xl:max-w-32">
                            {user?.google_user_data?.given_name || user?.google_user_data?.name || user?.email?.split('@')[0] || 'User'}
                          </div>
                          <div className="flex items-center space-x-1">
                            {(userData?.user_tier || 'free') === 'super' && <Crown className="w-3 h-3 text-yellow-600" />}
                            {(userData?.user_tier || 'free') === 'premium' && <Star className="w-3 h-3 text-purple-600" />}
                            {(userData?.user_tier || 'free') === 'free' && <Star className="w-3 h-3 text-pr-text-2" />}
                            <span className={`text-xs font-medium ${(userData?.user_tier || 'free') === 'super' ? 'text-yellow-700' :
                              (userData?.user_tier || 'free') === 'premium' ? 'text-purple-700' : 'text-pr-text-1'
                              }`}>
                              {(userData?.user_tier || 'free').charAt(0).toUpperCase() + (userData?.user_tier || 'free').slice(1)}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform group-hover:text-pr-text-2 ${showUserMenu ? 'rotate-180' : ''}`} />
                      </button>

                      {/* User Dropdown */}
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#141414] rounded-lg shadow-lg border border-pr-surface-3 py-2 z-50">
                          <div className="px-4 py-2 border-b border-pr-border">
                            <div className="text-sm font-medium text-pr-text-1">
                              {userData?.display_name || user?.google_user_data?.name || user?.google_user_data?.given_name || user?.email?.split('@')[0] || 'User'}
                            </div>
                            <div className="text-xs text-pr-text-2">{user?.email}</div>
                          </div>

                          <div className="py-2">
                            {/* Role Switcher */}
                            {['advertiser', 'merchant', 'operator'].includes(userRole) && (
                              <div className="mb-2 pb-2 border-b border-pr-border">
                                {viewMode === 'business' ? (
                                  <button
                                    onClick={() => navigate('/today')}
                                    className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                                  >
                                    <Sun className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-medium text-orange-600">Switch to Participant</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => navigate('/advertiser')}
                                    className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                                  >
                                    <BarChart3 className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-600">Switch to Business</span>
                                  </button>
                                )}
                              </div>
                            )}

                            <button
                              onClick={() => handleUserAction('profile')}
                              className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                            >
                              <User className="w-4 h-4 text-pr-text-2" />
                              <span className="text-sm text-pr-text-1">Profile</span>
                            </button>

                            {!showSuccessGuide && (
                              <button
                                onClick={() => {
                                  setShowSuccessGuide(true);
                                  setShowUserMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                              >
                                <Trophy className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-pr-text-1">Show Success Guide</span>
                              </button>
                            )}

                            {userData && (
                              <Tooltip content="Upgrade to Premium or Super tier for better rewards" position="left">
                                <button
                                  onClick={() => handleUserAction('upgrade')}
                                  className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                                >
                                  <Crown className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm text-pr-text-1">Upgrade Tier</span>
                                </button>
                              </Tooltip>
                            )}

                            {(!['advertiser', 'merchant', 'operator'].includes(userRole)) && (
                              <Tooltip content="Manage your hosted moments and invitations" position="left">
                                <button
                                  onClick={() => handleUserAction('advertiser')}
                                  className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                                >
                                  <Zap className="w-4 h-4 text-amber-500" />
                                  <span className="text-sm font-medium text-pr-text-1">
                                    Hosting Center
                                  </span>
                                </button>
                              </Tooltip>
                            )}
                          </div>

                          <div className="border-t border-pr-border pt-2">
                            <button
                              onClick={() => handleUserAction('logout')}
                              className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3 text-red-600"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm">Sign Out</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </header>

          {/* CENTER FEED - Fluid expansion */}
          <main className="flex-1 bg-pr-surface-background">
            <div className="max-w-[1800px] w-full mx-auto px-0 sm:px-4 md:px-6 lg:px-8 py-6 pb-mobile-nav lg:pb-8">
              {children}
            </div>
          </main>
        </div>

        {/* RIGHT SIDEBAR - Desktop Only (300px fixed, visible at xl+) */}
        {!inBusinessView && (
          <aside className="hidden xl:block fixed right-0 top-0 h-screen w-[300px] border-l border-pr-border bg-pr-surface-card z-30">
            <RightSidebar userData={userData} />
          </aside>
        )}
      </div>        {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
          <div
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#0c0a0f] shadow-2xl overflow-y-auto safe-bottom border-l border-white/10 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Wash */}
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[30%] bg-amber-500/[0.04] blur-[100px] pointer-events-none rounded-full" />

            {/* Header with User Info */}
            <div className="relative z-10 p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white italic lowercase tracking-tighter">menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Profile Section - or Login buttons for guests */}
              {user ? (
                <div className="flex items-center space-x-4 p-4 rounded-[2rem] bg-white/5 ring-1 ring-white/10">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/5">
                      <img
                        src={userData?.avatar_url || user?.google_user_data?.picture || `https://ui-avatars.com/api/?name=${userData?.display_name || 'User'}&background=random`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-[#0c0a0f] rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-white italic lowercase truncate leading-none">
                      {userData?.display_name || user?.google_user_data?.name || user?.google_user_data?.given_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="flex items-center space-x-1 mt-1.5">
                      {(userData?.user_tier || 'free') === 'super' && <Crown className="w-3 h-3 text-yellow-500" />}
                      {(userData?.user_tier || 'free') === 'premium' && <Star className="w-3 h-3 text-purple-500" />}
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest truncate">
                        {(userData?.user_tier || 'free')} tier
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">Join the movement</p>
                  <Link
                    to="/auth"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full py-4 text-center text-sm font-black italic lowercase text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full py-4 text-center text-sm font-black italic lowercase text-black bg-white hover:bg-gray-100 rounded-full transition-colors"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-6">

              {/* 1. Search (Matches Sidebar) */}
              <button
                onClick={() => {
                  setShowSearchModal(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-4 px-6 py-4 rounded-full text-sm font-black italic lowercase text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors"
              >
                <Search className="w-5 h-5 text-white/20" />
                <span>Search</span>
              </button>

              {/* 2. Main Navigation Groups */}
              {overlayNavGroups.map((group) => (
                <div key={`mobile-nav-${group.section}`} className="space-y-2">
                  {overlayNavGroups.length > 1 && (
                    <p className="px-5 text-xs font-semibold uppercase tracking-wide text-white/30">
                      {group.label}
                    </p>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const IconIcon = item.icon as any;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setShowMobileMenu(false)}
                          className={`w-full flex items-center space-x-4 px-6 py-4 rounded-full text-sm font-black italic lowercase transition-colors ${isActive(item.href)
                            ? 'bg-amber-500/10 text-amber-500 shadow-xl shadow-amber-500/5'
                            : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                            }`}
                        >
                          <IconIcon className={`w-5 h-5 ${isActive(item.href) ? 'text-amber-500' : 'text-white/20'}`} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* 3. Business Link (Matches Sidebar logic) */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleUserAction('advertiser');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-4 px-6 py-4 rounded-full text-sm font-black italic lowercase text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                >
                  <Megaphone className="w-5 h-5" />
                  <span>
                    {(!userData || (userData as any).user_type !== 'advertiser') ? 'Become Advertiser' : 'Advertiser Dashboard'}
                  </span>
                </button>
              </div>

              {/* 4. Settings & Footer (Matches Sidebar footer) */}
              <div className="pt-6 border-t border-white/5 space-y-3">
                <Link
                  to="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={() => {
                    handleUserAction('logout');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/5 text-center pb-8 safe-bottom">
                © 2024 Promorang
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MOBILE/TABLET BOTTOM NAVIGATION - FIXED at bottom (hidden on desktop) */}
      <nav className="fixed bottom-0 inset-x-0 bg-pr-surface-card bg-white dark:bg-[#141414] border-t border-pr-surface-3 z-[9999] lg:hidden safe-bottom mobile-nav-fixed">
        <MobileNav
          items={bottomNavItems}
          isActive={isActive}
          onMenuClick={() => setShowMobileMenu(!showMobileMenu)}
          showMobileMenu={showMobileMenu}
        />
      </nav>

      {/* Modals */}
      <MasterKeyModal
        user={userData}
        isOpen={showMasterKeyModal}
        onClose={() => setShowMasterKeyModal(false)}
        onSuccess={fetchUserData}
      />

      <InstagramVerificationModal
        user={userData}
        isOpen={showInstagramModal}
        onClose={() => setShowInstagramModal(false)}
        onSuccess={fetchUserData}
      />

      <UserTierUpgradeModal
        user={userData}
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={fetchUserData}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      {!inBusinessView && <SuccessGuide isOpen={showSuccessGuide} onClose={() => setShowSuccessGuide(false)} />}

      {/* Quick Actions FAB - Mobile Only */}
      <QuickActionsButton />
    </>
  );
}
