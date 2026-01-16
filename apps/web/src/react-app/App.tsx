import { Suspense } from "react";
import type { ReactNode } from "react";
import { BrowserRouter as Router, Routes as OriginalRoutes, Route as OriginalRoute, Navigate as OriginalNavigate, useLocation, Link } from "react-router-dom";

const Routes = OriginalRoutes as any;
const Route = OriginalRoute as any;
const Navigate = OriginalNavigate as any;
import LeaderboardPage from "@/react-app/pages/Leaderboard";
import PromoShareDashboard from "@/react-app/pages/PromoShareDashboard";
import Layout from "@/react-app/components/Layout";
import EnhancedErrorBoundary from "@/react-app/components/common/EnhancedErrorBoundary";
import LayoutDebugger from "@/react-app/components/LayoutDebugger";
import HomePage from "@/react-app/pages/Home";
import AuthPage from "@/react-app/pages/AuthPage";
import HomeFeedPage from "@/react-app/pages/HomeFeed";
import Feed from "@/react-app/pages/Feed";
import EarnPage from "@/react-app/pages/Earn";
import CreatePage from "@/react-app/pages/Create";
import InvestPage from "@/react-app/pages/Invest";
import ContentSharesMarket from "@/react-app/pages/ContentSharesMarket";
import ShareDetail from "@/react-app/pages/ShareDetail";
import WalletPage from "@/react-app/pages/Wallet";
import GrowthHubPage from "@/react-app/pages/GrowthHub";
import { ProfilePage } from "@/react-app/pages/Profile";
import { ContentDetailPage } from "@/react-app/pages/ContentDetail";
import HoldingDetailPage from "@/react-app/pages/HoldingDetail";
import PredictionDetailPage from "@/react-app/pages/PredictionDetail";
import TaskDetailPage from "@/react-app/pages/TaskDetail";
import AdvertiserDashboard from "@/react-app/pages/AdvertiserDashboard";
import AdvertiserOnboarding from "@/react-app/pages/AdvertiserOnboarding";
import Onboarding from "@/react-app/pages/Onboarding";
import AdvertiserLayout from "@/react-app/pages/AdvertiserLayout";
import AdvertiserCoupons from "@/react-app/pages/AdvertiserCoupons";
import CouponDetail from "@/react-app/pages/CouponDetail";
import BulkCouponCreation from "@/react-app/pages/BulkCouponCreation";
import CouponAnalytics from "@/react-app/pages/CouponAnalytics";
import AdvertiserTeamSettings from "@/react-app/pages/AdvertiserTeamSettings";
import MerchantTeamSettings from "@/react-app/pages/MerchantTeamSettings";
import AcceptInvitation from "@/react-app/pages/AcceptInvitation";
import CampaignDetail from "@/react-app/pages/CampaignDetail";
import CampaignsPage from "@/react-app/pages/Campaigns";
import NewCampaign from "@/react-app/pages/NewCampaign";
import EditCampaign from "@/react-app/pages/EditCampaign";
import Rewards from "@/react-app/pages/Rewards";
import ReferralDashboard from "@/react-app/pages/ReferralDashboard";
import Settings from "@/react-app/pages/Settings";
import MarketplaceBrowse from "@/react-app/pages/MarketplaceBrowse";
import ProductDetail from "@/react-app/pages/ProductDetail";
import ShoppingCart from "@/react-app/pages/ShoppingCart";
import Checkout from "@/react-app/pages/Checkout";
import Orders from "@/react-app/pages/Orders";
import StorePage from "@/react-app/pages/StorePage";
import MerchantDashboard from "@/react-app/pages/MerchantDashboard";
import OperatorDashboard from "@/react-app/pages/OperatorDashboard";
import AdminLayout from "@/react-app/layouts/AdminLayout";
import AdminDashboard from "@/react-app/pages/admin/AdminDashboard";
import AdminKYC from "@/react-app/pages/admin/AdminKYC";
import AdminSupport from "@/react-app/pages/admin/AdminSupport";
import AdminSettings from "@/react-app/pages/admin/AdminSettings";
import AdminSiteMap from "@/react-app/pages/admin/AdminSiteMap";
import SupportPage from "@/react-app/pages/Support";
import SeasonHubPage from "@/react-app/pages/SeasonHubPage";
import ProductForm from "@/react-app/pages/ProductForm";
import ActivityFeed from "@/react-app/pages/ActivityFeed";
import UserProfile from "@/react-app/pages/UserProfile";
import AdminForecasts from "@/react-app/pages/AdminForecasts";
import TestContentDetailsPage from "@/react-app/pages/TestContentDetailsPage";
import NotFound from "@/react-app/pages/NotFound";
import { AuthProvider, useAuth } from '@/react-app/hooks/useAuth';
import { ToastProvider } from '@/react-app/components/ui/use-toast';
import OAuthCallback from "@/react-app/pages/OAuthCallback";
import PasswordResetPage from "@/react-app/pages/PasswordResetPage";
import SessionManager from "@/react-app/components/auth/SessionManager";
import ValidateCoupon from "@/react-app/pages/ValidateCoupon";
import VenueQRManager from "@/react-app/pages/VenueQRManager";
import SoundDiscovery from "@/react-app/pages/SoundDiscovery";
import SoundDetail from "@/react-app/pages/SoundDetail";
import BlogHub from "@/react-app/pages/BlogHub";
import BlogPost from "@/react-app/pages/BlogPost";
import MyTickets from "@/react-app/pages/MyTickets";
import TicketDetail from "@/react-app/pages/TicketDetail";
import MyCoupons from "@/react-app/pages/MyCoupons";
import CreateDrop from "@/react-app/pages/CreateDrop";
import ManageDrops from "@/react-app/pages/ManageDrops";
import MatrixDashboard from "@/react-app/pages/MatrixDashboard";
import Today from "@/react-app/pages/Today";
import TodayOpportunity from "@/react-app/pages/TodayOpportunity";
import SamplingCreateWizard from "@/react-app/pages/SamplingCreateWizard";

// Entry Surface Pages (State-Aware Experience Layer)
import { ContributePage, DealsPage, EventsEntryPage, PostProofPage, StartPage } from "@/react-app/pages/entry";
import { MaturityProvider, useMaturity } from "@/react-app/context/MaturityContext";
import MaturityStateController from "@/react-app/components/MaturityStateController";
// Guard and UserMaturityState available for route protection if needed
// import { Guard, FeatureGuards } from "@/react-app/components/Guard";
// import { UserMaturityState } from "@/react-app/context/MaturityContext";

// Restored Marketing Pages
import ForCreators from "@/react-app/pages/marketing/ForCreators";
import ForAdvertisers from "@/react-app/pages/marketing/ForAdvertisers";
import About from "@/react-app/pages/marketing/About";
import Contact from "@/react-app/pages/marketing/Contact";
import Privacy from "@/react-app/pages/legal/Privacy";
import Terms from "@/react-app/pages/legal/Terms";
import ForShoppers from "@/react-app/pages/marketing/ForShoppers";
import ForOperators from "@/react-app/pages/marketing/ForOperators";
import PromoPointsPage from "@/react-app/pages/marketing/PromoPointsPage";
import WorkforceDashboard from "@/react-app/pages/WorkforceDashboard";
import WorkforcePodDetail from "@/react-app/pages/WorkforcePodDetail";
import HowItWorks from "@/react-app/pages/marketing/HowItWorks";
import PricingPage from "@/react-app/pages/marketing/PricingPage";
import AdvertiserPricingPage from "@/react-app/pages/marketing/AdvertiserPricingPage";
import ForInvestors from "@/react-app/pages/marketing/ForInvestors";
import ForMerchants from "@/react-app/pages/marketing/ForMerchants";
import ForTourism from "@/react-app/pages/marketing/ForTourism";
import ForRestaurants from "@/react-app/pages/marketing/ForRestaurants";
import MatrixPage from "@/react-app/pages/marketing/MatrixPage";
import ForUniversities from "@/react-app/pages/marketing/ForUniversities";
import ForEcommerce from "@/react-app/pages/marketing/ForEcommerce";
import ForEvents from "@/react-app/pages/marketing/ForEvents";
import ForEnterprise from "@/react-app/pages/marketing/ForEnterprise";
import ContentSharesPage from "@/react-app/pages/marketing/ContentSharesPage";
import ForecastsPage from "@/react-app/pages/marketing/ForecastsPage";
import GrowthHubMarketingPage from "@/react-app/pages/marketing/GrowthHubPage";
import ReferralProgramPage from "@/react-app/pages/marketing/ReferralProgramPage";
import DropsPage from "@/react-app/pages/marketing/DropsPage";
import DropsForAdvertisersPage from "@/react-app/pages/marketing/DropsForAdvertisersPage";
import ContentEcosystemPage from "@/react-app/pages/marketing/ContentEcosystemPage";
import RelaysPage from "@/react-app/pages/marketing/RelaysPage";
import CouponsForShoppersPage from "@/react-app/pages/marketing/CouponsForShoppersPage";
import CouponsForMerchantsPage from "@/react-app/pages/marketing/CouponsForMerchantsPage";
import CampaignsMarketingPage from "@/react-app/pages/marketing/CampaignsMarketingPage";
import MovesPage from "@/react-app/pages/marketing/MovesPage";

import SocialShieldPage from "@/react-app/pages/marketing/SocialShieldPage";
import GemsStakingPage from "@/react-app/pages/marketing/GemsStakingPage";
import AutoInvestPage from "@/react-app/pages/marketing/AutoInvestPage";
import CreatorFundingPage from "@/react-app/pages/marketing/CreatorFundingPage";
import GrowthChannelsPage from "@/react-app/pages/marketing/GrowthChannelsPage";
import PlatformEconomyPage from "@/react-app/pages/marketing/PlatformEconomyPage";
import CatalogPage from "@/react-app/pages/marketing/CatalogPage";
import HomeLegacy from "@/react-app/pages/marketing/HomeLegacy";
import ExploreLegacy from "@/react-app/pages/marketing/ExploreLegacy";

// Public Pages (for SEO/sharing)
import PublicDropPage from "@/react-app/pages/public/PublicDropPage";
import PublicMarketplacePage from "@/react-app/pages/public/PublicMarketplacePage";
import PublicProductPage from "@/react-app/pages/public/PublicProductPage";
import PublicContentPage from "@/react-app/pages/public/PublicContentPage";
import PublicForecastPage from "@/react-app/pages/public/PublicForecastPage";
import ExplorePage from "@/react-app/pages/public/ExplorePage";
import ExploreCoupons from "@/react-app/pages/public/ExploreCoupons";
import PublicCouponDetail from "@/react-app/pages/public/PublicCouponDetail";

// Proposals
import DryvaMobilityPage from "@/react-app/pages/proposals/dryvamobility/DryvaMobilityPage";


// Events Pages
import Events from "@/react-app/pages/Events";
import EventDetail from "@/react-app/pages/EventDetail";
import CreateEvent from "@/react-app/pages/CreateEvent";
import CreateEventSimple from "@/react-app/pages/entry/CreateEventSimple";

// Operator Hub Manager
import OperatorHubManager from "@/react-app/pages/OperatorHubManager";

// Access Rank Page
import AccessRankPage from "@/react-app/pages/AccessRankPage";

// Debug logging - Verifying git tracking
console.log("🚀 App.tsx: Starting to load...");

// Protected route wrapper that requires authentication
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { user: !!user, isLoading, path: location.pathname });

  if (isLoading) {
    return (
      <div className="min-h-screen-dynamic flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to /auth from:', location.pathname);
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

const ProtectedLayout = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

/**
 * TodayLayout - State-aware layout for Today pages
 * 
 * - State 0/1 (new users): Minimal layout without sidebar (focused experience)
 * - State 2+ (engaged users): Full layout with sidebar
 */
const TodayLayout = ({ children }: { children: ReactNode }) => {
  const { maturityState, isLoading } = useMaturity();

  if (isLoading) {
    return (
      <div className="min-h-screen-dynamic flex items-center justify-center bg-pr-surface-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // State 0/1: Minimal focused layout (no sidebar)
  if (maturityState <= 1) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen-dynamic bg-pr-surface-background">
          {/* Minimal header */}
          <header className="sticky top-0 z-40 bg-pr-surface-background/80 backdrop-blur-lg border-b border-pr-border/50">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
              <img
                src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png"
                alt="Promorang"
                className="h-8 w-8"
              />
              <span className="text-sm font-bold text-pr-text-1">Today</span>
              <div className="w-8" /> {/* Spacer for balance */}
            </div>
          </header>

          {/* Content */}
          <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
            {children}
          </main>

          {/* Minimal bottom nav for State 0/1 */}
          <nav className="fixed bottom-0 inset-x-0 z-50 bg-pr-surface-card/95 backdrop-blur-lg border-t border-pr-border/50 safe-area-bottom">
            <div className="max-w-md mx-auto px-6 py-3 flex items-center justify-around">
              <Link to="/today" className="flex flex-col items-center gap-1 text-orange-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" strokeWidth="2" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] font-bold">Today</span>
              </Link>
              <Link to="/earn" className="flex flex-col items-center gap-1 text-pr-text-2 hover:text-pr-text-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[10px] font-bold">Earn</span>
              </Link>
              <Link to="/wallet" className="flex flex-col items-center gap-1 text-pr-text-2 hover:text-pr-text-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" strokeWidth="2" />
                </svg>
                <span className="text-[10px] font-bold">Wallet</span>
              </Link>
              <Link to="/profile" className="flex flex-col items-center gap-1 text-pr-text-2 hover:text-pr-text-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" strokeWidth="2" />
                  <path d="M5.5 21a8.38 8.38 0 0 1 13 0" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] font-bold">Profile</span>
              </Link>
            </div>
          </nav>
        </div>
      </ProtectedRoute>
    );
  }

  // State 2+: Full layout with sidebar
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

function ProfileRedirect() {
  const { user } = useAuth();

  const deriveSlug = () => {
    if (!user) return undefined;

    // TODO: We need a reliable way to get the profile slug.
    // For now, let's try to infer it from the user metadata if available,
    // or fallback to the user ID (which the profile page should hopefully handle relative to "me").
    // ideally the user object has a username or slug field.
    return (user as any).user_metadata?.username || (user as any).username || user.id;
  };

  const slug = deriveSlug();

  if (slug) {
    return <Navigate to={`/profile/${slug}`} replace />;
  }

  // Fallback if we can't determine slug (maybe redirect to settings/profile-setup?)
  return <Navigate to="/settings" replace />;
}

/**
 * Smart Dashboard Redirect
 * 
 * NEW BEHAVIOR (per product directive):
 * - State 0 (FIRST_TIME): Go to /start (Entry Hub) - one-time onboarding
 * - State 1+ (all others): Go to /today (Daily Layer) - behavioral home
 * 
 * /today is now the default home screen for all returning users.
 */
function SmartDashboardRedirect() {
  const { maturityState, isLoading } = useMaturity();

  if (isLoading) {
    return (
      <div className="min-h-screen-dynamic flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // State 0 (brand new): Entry Hub for orientation
  if (maturityState === 0) {
    return <Navigate to="/start" replace />;
  }

  // State 1+ (all returning users): Today is the home
  return <Navigate to="/today" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MaturityProvider>
          <SessionManager />
          <ToastProvider>
            <EnhancedErrorBoundary>
              <LayoutDebugger />
              <Suspense fallback={
                <div className="min-h-screen-dynamic flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }>
                <Routes>
                  {/* Entry Surface Routes (State-Aware Experience Layer) */}
                  <Route path="/start" element={<StartPage />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/events-entry" element={<EventsEntryPage />} />
                  <Route path="/post" element={<PostProofPage />} />
                  <Route path="/contribute" element={<ContributePage />} />
                  <Route path="/e/:eventCode" element={<EventDetail />} />

                  {/* Public Marketing Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/operator/dashboard" element={<OperatorDashboard />} />
                  <Route path="/operator/hubs/:slug/manage" element={<ProtectedLayout><OperatorHubManager /></ProtectedLayout>} />
                  <Route path="/club/:slug" element={<SeasonHubPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="kyc" element={<AdminKYC />} />
                    <Route path="support" element={<AdminSupport />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="sitemap" element={<AdminSiteMap />} />
                  </Route>

                  <Route path="/support" element={<SupportPage />} />

                  <Route path="/creators" element={<ForCreators />} />
                  <Route path="/investors" element={<ForInvestors />} />
                  <Route path="/merchants" element={<ForMerchants />} />
                  <Route path="/brands" element={<ForAdvertisers />} />
                  <Route path="/advertisers" element={<ForAdvertisers />} /> {/* Alias */}
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/shoppers" element={<ForShoppers />} />
                  <Route path="/for-operators" element={<ForOperators />} />
                  <Route path="/promo-points" element={<PromoPointsPage />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/advertiser-pricing" element={<AdvertiserPricingPage />} />

                  {/* Niche Marketing Pages */}
                  <Route path="/for-tourism" element={<ForTourism />} />
                  <Route path="/for-restaurants" element={<ForRestaurants />} />
                  <Route path="/growth-partners" element={<MatrixPage />} />
                  <Route path="/for-universities" element={<ForUniversities />} />
                  <Route path="/for-ecommerce" element={<ForEcommerce />} />
                  <Route path="/for-events" element={<ForEvents />} />
                  <Route path="/for-enterprise" element={<ForEnterprise />} />

                  {/* Feature Marketing Pages */}
                  <Route path="/content-shares" element={<ContentSharesPage />} />
                  <Route path="/forecasts" element={<ForecastsPage />} />
                  <Route path="/about/growth-hub" element={<GrowthHubMarketingPage />} />

                  {/* New Feature Marketing Pages */}
                  <Route path="/referral-program" element={<ReferralProgramPage />} />
                  <Route path="/drops" element={<DropsPage />} />
                  <Route path="/drops-for-advertisers" element={<DropsForAdvertisersPage />} />
                  <Route path="/content-ecosystem" element={<ContentEcosystemPage />} />
                  <Route path="/relays" element={<RelaysPage />} />
                  <Route path="/coupons-for-shoppers" element={<CouponsForShoppersPage />} />
                  <Route path="/coupons-for-merchants" element={<CouponsForMerchantsPage />} />
                  <Route path="/campaigns-marketing" element={<CampaignsMarketingPage />} />
                  <Route path="/moves" element={<MovesPage />} />

                  <Route path="/growth-hub/social-shield" element={<SocialShieldPage />} />
                  <Route path="/growth-hub/staking" element={<GemsStakingPage />} />
                  <Route path="/growth-hub/auto-invest" element={<AutoInvestPage />} />
                  <Route path="/growth-hub/creator-funding" element={<CreatorFundingPage />} />
                  <Route path="/growth-hub/growth-channels" element={<GrowthChannelsPage />} />
                  <Route path="/growth-hub/economy" element={<PlatformEconomyPage />} />

                  {/* Platform Catalog - All Marketing Pages */}
                  <Route path="/catalog" element={<CatalogPage />} />

                  {/* Legacy Pages (full version) */}
                  <Route path="/home-legacy" element={<HomeLegacy />} />
                  <Route path="/explore-legacy" element={<ExploreLegacy />} />

                  {/* Public Content Pages (SEO/Sharing) */}
                  <Route path="/d/:id" element={<PublicDropPage />} />
                  <Route path="/p/:id" element={<PublicProductPage />} />
                  <Route path="/c/:id" element={<PublicContentPage />} />
                  <Route path="/f/:id" element={<PublicForecastPage />} />
                  <Route path="/explore" element={<ExplorePage />} />

                  {/* Public Coupon Pages */}
                  <Route path="/coupons" element={<ExploreCoupons />} />
                  <Route path="/coupons/:id" element={<PublicCouponDetail />} />

                  {/* Events Routes (Public listing, protected create) */}
                  {/* Now using default Layout for public event pages instead of ProtectedLayout,
                    Assuming Events and EventDetail can handle their own layout wrapping if needed,
                    OR we wrap them in a public Layout if one exists.
                    For now, passing them directly or wrapped in a simple Layout if `Layout` supports it without auth.
                    Wait, `Layout` component usually has sidebar etc which might require auth data.
                    If `Layout` crashes without user, we need a PublicLayout.
                    Based on typical usage, Layout often has user profile in header.
                    Let's check Layout compatibility later. For now, assuming Layout is protected or requires user.
                    We'll use a wrapper that doesn't enforce auth but tries to show Layout if possible, or just the page.
                    Actually, Events.tsx and EventDetail.tsx have their own full page structures (headers etc)?
                    Events.tsx has "Hero Section" and "Main Content", looks standalone-ish but imports Layout in App.tsx originally.
                    Let's wrap them in a generic div for now or verify Layout.
                    Re-reading Events.tsx: it renders a full page div "min-h-screen bg-pr-surface-2".
                    It does not seem to rely on an outlet.
                    So we can probably render it directly.
                */}
                  <Route path="/events" element={<Layout><Events /></Layout>} />
                  <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />
                  <Route path="/events/create-simple" element={<TodayLayout><CreateEventSimple /></TodayLayout>} />
                  <Route path="/events/create" element={<ProtectedLayout><CreateEvent /></ProtectedLayout>} />

                  {/* Ticket Routes */}
                  <Route path="/tickets" element={<ProtectedLayout><MyTickets /></ProtectedLayout>} />
                  <Route path="/tickets/:id" element={<ProtectedLayout><TicketDetail /></ProtectedLayout>} />

                  {/* My Coupons Route */}
                  <Route path="/my-coupons" element={<ProtectedLayout><MyCoupons /></ProtectedLayout>} />

                  {/* Workforce Routes */}
                  <Route path="/workforce" element={<ProtectedLayout><WorkforceDashboard /></ProtectedLayout>} />
                  <Route path="/workforce/pod/:id" element={<ProtectedLayout><WorkforcePodDetail /></ProtectedLayout>} />

                  {/* Team Invitation Route (public but may prompt login) */}
                  <Route path="/invite/:token" element={<AcceptInvitation />} />

                  {/* Auth Routes */}
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/password-reset" element={<PasswordResetPage />} />
                  <Route path="/oauth/callback" element={<OAuthCallback />} />

                  {/* Onboarding - Protected */}
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />

                  {/* New Feed Route */}
                  <Route
                    path="/feed"
                    element={
                      <ProtectedLayout>
                        <Feed />
                      </ProtectedLayout>
                    }
                  />

                  {/* TODAY SCREEN - Daily Layer Entry Point */}
                  <Route
                    path="/today"
                    element={
                      <TodayLayout>
                        <Today />
                      </TodayLayout>
                    }
                  />
                  <Route
                    path="/today/opportunity"
                    element={
                      <TodayLayout>
                        <TodayOpportunity />
                      </TodayLayout>
                    }
                  />
                  <Route
                    path="/access-rank"
                    element={
                      <TodayLayout>
                        <AccessRankPage />
                      </TodayLayout>
                    }
                  />

                  {/* Protected Dashboard Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedLayout>
                        <HomeFeedPage />
                      </ProtectedLayout>
                    }
                  />
                  {/* Smart redirect based on maturity state - early users go to /start, advanced to /dashboard */}
                  <Route path="/home" element={<ProtectedRoute><SmartDashboardRedirect /></ProtectedRoute>} />

                  <Route
                    path="/earn"
                    element={
                      <TodayLayout>
                        <EarnPage />
                      </TodayLayout>
                    }
                  />
                  <Route
                    path="/earn/:id"
                    element={
                      <ProtectedLayout>
                        <TaskDetailPage />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/task/:id"
                    element={
                      <ProtectedLayout>
                        <TaskDetailPage />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/drops/create"
                    element={
                      <ProtectedLayout>
                        <CreateDrop />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/drops/manage"
                    element={
                      <ProtectedLayout>
                        <ManageDrops />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/create"
                    element={
                      <ProtectedLayout>
                        <CreatePage />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/invest"
                    element={
                      <ProtectedLayout>
                        <InvestPage />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/market"
                    element={
                      <ProtectedLayout>
                        <ContentSharesMarket />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/market/:category"
                    element={
                      <ProtectedLayout>
                        <ContentSharesMarket />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/shares/:id"
                    element={
                      <ProtectedLayout>
                        <ShareDetail />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/wallet"
                    element={
                      <TodayLayout>
                        <WalletPage />
                      </TodayLayout>
                    }
                  />
                  <Route
                    path="/growth-hub"
                    element={
                      <ProtectedLayout>
                        <GrowthHubPage />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/rewards"
                    element={
                      <ProtectedLayout>
                        <Rewards />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/referrals"
                    element={
                      <ProtectedLayout>
                        <ReferralDashboard />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedLayout>
                        <Settings />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/leaderboard"
                    element={
                      <ProtectedLayout>
                        <LeaderboardPage />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/promoshare"
                    element={
                      <ProtectedLayout>
                        <PromoShareDashboard />
                      </ProtectedLayout>
                    }
                  />

                  {/* Profile Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedLayout>
                        <ProfileRedirect />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/profile/:slug"
                    element={
                      <TodayLayout>
                        <ProfilePage />
                      </TodayLayout>
                    }
                  />
                  <Route
                    path="/users/:slug"
                    element={
                      <ProtectedLayout>
                        <ProfilePage isPublicProfile={true} />
                      </ProtectedLayout>
                    }
                  />
                  {/* Legacy/Other Profile Route - keeping for safety */}
                  <Route
                    path="/user-profile"
                    element={
                      <ProtectedLayout>
                        <UserProfile />
                      </ProtectedLayout>
                    }
                  />


                  {/* Content & Holding Details */}
                  <Route
                    path="/content/:id"
                    element={
                      <ProtectedLayout>
                        <ContentDetailPage />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/holding/:id"
                    element={
                      <ProtectedLayout>
                        <HoldingDetailPage />
                      </ProtectedLayout>
                    }
                  />
                  {/* Prediction Markets */}
                  <Route
                    path="/prediction/:id"
                    element={
                      <ProtectedLayout>
                        <PredictionDetailPage />
                      </ProtectedLayout>
                    }
                  />

                  {/* Marketplace & Ecommerce - accessible to all, layout adapts to auth status */}
                  <Route
                    path="/marketplace"
                    element={
                      <Layout>
                        <MarketplaceBrowse />
                      </Layout>
                    }
                  />
                  <Route
                    path="/marketplace/product/:id"
                    element={
                      <Layout>
                        <ProductDetail />
                      </Layout>
                    }
                  />
                  <Route
                    path="/product/:id"
                    element={
                      <Layout>
                        <ProductDetail />
                      </Layout>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedLayout>
                        <ShoppingCart />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedLayout>
                        <Checkout />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedLayout>
                        <Orders />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/store/:storeId"
                    element={
                      <ProtectedLayout>
                        <StorePage />
                      </ProtectedLayout>
                    }
                  />


                  {/* Merchant/Advertiser Routes */}
                  <Route
                    path="/merchant/dashboard"
                    element={
                      <ProtectedLayout>
                        <MerchantDashboard />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/merchant/validate-coupon"
                    element={
                      <ProtectedLayout>
                        <ValidateCoupon />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/venue-qr"
                    element={
                      <ProtectedLayout>
                        <VenueQRManager />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/products/new"
                    element={
                      <ProtectedLayout>
                        <ProductForm />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    element={
                      <ProtectedLayout>
                        <ProductForm />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/merchant/settings/team"
                    element={
                      <ProtectedLayout>
                        <MerchantTeamSettings />
                      </ProtectedLayout>
                    }
                  />

                  {/* Advertiser Specifics */}
                  <Route path="/advertiser/onboarding" element={<AdvertiserOnboarding />} />
                  <Route
                    path="/advertiser/sampling/create"
                    element={
                      <ProtectedRoute>
                        <SamplingCreateWizard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/advertiser"
                    element={
                      <ProtectedRoute>
                        <AdvertiserLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdvertiserDashboard />} />
                    <Route path="campaigns" element={<CampaignsPage basePath="/advertiser/campaigns" />} />
                    <Route path="campaigns/new" element={<NewCampaign />} />
                    <Route path="campaigns/:id" element={<CampaignDetail />} />
                    <Route path="campaigns/:id/edit" element={<EditCampaign />} />
                    <Route path="coupons" element={<AdvertiserCoupons />} />
                    <Route path="coupons/bulk" element={<BulkCouponCreation />} />
                    <Route path="coupons/:id" element={<CouponDetail />} />
                    <Route path="coupons/:id/analytics" element={<CouponAnalytics />} />
                    <Route path="settings/team" element={<AdvertiserTeamSettings />} />
                  </Route>

                  {/* Operator/Admin */}
                  <Route
                    path="/operator/dashboard"
                    element={
                      <ProtectedLayout>
                        <OperatorDashboard />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/operator/forecasts"
                    element={
                      <ProtectedLayout>
                        <AdminForecasts />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/season-hub"
                    element={
                      <ProtectedLayout>
                        <SeasonHubPage />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/sounds"
                    element={
                      <ProtectedLayout>
                        <SoundDiscovery />
                      </ProtectedLayout>
                    }
                  />

                  <Route
                    path="/sounds/:id"
                    element={
                      <ProtectedLayout>
                        <SoundDetail />
                      </ProtectedLayout>
                    }
                  />

                  {/* Activity Feed Standalone? */}
                  <Route
                    path="/activity"
                    element={
                      <ProtectedLayout>
                        <ActivityFeed />
                      </ProtectedLayout>
                    }
                  />

                  {/* Matrix MLM Dashboard - requires $50+ subscription */}
                  <Route
                    path="/matrix"
                    element={
                      <ProtectedLayout>
                        <MatrixDashboard />
                      </ProtectedLayout>
                    }
                  />

                  {/* Test/Debug */}
                  <Route path="/test-content/:id" element={<TestContentDetailsPage />} />


                  {/* Proposal Routes */}
                  <Route path="/flashcreate/proposal/dryvamobility" element={<DryvaMobilityPage />} />

                  {/* 404 */}
                  <Route path="/blog" element={<BlogHub />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </EnhancedErrorBoundary>
            <MaturityStateController />
          </ToastProvider>
        </MaturityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
