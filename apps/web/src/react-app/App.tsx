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
import Onboarding from "@/react-app/pages/Onboarding";
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

function ProfileRedirect() {
  const { user } = useAuth();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const paramsObject = Object.fromEntries(params.entries()) as Record<string, string>;

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

function App() {
  return (
    <Router>
      <AuthProvider>
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
                {/* Public Marketing Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/creators" element={<ForCreators />} />
                <Route path="/brands" element={<ForAdvertisers />} />
                <Route path="/advertisers" element={<ForAdvertisers />} /> {/* Alias */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/shoppers" element={<ForShoppers />} />
                <Route path="/for-operators" element={<ForOperators />} />
                <Route path="/promo-points" element={<PromoPointsPage />} />

                {/* Workforce Routes */}
                <Route path="/workforce" element={<ProtectedLayout><WorkforceDashboard /></ProtectedLayout>} />
                <Route path="/workforce/pod/:id" element={<ProtectedLayout><WorkforcePodDetail /></ProtectedLayout>} />

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

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedLayout>
                      <HomeFeedPage />
                    </ProtectedLayout>
                  }
                />
                {/* Redirect /home to /dashboard for logged in users context or keeps consistency */}
                <Route path="/home" element={<Navigate to="/dashboard" replace />} />

                <Route
                  path="/earn"
                  element={
                    <ProtectedLayout>
                      <EarnPage />
                    </ProtectedLayout>
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
                  path="/wallet"
                  element={
                    <ProtectedLayout>
                      <WalletPage />
                    </ProtectedLayout>
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
                    <ProtectedLayout>
                      <ProfilePage />
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

                {/* Marketplace & Ecommerce */}
                <Route
                  path="/marketplace"
                  element={
                    <ProtectedLayout>
                      <MarketplaceBrowse />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/product/:id" // Or /marketplace/product/:id
                  element={
                    <ProtectedLayout>
                      <ProductDetail />
                    </ProtectedLayout>
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
                  path="/products/new"
                  element={
                    <ProtectedLayout>
                      <ProductForm />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/products/edit/:id"
                  element={
                    <ProtectedLayout>
                      <ProductForm />
                    </ProtectedLayout>
                  }
                />

                {/* Advertiser Specifics */}
                <Route path="/advertiser/onboarding" element={<AdvertiserOnboarding />} />
                <Route
                  path="/advertiser"
                  element={
                    <ProtectedRoute>
                      <AdvertiserLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdvertiserDashboard />} />
                  <Route path="campaigns" element={<CampaignsPage />} />
                  <Route path="campaigns/new" element={<NewCampaign />} />
                  <Route path="campaigns/:id" element={<CampaignDetail />} />
                  <Route path="campaigns/:id/edit" element={<EditCampaign />} />
                  <Route path="coupons" element={<AdvertiserCoupons />} />
                  <Route path="coupons/bulk" element={<BulkCouponCreation />} />
                  <Route path="coupons/:id" element={<CouponDetail />} />
                  <Route path="coupons/:id/analytics" element={<CouponAnalytics />} />
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
                  path="/season-hub"
                  element={
                    <ProtectedLayout>
                      <SeasonHubPage />
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

                {/* Test/Debug */}
                <Route path="/test-content/:id" element={<TestContentDetailsPage />} />


                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </EnhancedErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
