import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useNavigate } from 'react-router';
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import HomeFeedPage from "@/react-app/pages/HomeFeed";
import EarnPage from "@/react-app/pages/Earn";
import CreatePage from "@/react-app/pages/Create";
import InvestPage from "@/react-app/pages/Invest";
import WalletPage from "@/react-app/pages/Wallet";
import GrowthHubPage from "@/react-app/pages/GrowthHub";
import ProfilePage from "@/react-app/pages/Profile";
import ContentDetailPage from "@/react-app/pages/ContentDetail";
import TaskDetailPage from "@/react-app/pages/TaskDetail";
import LeaderboardPage from "@/react-app/pages/Leaderboard";
import AdvertiserDashboard from "@/react-app/pages/AdvertiserDashboard";
import AdvertiserOnboarding from "@/react-app/pages/AdvertiserOnboarding";
import ErrorPage from "@/react-app/pages/ErrorPage";
import Layout from "@/react-app/components/Layout";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";

// Debug logging
console.log("🚀 App.tsx: Starting to load...");

// Mock auth for development
const mockUser = {
  id: 'dev-user',
  email: 'dev@example.com',
  google_user_data: {
    given_name: 'Demo',
    family_name: 'User',
    email: 'dev@example.com',
    picture: 'https://via.placeholder.com/150',
    name: 'Demo User'
  },
  display_name: 'Demo User',
  gems_balance: 1250,
  xp_points: 15420,
  level: 12
};

console.log("✅ App.tsx: Mock user created:", mockUser);

// Simple auth hook replacement
let currentUser: typeof mockUser | null = mockUser; // Track current user state

export function useAuth() {
  const navigate = useNavigate();

  const authFunctions = {
    user: currentUser,
    isPending: false,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signInWithOAuth: async () => ({ error: null }),
    signOut: async () => {
      // Clear user session and redirect to home
      currentUser = null;
      navigate('/', { replace: true });
      return { error: null };
    },
    logout: async () => {
      // Alias for signOut for compatibility
      currentUser = null;
      navigate('/', { replace: true });
      return { error: null };
    },
    redirectToLogin: async () => {
      // In a real app, this would redirect to auth provider
      // For demo, redirect to authenticated area if user exists, else stay on landing
      if (currentUser) {
        navigate('/home');
      } else {
        // User is not authenticated, stay on landing page
        navigate('/');
      }
    },
  };

  return authFunctions;
}

// Export logout function for development testing
export const logout = async () => {
  const { logout: logoutFn } = useAuth();
  return await logoutFn();
};



// Protected route wrapper that requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useAuth();
  
  // Show loading while auth state is being determined
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

// Public route wrapper for authenticated users (redirects to /home)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useAuth();

  // Show loading while auth state is being determined
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // If user is authenticated, they can still access the landing page
    // Don't redirect to /home - let them choose
    return <Layout>{children}</Layout>;
  }

  return <>{children}</>;
}

export default function App() {
  console.log("🎯 App.tsx: App component starting to render...");

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/error" element={<ErrorPage />} />

          {/* Protected routes */}
          <Route path="/home" element={<ProtectedRoute><HomeFeedPage /></ProtectedRoute>} />
          <Route path="/earn" element={<ProtectedRoute><EarnPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
          <Route path="/invest/*" element={<ProtectedRoute><InvestPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/growth-hub" element={<ProtectedRoute><GrowthHubPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/users/:username" element={<ProtectedRoute><ProfilePage isPublicProfile={true} /></ProtectedRoute>} />
          <Route path="/users/id/:id" element={<ProtectedRoute><ProfilePage isPublicProfile={true} useUserId={true} /></ProtectedRoute>} />
          <Route path="/content/:id" element={<ProtectedRoute><ContentDetailPage /></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
          <Route path="/drops/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/advertiser" element={<ProtectedRoute><AdvertiserDashboard /></ProtectedRoute>} />
          <Route path="/advertiser/onboarding" element={<ProtectedRoute><AdvertiserOnboarding /></ProtectedRoute>} />

          {/* Redirect old routes */}
          <Route path="/dashboard" element={<Navigate to="/invest" replace />} />
          <Route path="/marketplace" element={<Navigate to="/earn" replace />} />
          <Route path="/main" element={<Navigate to="/home" replace />} />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
