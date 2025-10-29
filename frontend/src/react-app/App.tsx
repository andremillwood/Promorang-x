import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useNavigate } from 'react-router';
import { useState, useEffect, createContext, useContext } from 'react';
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

// Debug logging
console.log("🚀 App.tsx: Starting to load...");

// Authentication Context
interface AuthContextType {
  user: any;
  isPending: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string, display_name?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  logout: () => Promise<{ error: string | null }>;
  demoLogin: {
    creator: () => Promise<{ error: string | null }>;
    investor: () => Promise<{ error: string | null }>;
    advertiser: () => Promise<{ error: string | null }>;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isPending, setIsPending] = useState<boolean>(() => !!localStorage.getItem('authToken'));
  const [user, setUser] = useState<any>(null);

  // Initialize auth state from localStorage on first render
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');

      if (storedToken) {
        setIsPending(true);
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            console.log('Valid token found, restoring user state');
            // Restore user state from token payload
            setUser(payload.user || payload);
            setToken(storedToken);
          } else {
            console.log('Token expired, clearing');
            localStorage.removeItem('authToken');
            setToken(null);
          }
        } catch (error) {
          console.log('Invalid token, clearing');
          localStorage.removeItem('authToken');
          setToken(null);
        } finally {
          setIsPending(false);
        }
      } else {
        console.log("No auth token found, user needs to log in");
        setIsPending(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsPending(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        navigate('/home');
        return { error: null };
      } else {
        return { error: data.error };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Sign in failed' };
    } finally {
      setIsPending(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, display_name?: string) => {
    setIsPending(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, username, display_name })
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        navigate('/home');
        return { error: null };
      } else {
        return { error: data.error };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Sign up failed' };
    } finally {
      setIsPending(false);
    }
  };

  const signOut = async () => {
    setIsPending(true);
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      navigate('/', { replace: true });
      setIsPending(false);
    }
    return { error: null };
  };

  const logout = async () => {
    return await signOut();
  };

  const demoLogin = {
    creator: async () => {
      setIsPending(true);
      try {
        const response = await fetch('/api/auth/demo/creator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('authToken', data.token);
          navigate('/home');
          return { error: null };
        } else {
          return { error: data.error };
        }
      } catch (error) {
        console.error('Demo login error:', error);
        return { error: 'Demo login failed' };
      } finally {
        setIsPending(false);
      }
    },

    investor: async () => {
      setIsPending(true);
      try {
        const response = await fetch('/api/auth/demo/investor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('authToken', data.token);
          navigate('/home');
          return { error: null };
        } else {
          return { error: data.error };
        }
      } catch (error) {
        console.error('Demo login error:', error);
        return { error: 'Demo login failed' };
      } finally {
        setIsPending(false);
      }
    },

    advertiser: async () => {
      setIsPending(true);
      try {
        const response = await fetch('/api/auth/demo/advertiser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('authToken', data.token);
          navigate('/home');
          return { error: null };
        } else {
          return { error: data.error };
        }
      } catch (error) {
        console.error('Demo login error:', error);
        return { error: 'Demo login failed' };
      } finally {
        setIsPending(false);
      }
    }
  };

  const value = {
    user,
    isPending,
    signIn,
    signUp,
    signOut,
    logout,
    demoLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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

  // Debug logging for authentication state
  console.log('🔒 ProtectedRoute - User:', user);
  console.log('🔒 ProtectedRoute - IsPending:', isPending);
  console.log('🔒 ProtectedRoute - Token:', localStorage.getItem('authToken'));

  if (!user) {
    console.log('🔒 ProtectedRoute - No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('🔒 ProtectedRoute - User authenticated, rendering protected content');
  return <Layout>{children}</Layout>;
}

// Public route wrapper for marketing/landing pages (no internal navigation)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isPending } = useAuth();

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

  // Marketing page should be completely standalone - no Layout wrapper
  return <>{children}</>;
}

export default function App() {
  console.log("🎯 App.tsx: App component starting to render...");

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
            <Route path="/auth" element={<AuthPage />} />
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
            <Route path="/portfolio/holdings/:id" element={<ProtectedRoute><HoldingDetailPage /></ProtectedRoute>} />
            <Route path="/predictions/:id" element={<ProtectedRoute><PredictionDetailPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/advertiser" element={<ProtectedRoute><AdvertiserDashboard /></ProtectedRoute>} />
            <Route path="/advertiser/campaigns" element={<ProtectedRoute><AdvertiserDashboard /></ProtectedRoute>} />
            <Route path="/advertiser/campaigns/new" element={<ProtectedRoute><NewCampaign /></ProtectedRoute>} />
            <Route path="/advertiser/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
            <Route path="/campaigns/new" element={<ProtectedRoute><NewCampaign /></ProtectedRoute>} />
            <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
            <Route path="/advertiser/onboarding" element={<ProtectedRoute><AdvertiserOnboarding /></ProtectedRoute>} />

            {/* Redirect old routes */}
            <Route path="/dashboard" element={<Navigate to="/invest" replace />} />
            <Route path="/marketplace" element={<Navigate to="/earn" replace />} />
            <Route path="/main" element={<Navigate to="/home" replace />} />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
