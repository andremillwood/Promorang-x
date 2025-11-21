import { Suspense, useEffect } from "react";
import type { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ErrorPage from "@/react-app/pages/ErrorPage";
import LeaderboardPage from "@/react-app/pages/Leaderboard";
import Layout from "@/react-app/components/Layout";
import EnhancedErrorBoundary from "@/react-app/components/common/EnhancedErrorBoundary";
import LayoutDebugger from "@/react-app/components/LayoutDebugger";
import HomePage from "@/react-app/pages/Home";
import AuthPage from "@/react-app/pages/AuthPage";
import HomeFeedPage from "@/react-app/pages/HomeFeed";
import EarnPage from "@/react-app/pages/Earn";
import CreatePage from "@/react-app/pages/Create";
import InvestPage from "@/react-app/pages/Invest";
import WalletPage from "@/react-app/pages/Wallet";
import GrowthHubPage from "@/react-app/pages/GrowthHub";
import Profile, { ProfilePage } from "@/react-app/pages/Profile";
import { ContentDetailPage } from "@/react-app/pages/ContentDetail";
import HoldingDetailPage from "@/react-app/pages/HoldingDetail";
import PredictionDetailPage from "@/react-app/pages/PredictionDetail";
import TaskDetailPage from "@/react-app/pages/TaskDetail";
import AdvertiserDashboard from "@/react-app/pages/AdvertiserDashboard";
import AdvertiserOnboarding from "@/react-app/pages/AdvertiserOnboarding";
import AdvertiserLayout from "@/react-app/pages/AdvertiserLayout";
import AdvertiserCoupons from "@/react-app/pages/AdvertiserCoupons";
import CouponDetail from "@/react-app/pages/CouponDetail";
import BulkCouponCreation from "@/react-app/pages/BulkCouponCreation";
import CouponAnalytics from "@/react-app/pages/CouponAnalytics";
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
import SeasonHubPage from "@/react-app/pages/SeasonHubPage";
import ProductForm from "@/react-app/pages/ProductForm";
import ActivityFeed from "@/react-app/pages/ActivityFeed";
import UserProfile from "@/react-app/pages/UserProfile";
import TestContentDetailsPage from "@/react-app/pages/TestContentDetailsPage";
import NotFound from "@/react-app/pages/NotFound";
import { AuthProvider, useAuth } from '@/react-app/hooks/useAuth';
import { ToastProvider } from '@/react-app/components/ui/use-toast';
import { Routes as RoutePaths } from "@/react-app/utils/url";
import OAuthCallback from "@/react-app/pages/OAuthCallback";
import PasswordResetPage from "@/react-app/pages/PasswordResetPage";
import SessionManager from "@/react-app/components/auth/SessionManager";

// Debug logging
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

function ProfileRedirect() {
  const { user } = useAuth();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const paramsObject = Object.fromEntries(params.entries()) as Record<string, string>;

  const deriveSlug = () => {
    if (!user) return undefined;

    const candidates = [
      (user as any)?.slug,
      (user as any)?.profile_slug,
      (user as any)?.username,
      (user as any)?.user_metadata?.username,
      (user as any)?.profile?.username,
      user?.email ? user.email.split('@')[0] : undefined,
      // Supabase/Mocha user objects should always include an id we can fall back to
      user?.id ? String(user.id) : undefined,
    ];

    return candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  };

  const slug = deriveSlug();

  if (!slug) {
    console.warn('[Redirect] Missing profile slug', { userId: user?.id });
    return <Navigate to="/error" state={{ message: 'Profile unavailable' }} replace />;
  }

  console.log('[Redirect]', { userSlug: slug, from: location.pathname });

  const target = RoutePaths.profile(
    slug,
    Object.keys(paramsObject).length ? paramsObject : undefined
  );

  return <Navigate to={target} replace />;
}

// Public route wrapper for marketing/landing pages (no internal navigation)
function PublicRoute({
  children,
  redirectAuthenticated = true,
  redirectTo = '/dashboard'
}: { children: ReactNode; redirectAuthenticated?: boolean; redirectTo?: string }) {
  const { user } = useAuth();
  const location = useLocation();

  // If user is already logged in, redirect to dashboard
  if (redirectAuthenticated && user) {
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

const LoadingScreen = () => (
  <div className="min-h-screen-dynamic flex items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
  </div>
);

const AppRoutesComponent = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/auth" element={
      <PublicRoute>
        <AuthPage />
      </PublicRoute>
    } />
    <Route path="/auth/callback" element={<OAuthCallback />} />
    <Route path="/auth/v1/callback" element={<OAuthCallback />} />
    <Route path="/oauth/callback" element={<OAuthCallback />} />
    <Route path="/auth/reset-password" element={
      <PublicRoute>
        <PasswordResetPage />
      </PublicRoute>
    } />
    <Route path="/auth/update-password" element={
      <PublicRoute>
        <PasswordResetPage />
      </PublicRoute>
    } />
    {/* Legacy or marketing signup links -> redirect to /auth while preserving query params */}
    <Route path="/signup" element={<Navigate to="/auth" replace />} />
    <Route path="/" element={
      <PublicRoute redirectAuthenticated={false}>
        <HomePage />
      </PublicRoute>
    } />

    {/* Protected routes */}
    <Route path="/dashboard" element={<ProtectedLayout><HomeFeedPage /></ProtectedLayout>} />
    <Route path="/leaderboard" element={<ProtectedLayout><LeaderboardPage /></ProtectedLayout>} />
    <Route path="/earn" element={<ProtectedLayout><EarnPage /></ProtectedLayout>} />
    <Route path="/create" element={<ProtectedLayout><CreatePage /></ProtectedLayout>} />
    <Route path="/invest" element={<ProtectedLayout><InvestPage /></ProtectedLayout>} />
    <Route path="/wallet" element={<ProtectedLayout><WalletPage /></ProtectedLayout>} />
    <Route path="/rewards" element={<ProtectedLayout><Rewards /></ProtectedLayout>} />
    <Route path="/growth-hub" element={<ProtectedLayout><GrowthHubPage /></ProtectedLayout>} />
    <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
    <Route path="/profile" element={<ProtectedLayout><ProfileRedirect /></ProtectedLayout>} />
    <Route path="/profile/:username" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
    <Route path="/users/:username" element={<ProtectedLayout><Profile isPublicProfile /></ProtectedLayout>} />
    <Route path="/users/id/:id" element={<ProtectedLayout><Profile isPublicProfile useUserId /></ProtectedLayout>} />
    <Route path="/holding/:holdingId" element={<ProtectedLayout><HoldingDetailPage /></ProtectedLayout>} />
    <Route path="/portfolio/holdings/:holdingId" element={<ProtectedLayout><HoldingDetailPage /></ProtectedLayout>} />
    <Route path="/prediction/:predictionId" element={<ProtectedLayout><PredictionDetailPage /></ProtectedLayout>} />
    <Route path="/task/:taskId" element={<ProtectedLayout><TaskDetailPage /></ProtectedLayout>} />
    <Route path="/advertiser/onboarding" element={<ProtectedLayout><AdvertiserOnboarding /></ProtectedLayout>} />
    <Route path="/advertiser" element={<ProtectedRoute><AdvertiserLayout /></ProtectedRoute>}>
      <Route index element={<AdvertiserDashboard />} />
      <Route path="campaigns" element={<CampaignsPage basePath="/advertiser/campaigns" />} />
      <Route path="campaigns/:campaignId" element={<CampaignDetail />} />
      <Route path="campaigns/:campaignId/edit" element={<EditCampaign />} />
      <Route path="coupons" element={<AdvertiserCoupons />} />
      <Route path="coupons/bulk" element={<BulkCouponCreation />} />
      <Route path="coupons/analytics" element={<CouponAnalytics />} />
      <Route path="coupons/:id" element={<CouponDetail />} />
    </Route>
    <Route path="/campaigns" element={<ProtectedLayout><CampaignsPage /></ProtectedLayout>} />
    <Route path="/campaigns/new" element={<ProtectedLayout><NewCampaign /></ProtectedLayout>} />
    <Route path="/campaigns/:campaignId" element={<ProtectedLayout><CampaignDetail /></ProtectedLayout>} />
    <Route path="/campaigns/:campaignId/edit" element={<ProtectedLayout><EditCampaign /></ProtectedLayout>} />
    <Route path="/content/:id" element={
      <ProtectedRoute>
        <ContentDetailPage />
      </ProtectedRoute>
    } />
    <Route path="/test-content/:id" element={<TestContentDetailsPage />} />
    <Route path="/referrals" element={<ProtectedLayout><ReferralDashboard /></ProtectedLayout>} />
    <Route path="/marketplace" element={<ProtectedLayout><MarketplaceBrowse /></ProtectedLayout>} />
    <Route path="/marketplace/product/:productId" element={<ProtectedLayout><ProductDetail /></ProtectedLayout>} />
    <Route path="/marketplace/store/:storeSlug" element={<ProtectedLayout><StorePage /></ProtectedLayout>} />
    <Route path="/cart" element={<ProtectedLayout><ShoppingCart /></ProtectedLayout>} />
    <Route path="/checkout" element={<ProtectedLayout><Checkout /></ProtectedLayout>} />
    <Route path="/orders" element={<ProtectedLayout><Orders /></ProtectedLayout>} />
    <Route path="/merchant/dashboard" element={<ProtectedLayout><MerchantDashboard /></ProtectedLayout>} />
    <Route path="/merchant/products/new" element={<ProtectedLayout><ProductForm /></ProtectedLayout>} />
    <Route path="/merchant/products/:productId/edit" element={<ProtectedLayout><ProductForm /></ProtectedLayout>} />
    <Route path="/operator" element={<ProtectedLayout><OperatorDashboard /></ProtectedLayout>} />
    <Route path="/club/:hubSlug" element={<ProtectedLayout><SeasonHubPage /></ProtectedLayout>} />
    <Route path="/feed" element={<ProtectedLayout><ActivityFeed /></ProtectedLayout>} />
    <Route path="/profile/:username" element={<ProtectedLayout><UserProfile /></ProtectedLayout>} />
    <Route path="/home" element={<Navigate to="/dashboard" replace />} />

    {/* Error and fallback routes */}
    <Route path="/not-found" element={<NotFound />} />
    <Route path="/error" element={<ErrorPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default function App() {
  // Global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      // You can add additional error reporting here
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You can add additional error reporting here
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <EnhancedErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <SessionManager />
            <LayoutDebugger />
            <Suspense fallback={<LoadingScreen />}>
              <AppRoutesComponent />
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </EnhancedErrorBoundary>
  );
}
