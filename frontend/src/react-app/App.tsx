import { Suspense } from "react";
import type { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ErrorPage from "@/react-app/pages/ErrorPage";
import LeaderboardPage from "@/react-app/pages/Leaderboard";
import Layout from "@/react-app/components/Layout";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";
import HomePage from "@/react-app/pages/Home";
import AuthPage from "@/react-app/pages/AuthPage";
import HomeFeedPage from "@/react-app/pages/HomeFeed";
import EarnPage from "@/react-app/pages/Earn";
import CreatePage from "@/react-app/pages/Create";
import InvestPage from "@/react-app/pages/Invest";
import WalletPage from "@/react-app/pages/Wallet";
import GrowthHubPage from "@/react-app/pages/GrowthHub";
import { ProfilePage } from "@/react-app/pages/Profile";
import { ContentDetailPage } from "@/react-app/pages/ContentDetail";
import HoldingDetailPage from "@/react-app/pages/HoldingDetail";
import PredictionDetailPage from "@/react-app/pages/PredictionDetail";
import TaskDetailPage from "@/react-app/pages/TaskDetail";
import AdvertiserDashboard from "@/react-app/pages/AdvertiserDashboard";
import AdvertiserOnboarding from "@/react-app/pages/AdvertiserOnboarding";
import CampaignDetail from "@/react-app/pages/CampaignDetail";
import CampaignsPage from "@/react-app/pages/Campaigns";
import NewCampaign from "@/react-app/pages/NewCampaign";
import TestContentDetailsPage from "@/react-app/pages/TestContentDetailsPage";
import NotFound from "@/react-app/pages/NotFound";
import { AuthProvider, useAuth } from '@/react-app/hooks/useAuth';
import { Routes as RoutePaths } from "@/react-app/utils/url";
import OAuthCallback from "@/react-app/pages/OAuthCallback";

// Debug logging
console.log("🚀 App.tsx: Starting to load...");

// Protected route wrapper that requires authentication
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isPending } = useAuth();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
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

  const slug =
    (user as any)?.slug ||
    user?.username ||
    (user?.email ? user.email.split('@')[0] : undefined);

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
  <div className="min-h-screen flex items-center justify-center">
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
    <Route path="/growth-hub" element={<ProtectedLayout><GrowthHubPage /></ProtectedLayout>} />
    <Route path="/profile" element={<ProtectedLayout><ProfileRedirect /></ProtectedLayout>} />
    <Route path="/profile/:username" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
    <Route path="/holding/:holdingId" element={<ProtectedLayout><HoldingDetailPage /></ProtectedLayout>} />
    <Route path="/prediction/:predictionId" element={<ProtectedLayout><PredictionDetailPage /></ProtectedLayout>} />
    <Route path="/task/:taskId" element={<ProtectedLayout><TaskDetailPage /></ProtectedLayout>} />
    <Route path="/advertiser" element={<ProtectedLayout><AdvertiserDashboard /></ProtectedLayout>} />
    <Route path="/advertiser/onboarding" element={<ProtectedLayout><AdvertiserOnboarding /></ProtectedLayout>} />
    <Route path="/advertiser/campaigns" element={<ProtectedLayout><CampaignsPage basePath="/advertiser/campaigns" /></ProtectedLayout>} />
    <Route path="/advertiser/campaigns/:campaignId" element={<ProtectedLayout><CampaignDetail /></ProtectedLayout>} />
    <Route path="/campaigns" element={<ProtectedLayout><CampaignsPage /></ProtectedLayout>} />
    <Route path="/campaigns/new" element={<ProtectedLayout><NewCampaign /></ProtectedLayout>} />
    <Route path="/campaigns/:campaignId" element={<ProtectedLayout><CampaignDetail /></ProtectedLayout>} />
    <Route path="/content/:id" element={
      <ProtectedRoute>
        <ContentDetailPage />
      </ProtectedRoute>
    } />
    <Route path="/test-content/:id" element={<TestContentDetailsPage />} />
    <Route path="/home" element={<Navigate to="/dashboard" replace />} />

    {/* Error and fallback routes */}
    <Route path="/not-found" element={<NotFound />} />
    <Route path="/error" element={<ErrorPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Router>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
            <AppRoutesComponent />
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
