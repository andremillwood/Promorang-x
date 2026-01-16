import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link as _Link, useLocation, useNavigate } from "react-router-dom";
const Link = _Link as any;
import SuccessGuide from '@/react-app/components/SuccessGuide';
import { useAuth } from '../hooks/useAuth';
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
  ShoppingBag as _ShoppingBag,
  Rocket as _Rocket
} from 'lucide-react';

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
import CurrencyConversionModal from '@/react-app/components/CurrencyConversionModal';
import MasterKeyModal from '@/react-app/components/MasterKeyModal';
import InstagramVerificationModal from '@/react-app/components/InstagramVerificationModal';
import UserTierUpgradeModal from '@/react-app/components/UserTierUpgradeModal';
import SearchModal from '@/react-app/components/SearchModal';
import GoldShopModal from '@/react-app/components/GoldShopModal';
import AchievementsModal from '@/react-app/components/AchievementsModal';
import AccountSwitcher from '@/react-app/components/AccountSwitcher';
import MerchantAccountSwitcher from '@/react-app/components/MerchantAccountSwitcher';
import { useNotifications } from '@/react-app/hooks/useNotifications';
import { buildAuthHeaders } from '@/react-app/utils/api';
import { Routes as RoutePaths } from '@/react-app/utils/url';
import {
  getSidebarNavigationGroups,
  getMobileDrawerNavigation,
  getBottomNavigation,
  groupNavigationBySection,
  isPathActive,
  type NavigationItem,
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
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showMasterKeyModal, setShowMasterKeyModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGoldShopModal, setShowGoldShopModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
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
      const headers = buildAuthHeaders();
      const response = await fetch(withApiBase('/api/users/me'), {
        credentials: 'include',
        headers
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both direct user data and null responses
        if (data && typeof data === 'object') {
          setUserData(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const userRole = (userData as { user_type?: string } | null)?.user_type ?? undefined;

  // Get user's progression state for state-aware navigation
  const { maturityState } = useMaturity();

  const sidebarGroups = getSidebarNavigationGroups(userRole, maturityState);
  const mobileNavItems = getMobileDrawerNavigation(userRole, maturityState);
  const bottomNavItems = getBottomNavigation(userRole, maturityState);

  const quickActionNavNames = new Set([
    'Marketplace',
    'Wallet',
    'Convert Currency',
    'Master Key',
    'Achievements',
    'Leaderboard',
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
    return (userData.points_balance || 0) + (userData.keys_balance || 0) + (userData.gems_balance || 0) + (userData.gold_collected || 0);
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
      case 'Convert Currency':
        setShowCurrencyModal(true);
        return true;
      case 'Master Key':
        setShowMasterKeyModal(true);
        return true;
      case 'Upgrade Tier':
        setShowUpgradeModal(true);
        return true;
      case 'Instagram Rewards':
        setShowInstagramModal(true);
        return true;
      case 'Achievements':
        setShowAchievementsModal(true);
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
      case 'convert':
        setShowCurrencyModal(true);
        break;
      case 'leaderboard':
        navigate('/leaderboard');
        break;
      case 'growthhub':
        navigate('/growth-hub');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'goldshop':
        setShowGoldShopModal(true);
        break;
      case 'achievements':
        setShowAchievementsModal(true);
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

                            <Tooltip content="Premium currency from drops" position="left">
                              <button
                                onClick={() => handleWalletAction('convert')}
                                className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-3">
                                  <Star className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm text-pr-text-1">Gems</span>
                                </div>
                                <span className="text-sm font-medium text-purple-900">{userData?.gems_balance || 0}</span>
                              </button>
                            </Tooltip>

                            {(userData?.gold_collected || 0) > 0 && (
                              <Tooltip content="Achievement rewards" position="left">
                                <button
                                  onClick={() => handleWalletAction('goldshop')}
                                  className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center justify-between"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Trophy className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm text-pr-text-1">Gold</span>
                                  </div>
                                  <span className="text-sm font-medium text-yellow-900">{userData?.gold_collected || 0}</span>
                                </button>
                              </Tooltip>
                            )}
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
                            <Tooltip content="Put your gems to work" position="left" compact={true}>
                              <button
                                onClick={() => handleWalletAction('growthhub')}
                                className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                              >
                                <Rocket className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-pr-text-1">Explore Growth Hub</span>
                              </button>
                            </Tooltip>
                            <Tooltip content="View rankings" position="left" compact={true}>
                              <button
                                onClick={() => handleWalletAction('leaderboard')}
                                className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                              >
                                <Trophy className="w-4 h-4 text-purple-600" />
                                <span className="text-sm text-pr-text-1">View Rankings</span>
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

                            <Tooltip content="Create and manage marketing drops for your business" position="left">
                              <button
                                onClick={() => handleUserAction('advertiser')}
                                className="w-full px-4 py-2 text-left hover:bg-pr-surface-2 flex items-center space-x-3"
                              >
                                <Megaphone className="w-4 h-4 text-orange-600" />
                                <span className="text-sm text-pr-text-1">
                                  {(!userData || (userData as any).user_type !== 'advertiser') ? 'Become Advertiser' : 'Advertiser Dashboard'}
                                </span>
                              </button>
                            </Tooltip>
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
        <aside className="hidden xl:block fixed right-0 top-0 h-screen w-[300px] border-l border-pr-border bg-pr-surface-card z-30">
          <RightSidebar userData={userData} />
        </aside>
      </div>   {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-[#0D0D0D] shadow-xl overflow-y-auto safe-bottom border-l border-pr-border" onClick={(e) => e.stopPropagation()}>
            {/* Header with User Info */}
            <div className="p-4 border-b border-pr-surface-3 bg-pr-surface-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-pr-text-1">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-pr-text-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Section - or Login buttons for guests */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <UserLink
                    username={userData?.username || user?.email?.split('@')[0]}
                    displayName={userData?.display_name || user?.google_user_data?.name || user?.google_user_data?.given_name || 'User'}
                    avatarUrl={userData?.avatar_url || user?.google_user_data?.picture}
                    className="flex items-center space-x-3"
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-pr-text-1 truncate">
                      {userData?.display_name || user?.google_user_data?.name || user?.google_user_data?.given_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="flex items-center space-x-1">
                      {(userData?.user_tier || 'free') === 'super' && <Crown className="w-3 h-3 text-yellow-600" />}
                      {(userData?.user_tier || 'free') === 'premium' && <Star className="w-3 h-3 text-purple-600" />}
                      {(userData?.user_tier || 'free') === 'free' && <Star className="w-3 h-3 text-pr-text-2" />}
                      <span className={`text-xs font-medium ${(userData?.user_tier || 'free') === 'super' ? 'text-yellow-700' :
                        (userData?.user_tier || 'free') === 'premium' ? 'text-purple-700' : 'text-pr-text-1'
                        }`}>
                        {(userData?.user_tier || 'free').charAt(0).toUpperCase() + (userData?.user_tier || 'free').slice(1)} Tier
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-pr-text-2 mb-2">Sign in to access all features</p>
                  <Link
                    to="/auth"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full py-3 text-center text-sm font-medium text-pr-text-1 bg-pr-surface-2 hover:bg-pr-surface-3 rounded-lg transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-pr-text-2 uppercase tracking-wide mb-3">Quick Actions</h3>

              {/* Search */}
              <button
                onClick={() => {
                  setShowSearchModal(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
              >
                <Search className="w-5 h-5 text-pr-text-2" />
                <span className="font-medium">Search</span>
              </button>

              {/* Marketplace */}
              <button
                onClick={() => {
                  navigate('/marketplace');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Marketplace</span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => {
                  setShowNotifications(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-pr-text-2" />
                  <span className="font-medium">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Wallet Section */}
            {(user || userData) && (
              <div className="px-4 pb-4">
                <h3 className="text-sm font-medium text-pr-text-2 uppercase tracking-wide mb-3">Wallet</h3>
                <div className="bg-pr-surface-2 rounded-lg p-3 mb-3 border border-pr-surface-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-pr-text-1">Total Balance</span>
                    <span className="text-lg font-bold text-blue-900">{getTotalBalance().toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-3 h-3 text-blue-600" />
                      <span>{(userData?.points_balance || 0).toLocaleString()} pts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Key className="w-3 h-3 text-orange-600" />
                      <span>{userData?.keys_balance || 0} keys</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-purple-600" />
                      <span>{userData?.gems_balance || 0} gems</span>
                    </div>
                    {(userData?.gold_collected || 0) > 0 && (
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-3 h-3 text-yellow-600" />
                        <span>{userData?.gold_collected || 0} gold</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleWalletAction('wallet');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Full Wallet</span>
                  </button>

                  <button
                    onClick={() => {
                      handleWalletAction('convert');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                  >
                    <Star className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Convert Currency</span>
                  </button>

                  <button
                    onClick={() => {
                      handleWalletAction('masterkey');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                  >
                    <Key className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Master Key</span>
                  </button>
                </div>
              </div>
            )}

            {/* Account Management */}
            <div className="px-4 pb-4">
              <h3 className="text-sm font-medium text-pr-text-2 uppercase tracking-wide mb-3">Account</h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    handleUserAction('profile');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                >
                  <User className="w-4 h-4 text-pr-text-2" />
                  <span className="text-sm">Profile</span>
                </button>

                {(user || userData) && (
                  <button
                    onClick={() => {
                      handleUserAction('upgrade');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                  >
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Upgrade Tier</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleWalletAction('achievements');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Achievements</span>
                </button>

                <button
                  onClick={() => {
                    handleWalletAction('leaderboard');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Leaderboard</span>
                </button>

                <button
                  onClick={() => {
                    handleWalletAction('instagram');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                >
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-sm">Instagram Rewards</span>
                </button>
              </div>
            </div>

            {/* Additional Navigation */}
            {overlayNavGroups.map((group) => (
              <div key={`mobile-nav-${group.section}`} className="px-4 pb-4">
                <h3 className="text-sm font-medium text-pr-text-2 uppercase tracking-wide mb-3">{group.label}</h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const IconIcon = item.icon as any;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setShowMobileMenu(false)}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                      >
                        <IconIcon className="w-4 h-4 text-pr-text-2" />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Business Tools */}
            <div className="px-4 pb-4">
              <h3 className="text-sm font-medium text-pr-text-2 uppercase tracking-wide mb-3">Business</h3>
              <button
                onClick={() => {
                  handleUserAction('advertiser');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
              >
                <Megaphone className="w-4 h-4 text-orange-600" />
                <span className="text-sm">
                  {(!userData || (userData as any).user_type !== 'advertiser') ? 'Become Advertiser' : 'Advertiser Dashboard'}
                </span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="px-4 pb-6 border-t border-pr-surface-3 pt-4">
              <button
                onClick={() => {
                  handleUserAction('logout');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
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
      <CurrencyConversionModal
        user={userData}
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)
        }
        onSuccess={fetchUserData}
      />

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

      <GoldShopModal
        user={userData}
        isOpen={showGoldShopModal}
        onClose={() => setShowGoldShopModal(false)}
        onPurchase={fetchUserData}
      />

      <AchievementsModal
        user={userData}
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
      <SuccessGuide isOpen={showSuccessGuide} onClose={() => setShowSuccessGuide(false)} />

      {/* Quick Actions FAB - Mobile Only */}
      <QuickActionsButton />
    </>
  );
}
