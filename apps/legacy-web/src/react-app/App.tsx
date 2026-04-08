import { Suspense } from "react";
import type { ReactNode } from "react";
import { BrowserRouter as Router, Routes as OriginalRoutes, Route as OriginalRoute, Navigate as OriginalNavigate, useLocation, Link } from "react-router-dom";
import { User as UserIcon, ShieldCheck, Globe, Plus } from 'lucide-react';

const Routes = OriginalRoutes as any;
const Route = OriginalRoute as any;
const Navigate = OriginalNavigate as any;

import Layout from "@/react-app/components/Layout";
import EnhancedErrorBoundary from "@/react-app/components/common/EnhancedErrorBoundary";
import LayoutDebugger from "@/react-app/components/LayoutDebugger";
import HomePage from "@/react-app/pages/Home";
import AuthPage from "@/react-app/pages/AuthPage";
import CreatePage from "@/react-app/pages/Create";

import { ProfilePage } from "@/react-app/pages/Profile";
import { ContentDetailPage } from "@/react-app/pages/ContentDetail";
import TaskDetailPage from "@/react-app/pages/TaskDetail";
import AdvertiserDashboard from "@/react-app/pages/AdvertiserDashboard";
import Onboarding from "@/react-app/pages/Onboarding";
import AcceptInvitation from "@/react-app/pages/AcceptInvitation";
import MomentManager from "@/react-app/pages/MomentManager";

import ReferralDashboard from "@/react-app/pages/ReferralDashboard";
import Settings from "@/react-app/pages/Settings";
import OperatorDashboard from "@/react-app/pages/OperatorDashboard";
import AdminLayout from "@/react-app/layouts/AdminLayout";
import AdminDashboard from "@/react-app/pages/admin/AdminDashboard";
import AdminKYC from "@/react-app/pages/admin/AdminKYC";
import AdminSupport from "@/react-app/pages/admin/AdminSupport";
import AdminProofDashboard from "@/react-app/pages/admin/AdminProofDashboard";
import AdminWithdrawals from "@/react-app/pages/admin/AdminWithdrawals";
import AdminSettings from "@/react-app/pages/admin/AdminSettings";
import AdminSiteMap from "@/react-app/pages/admin/AdminSiteMap";
import SupportPage from "@/react-app/pages/Support";
import SeasonHubPage from "@/react-app/pages/SeasonHubPage";
import ProductForm from "@/react-app/pages/ProductForm";
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
import AdvertiserTeamSettings from "@/react-app/pages/AdvertiserTeamSettings";
import MerchantTeamSettings from "@/react-app/pages/MerchantTeamSettings";
import Today from "@/react-app/pages/Today";
import MomentEntryPage from "@/react-app/pages/MomentEntryPage";
import MyCanon from "@/react-app/pages/MyCanon";
import TodayOpportunity from "@/react-app/pages/TodayOpportunity";
import MomentsView from "@/react-app/pages/MomentsView";
import WalletPage from "@/react-app/pages/Wallet";
import LastNight from "@/react-app/pages/LastNight";
import CreateMoment from "@/react-app/pages/CreateMoment";


import MerchantValidate from "@/react-app/pages/MerchantValidate";
import ScanPage from "@/react-app/pages/Scan"; // New Intentional Entry

import { PostProofPage, StartPage } from "@/react-app/pages/entry";
// Maturity Infrastructure
import { MaturityProvider } from "@/react-app/context/MaturityContext";
import { DevSandboxHub } from "@/react-app/components/MaturityStateController";

// Restored Marketing & Legal Pages
import ForCreators from "@/react-app/pages/marketing/ForCreators";
import ForAdvertisers from "@/react-app/pages/marketing/ForAdvertisers";
import About from "@/react-app/pages/marketing/About";
import Contact from "@/react-app/pages/marketing/Contact";
import Privacy from "@/react-app/pages/legal/Privacy";
import Terms from "@/react-app/pages/legal/Terms";
import CredibilityPage from "@/react-app/pages/marketing/CredibilityPage";
import WorkforceDashboard from "@/react-app/pages/WorkforceDashboard";
import WorkforcePodDetail from "@/react-app/pages/WorkforcePodDetail";
import HowItWorks from "@/react-app/pages/marketing/HowItWorks";
import PricingPage from "@/react-app/pages/marketing/PricingPage";
import AdvertiserPricingPage from "@/react-app/pages/marketing/AdvertiserPricingPage";
import SuccessStandard from "@/react-app/pages/marketing/SuccessStandard";
import ReferralProgramPage from "@/react-app/pages/marketing/ReferralProgramPage";
import PublicDropPage from "@/react-app/pages/public/PublicDropPage";
import PublicProductPage from "@/react-app/pages/public/PublicProductPage";
import PublicContentPage from "@/react-app/pages/public/PublicContentPage";
import PublicActivationOutcome from "@/react-app/pages/public/PublicActivationOutcome";
import DryvaMobilityPage from "@/react-app/pages/proposals/dryvamobility/DryvaMobilityPage";


// Events Pages
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
/**
 * TodayLayout - Professional Terminal Layout
 * 
 * Consistent industrial layout for all users within the Rail Protocol.
 */
const TodayLayout = ({ children, title }: { children: ReactNode; title?: string }) => {
  const location = useLocation();
  return (
    <ProtectedRoute>
      <div className="min-h-screen-dynamic bg-[#08060a]">
        {/* Minimal Airbnb-style header */}
        <header className="sticky top-0 z-40 bg-[#08060a]/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] leading-none mb-0.5">{title || 'Home'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] leading-none">Presence Live</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto pb-32">
          {children}
        </main>

        {/* Minimal Bottom Nav */}
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#0c0a0f]/90 backdrop-blur-2xl safe-area-bottom border-t border-white/5">
          <div className="max-w-md mx-auto px-6 py-5 flex items-center justify-around">
            <Link to="/today" className={`flex flex-col items-center gap-1.5 transition-all ${location.pathname === '/today' ? 'text-amber-500 scale-110' : 'text-white/30 hover:text-white/50'}`}>
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">Journal</span>
            </Link>
            <Link to="/moments" className={`flex flex-col items-center gap-1.5 transition-all ${location.pathname === '/moments' ? 'text-amber-500 scale-110' : 'text-white/30 hover:text-white/50'}`}>
              <Globe className="w-5 h-5" />
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">Around Me</span>
            </Link>
            <Link to="/moments/create" className={`flex flex-col items-center gap-1.5 transition-all ${location.pathname.startsWith('/moments/create') || location.pathname.includes('manage') ? 'text-amber-500 scale-110' : 'text-white/30 hover:text-white/50'}`}>
              <Plus className="w-5 h-5" />
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">Host</span>
            </Link>
            <Link to="/profile" className={`flex flex-col items-center gap-1.5 transition-all ${location.pathname.startsWith('/profile') || location.pathname === '/recognition' || location.pathname === '/canon' ? 'text-amber-500 scale-110' : 'text-white/30 hover:text-white/50'}`}>
              <UserIcon className="w-5 h-5" />
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">Story</span>
            </Link>
          </div>
        </nav>
      </div>
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
 * - State 0 (FIRST_TIME): Go to /onboarding - persona-specific onboarding flows
 * - State 1+ (all others): Go to /today (Daily Layer) - behavioral home
 * 
 * /today is now the default home screen for all returning users.
 */
function SmartDashboardRedirect() {
  const { user } = useAuth();

  // State 0 (New/Unonboarded) -> Onboarding
  if (user && !user.onboarding_completed && user.user_type !== 'operator' && user.user_type !== 'admin') {
    return <Navigate to="/onboarding" replace />;
  }

  // Operators/Admins -> Control Center (Internal tools usually separate)
  if (user?.user_type === 'operator' || user?.user_type === 'admin') {
    return <Navigate to="/operator/dashboard" replace />;
  }

  // ALL other users (Patron, Brand, Host, Merchant) -> Unified Journal Home
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
                  {/* 
                    Entry Surface Routes - Disabled general discovery.
                    Users must arrive via campaign context.
                  */}
                  <Route path="/start" element={<StartPage />} />
                  <Route path="/deals" element={<Navigate to="/auth" replace />} />
                  <Route path="/events-entry" element={<Navigate to="/auth" replace />} />
                  <Route path="/scan" element={<ProtectedLayout><ScanPage /></ProtectedLayout>} />
                  <Route path="/post" element={<PostProofPage />} />
                  <Route path="/contribute" element={<Navigate to="/auth" replace />} />
                  <Route path="/bounty-hunt" element={<Navigate to="/auth" replace />} />
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
                    <Route path="proofs" element={<AdminProofDashboard />} />
                    <Route path="withdrawals" element={<AdminWithdrawals />} />
                    <Route path="support" element={<AdminSupport />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="sitemap" element={<AdminSiteMap />} />
                  </Route>

                  <Route path="/support" element={<SupportPage />} />

                  <Route path="/creators" element={<ForCreators />} />

                  <Route path="/brands" element={<ForAdvertisers />} />
                  <Route path="/advertisers" element={<ForAdvertisers />} /> {/* Alias */}
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/credibility" element={<CredibilityPage />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/advertiser-pricing" element={<AdvertiserPricingPage />} />

                  <Route path="/protocol" element={<SuccessStandard />} />
                  <Route path="/referral-program" element={<ReferralProgramPage />} />
                  {/* Public Content Pages (SEO/Sharing) */}
                  {/* Discovery / General Outcomes Hidden */}
                  <Route path="/d/:id" element={<PublicDropPage />} />
                  <Route path="/p/:id" element={<PublicProductPage />} />
                  <Route path="/c/:id" element={<PublicContentPage />} />
                  <Route path="/explore" element={<Navigate to="/today" replace />} />
                  <Route path="/o/:id" element={<PublicActivationOutcome />} />

                  {/* Public Coupon Pages Hidden */}
                  <Route path="/coupons" element={<Navigate to="/today" replace />} />
                  <Route path="/coupons/:id" element={<Navigate to="/today" replace />} />

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
                  <Route path="/events" element={<Navigate to="/moments" replace />} />
                  <Route path="/events/:id" element={<Navigate to="/moments/:id" replace />} />
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

                  {/* Social Feed Hidden */}
                  <Route
                    path="/feed"
                    element={<Navigate to="/today" replace />}
                  />

                  {/* TODAY SCREEN - Journal of Presence experience */}
                  <Route
                    path="/today"
                    element={
                      <TodayLayout>
                        <Today />
                      </TodayLayout>
                    }
                  />
                  {/* Legacy Today Removed */}
                  <Route
                    path="/today/opportunity"
                    element={
                      <TodayLayout>
                        <TodayOpportunity />
                      </TodayLayout>
                    }
                  />
                  {/* LAST NIGHT - Yesterday's finalized outcomes */}
                  <Route
                    path="/last-night"
                    element={
                      <TodayLayout>
                        <LastNight />
                      </TodayLayout>
                    }
                  />
                  <Route
                    path="/moments"
                    element={
                      <TodayLayout title="Find an Invitation">
                        <MomentsView />
                      </TodayLayout>
                    }
                  />
                  <Route
                    path="/moments/:id"
                    element={
                      <TodayLayout title="Invitation Details">
                        <MomentEntryPage />
                      </TodayLayout>
                    }
                  />
                  <Route
                    path="/canon"
                    element={
                      <TodayLayout>
                        <MyCanon />
                      </TodayLayout>
                    }
                  />
                  <Route
                    path="/recognition"
                    element={
                      <TodayLayout title="My Recognition">
                        <WalletPage />
                      </TodayLayout>
                    }
                  />
                  <Route path="/wallet" element={<Navigate to="/recognition" replace />} />
                  <Route path="/ledger" element={<Navigate to="/canon" replace />} />
                  {/* FIRST QUEST - Simplified Onboarding for State 0 Users */}


                  <Route
                    path="/access-rank"
                    element={
                      <TodayLayout>
                        <AccessRankPage />
                      </TodayLayout>
                    }
                  />

                  {/* Home Feed Hidden */}
                  <Route
                    path="/dashboard"
                    element={<Navigate to="/today" replace />}
                  />
                  {/* Smart redirect based on maturity state - early users go to /start, advanced to /dashboard */}
                  <Route path="/home" element={<ProtectedRoute><SmartDashboardRedirect /></ProtectedRoute>} />

                  {/* Task detail preserved for active campaigns */}
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
                    path="/moments/:id/manage"
                    element={
                      <ProtectedLayout>
                        <MomentManager />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/moments/create"
                    element={
                      <ProtectedLayout>
                        <CreateMoment />
                      </ProtectedLayout>
                    }
                  />



                  {/* <Route
                    path="/growth-hub"
                    element={
                      <ProtectedLayout>
                        <GrowthHubPage />
                      </ProtectedLayout>
                    }
                  /> */}

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

                  {/* <Route
                    path="/promoshare"
                    element={
                      <ProtectedLayout>
                        <PromoShareDashboard />
                      </ProtectedLayout>
                    }
                  /> */}

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
                  {/* <Route
                    path="/holding/:id"
                    element={
                      <ProtectedLayout>
                        <HoldingDetailPage />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/prediction/:id"
                    element={
                      <ProtectedLayout>
                        <PredictionDetailPage />
                      </ProtectedLayout>
                    }
                  /> */}

                  {/* Marketplace & Ecommerce - accessible to all, layout adapts to auth status */}
                  {/* Marketplace / Ecommerce Hidden */}
                  <Route
                    path="/marketplace"
                    element={<Navigate to="/today" replace />}
                  />




                  {/* Merchant/Advertiser Routes */}
                  <Route
                    path="/advertiser/dashboard"
                    element={
                      <ProtectedLayout>
                        <AdvertiserDashboard />
                      </ProtectedLayout>
                    }
                  />
                  <Route path="/advertiser" element={<Navigate to="/advertiser/dashboard" replace />} />
                  <Route
                    path="/advertiser/settings/team"
                    element={
                      <ProtectedLayout>
                        <AdvertiserTeamSettings />
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
                    path="/merchant/validate"
                    element={
                      <ProtectedLayout>
                        <MerchantValidate />
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
                  <Route // Removed AdvertiserLayout reference
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



                  {/* Operator/Admin */}
                  <Route
                    path="/operator/dashboard"
                    element={
                      <ProtectedLayout>
                        <OperatorDashboard />
                      </ProtectedLayout>
                    }
                  />
                  <Route path="/operator" element={<Navigate to="/operator/dashboard" replace />} />
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

                  {/* Activity Feed Hidden */}
                  <Route
                    path="/activity"
                    element={<Navigate to="/today" replace />}
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
            <DevSandboxHub />
          </ToastProvider>
        </MaturityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
