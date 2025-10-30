import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router";
import ErrorPage from "@/react-app/pages/ErrorPage";
import LeaderboardPage from "@/react-app/pages/Leaderboard";
import Layout from "@/react-app/components/Layout";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";
import HomePage from "@/react-app/pages/Home";
import AuthPage from "@/react-app/pages/AuthPage";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
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
import NewCampaign from "@/react-app/pages/NewCampaign";
import TestContentDetailsPage from "@/react-app/pages/TestContentDetailsPage";
import { AuthProvider, useAuth } from '@/react-app/hooks/useAuth';

// Debug logging
console.log("🚀 App.tsx: Starting to load...");

// Protected route wrapper that requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
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

// Public route wrapper for marketing/landing pages (no internal navigation)
function PublicRoute({
  children,
  redirectAuthenticated = true,
  redirectTo = '/dashboard'
}: {
  children: React.ReactNode;
  redirectAuthenticated?: boolean;
  redirectTo?: string;
}) {
  const { user } = useAuth();
  const location = useLocation();

  // If user is already logged in, redirect to dashboard
  if (redirectAuthenticated && user) {
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            } />
            <Route path="/auth/callback" element={
              <PublicRoute>
                <AuthCallbackPage />
              </PublicRoute>
            } />
            <Route path="/" element={
              <PublicRoute redirectAuthenticated={false}>
                <HomePage />
              </PublicRoute>
            } />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><HomeFeedPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Layout><LeaderboardPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/earn" element={
              <ProtectedRoute>
                <Layout><EarnPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <Layout><CreatePage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/invest" element={
              <ProtectedRoute>
                <Layout><InvestPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Layout><WalletPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/growth-hub" element={
              <ProtectedRoute>
                <Layout><GrowthHubPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile/:username" element={
              <ProtectedRoute>
                <Layout><ProfilePage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/content/:id" element={
              <ProtectedRoute>
                <ContentDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/test-content/:id" element={
              <TestContentDetailsPage />
            } />
            <Route path="/holding/:holdingId" element={
              <ProtectedRoute>
                <Layout><HoldingDetailPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/prediction/:predictionId" element={
              <ProtectedRoute>
                <Layout><PredictionDetailPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/task/:taskId" element={
              <ProtectedRoute>
                <Layout><TaskDetailPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/advertiser" element={
              <ProtectedRoute>
                <Layout><AdvertiserDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/advertiser/onboarding" element={
              <ProtectedRoute>
                <Layout><AdvertiserOnboarding /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/campaigns/new" element={
              <ProtectedRoute>
                <Layout><NewCampaign /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/campaigns/:campaignId" element={
              <ProtectedRoute>
                <Layout><CampaignDetail /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />

            {/* Fallback route */}
            <Route path="*" element={
              <ErrorPage message="Page not found" />
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
