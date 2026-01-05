import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { useAsyncData } from '../hooks/useAsyncData';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  TrendingUp, 
  Users, 
  Zap, 
  Target,
  ChevronRight,
  Play,
  Sparkles,
  Shield,
  Share2,
  Heart,
  Clock,
  AlertTriangle,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { useUnauthenticatedTheme } from '../hooks/useUnauthenticatedTheme';

// Components
import { Button } from '../../components/ui/button';
import { CardActionBar } from '../../components/ui/CardActionBar';
import { FeatureCard } from '../components/FeatureCard';
import { PageLoading } from '../components/PageLoading';
import { SkeletonCard, SkeletonText, Skeleton } from '../components/Skeleton';

// Types
type StatsData = {
  earners: number;
  payout: number;
  earnings: number;
  activeCampaigns: number;
  totalPayouts: number;
};

type Feature = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  payout: string;
  bgColorClass: string;
  textColorClass: string;
};

// Mock data fetch functions
const fetchStats = async (): Promise<StatsData> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    earners: 127 + Math.floor(Math.random() * 50),
    payout: 0.3 + Math.random() * 0.5,
    earnings: 12 + Math.floor(Math.random() * 10),
    activeCampaigns: 24 + Math.floor(Math.random() * 10),
    totalPayouts: 125000 + Math.floor(Math.random() * 50000)
  };
};

const fetchFeatures = async (): Promise<Feature[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: 'tasks',
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Complete Tasks",
      description: "Micro-tasks and content creation",
      payout: "$25 avg",
      bgColorClass: "bg-blue-100",
      textColorClass: "text-blue-600"
    },
    {
      id: 'invest',
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Invest in Content",
      description: "Own shares of viral content",
      payout: "12.5% ROI",
      bgColorClass: "bg-green-100",
      textColorClass: "text-green-600"
    },
    {
      id: 'predictions',
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Social Predictions",
      description: "Predict content performance",
      payout: "87% win rate",
      bgColorClass: "bg-purple-100",
      textColorClass: "text-purple-600"
    },
    {
      id: 'brands',
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: "Brand Partnerships",
      description: "Collaborate with 500+ brands",
      payout: "Fair compensation",
      bgColorClass: "bg-orange-100",
      textColorClass: "text-orange-600"
    }
  ];
};

// Error boundary component for the home page sections
const HomeSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`py-16 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

// Loading state component for the stats counter
const StatsLoading = () => (
  <div className="flex flex-wrap justify-center gap-6 my-8">
      {[1, 2, 3].map((i) => (
      <div key={i} className="bg-pr-surface-card/80 backdrop-blur-sm rounded-2xl p-6 border border-pr-border shadow-lg w-64">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    ))}
  </div>
);

// Error state component
const ErrorState = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg my-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">
          Failed to load data: {error.message}
        </p>
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={onRetry}
            className="text-sm"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const { user, signIn, signOut: logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useUnauthenticatedTheme();
  const [activeStats, setActiveStats] = useState<StatsData>({
    earners: 0,
    payout: 0,
    earnings: 0,
    activeCampaigns: 0,
    totalPayouts: 0
  });
  
  // Fetch stats data with loading and error states
  const {
    data: stats,
    loading: loadingStats,
    error: statsError,
    execute: refetchStats
  } = useAsyncData(fetchStats, null, true);
  
  // Fetch features with loading and error states
  const {
    data: features,
    loading: loadingFeatures,
    error: featuresError,
    execute: refetchFeatures
  } = useAsyncData(fetchFeatures, null, true);
  
  // Animate stats counter when data loads
  useEffect(() => {
    if (stats) {
      setActiveStats(stats);
    }
  }, [stats]);

  useEffect(() => {
    if (!stats) return;

    const interval = setInterval(() => {
      refetchStats().catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [stats, refetchStats]);
  
  // Demo login state and handlers
  const [demoLoginState, setDemoLoginState] = useState<{
    loading: string | null;
  }>({
    loading: null,
  });

  // Handle demo login with loading state
  const handleDemoLogin = useCallback(async (type: 'creator' | 'investor' | 'advertiser') => {
    try {
      setDemoLoginState({ loading: type });
      const email = `${type}@demo.com`;
      const response = await signIn(email, 'demo123');
      
      if (response.error) {
        console.error('Demo login failed:', response.error);
        // In a real app, you'd show an error toast/message here
      }
    } catch (error) {
      console.error('Demo login failed:', error);
    } finally {
      setDemoLoginState({ loading: null });
    }
  }, [signIn]);

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-background">
      {/* Modern Navigation */}
      <nav className="bg-pr-surface-card/95 backdrop-blur-md border-b border-pr-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
                alt="Promorang"
                className="h-8 w-auto transition-transform hover:scale-105"
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-pr-text-2 hover:text-pr-text-1 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-pr-text-2 hover:text-pr-text-1 font-medium transition-colors">How it Works</a>
              <a href="#success-stories" className="text-pr-text-2 hover:text-pr-text-1 font-medium transition-colors">Success Stories</a>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-lg bg-pr-surface-2 hover:bg-pr-surface-3 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-pr-text-2" />
                ) : (
                  <Sun className="w-5 h-5 text-pr-text-2" />
                )}
              </button>
              {user ? (
                // Authenticated user - show dashboard link and logout
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Go to Dashboard
                  </Button>
                  {/* Development logout button */}
                  <Button
                    onClick={() => logout()}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    title="Development logout (for testing)"
                  >
                    🚪 Logout
                  </Button>
                </div>
              ) : (
                // Unauthenticated user - show sign in options
                <>
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="ghost"
                    size="md"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Start Earning
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Demo Login Section - Only show when not authenticated */}
      {!user && (
        <div className="bg-pr-surface-1 border-b border-pr-border py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
              <span className="text-sm text-pr-text-2 font-medium">Quick Demo:</span>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  onClick={() => handleDemoLogin('creator')}
                  variant="outline"
                  size="sm"
                  className="bg-pr-surface-2 hover:bg-pr-surface-3 text-blue-300 border border-pr-surface-3"
                  isLoading={demoLoginState.loading === 'creator'}
                  loadingText="Loading..."
                >
                  Creator Demo
                </Button>
                <Button
                  onClick={() => handleDemoLogin('investor')}
                  variant="outline"
                  size="sm"
                  className="bg-pr-surface-2 hover:bg-pr-surface-3 text-purple-300 border border-pr-surface-3"
                  isLoading={demoLoginState.loading === 'investor'}
                  loadingText="Loading..."
                >
                  Investor Demo
                </Button>
                <Button
                  onClick={() => handleDemoLogin('advertiser')}
                  variant="outline"
                  size="sm"
                  className="bg-pr-surface-2 hover:bg-pr-surface-3 text-orange-300 border border-pr-surface-3"
                  isLoading={demoLoginState.loading === 'advertiser'}
                  loadingText="Loading..."
                >
                  Advertiser Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="relative bg-pr-surface-background py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-pr-surface-background" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Live Activity Badge */}
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></div>
              <span className="font-bold">{activeStats.earners.toLocaleString()}</span> early creators earning
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-pr-text-1 leading-tight mb-6">
              Monetize Your Social Influence
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Effortlessly
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-pr-text-2 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join our early community and start earning from day one. 
              <span className="font-semibold text-pr-text-1"> No followers required.</span>
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
              <div className="flex items-center bg-pr-surface-2 border border-pr-surface-3 rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="font-medium">Start in 60 seconds</span>
              </div>
              <div className="flex items-center bg-pr-surface-2 border border-pr-surface-3 rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="font-medium">Grow with social media</span>
              </div>
              <div className="flex items-center bg-pr-surface-2 border border-pr-surface-3 rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="font-medium">Zero fees</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {user ? (
                // Authenticated user - show dashboard button
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  className="group"
                >
                  Go to Dashboard
                </Button>
              ) : (
                // Unauthenticated user - show sign up button
                <Button
                  onClick={() => navigate('/auth')}
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  className="group"
                >
                  Start Earning Today
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Play className="w-5 h-5" />}
              >
                See How it Works
              </Button>
            </div>

            {/* Live Earnings Ticker */}
            <div className="bg-pr-surface-card rounded-2xl p-4 border border-pr-surface-3 shadow-lg max-w-md mx-auto">
              <div className="text-sm text-pr-text-2 mb-2">Early earnings this week:</div>
              <div className="text-2xl font-bold text-green-600">${activeStats.payout.toFixed(1)}k</div>
              <div className="text-xs text-pr-text-2">Average per early user: ${activeStats.earnings}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Business/Advertiser Section */}
      <section className="bg-pr-surface-background border-b border-pr-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold text-pr-text-1 mb-4">
                Brands & Businesses
              </h2>
              <p className="text-xl text-pr-text-2 mb-6">
                Connect with authentic creators and build campaigns that drive real engagement from day one.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-pr-text-1">Work with vetted early adopters</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-pr-text-1">Track campaign performance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-pr-text-1">Start with free sample campaigns</span>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('Start Advertising clicked');
                  if (user) {
                    navigate('/advertiser/onboarding');
                  } else {
                    navigate('/auth');
                  }
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {user ? 'Go to Advertising' : 'Start Advertising'}
              </button>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-pr-surface-card rounded-2xl p-8 shadow-lg border border-pr-surface-3">
                <h3 className="text-xl font-semibold text-pr-text-1 mb-4">Early Advertiser Benefits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pr-surface-2 rounded-lg p-4 text-center border border-pr-surface-3">
                    <div className="text-2xl font-bold text-blue-600 mb-1">Free</div>
                    <div className="text-sm text-blue-700">Sample campaigns</div>
                  </div>
                  <div className="bg-pr-surface-2 rounded-lg p-4 text-center border border-pr-surface-3">
                    <div className="text-2xl font-bold text-purple-600 mb-1">95%</div>
                    <div className="text-sm text-purple-700">Completion rate</div>
                  </div>
                  <div className="bg-pr-surface-2 rounded-lg p-4 text-center border border-pr-surface-3">
                    <div className="text-2xl font-bold text-green-600 mb-1">127</div>
                    <div className="text-sm text-green-700">Early creators</div>
                  </div>
                  <div className="bg-pr-surface-2 rounded-lg p-4 text-center border border-pr-surface-3">
                    <div className="text-2xl font-bold text-orange-600 mb-1">4.8★</div>
                    <div className="text-sm text-orange-700">Campaign rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Trust Bar */}
      <section className="bg-pr-surface-background border-b border-pr-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-pr-text-2 text-sm mb-8">Creators earn across these platforms</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {[
              { name: 'Instagram', icon: '📷', color: 'from-purple-500 to-pink-500', url: 'https://instagram.com' },
              { name: 'TikTok', icon: '🎵', color: 'from-gray-900 to-gray-700', url: 'https://tiktok.com' },
              { name: 'YouTube', icon: '📺', color: 'from-red-600 to-red-500', url: 'https://youtube.com' },
              { name: 'Twitter', icon: '🐦', color: 'from-blue-500 to-blue-400', url: 'https://twitter.com' },
              { name: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-blue-600', url: 'https://linkedin.com' },
              { name: 'Facebook', icon: '👥', color: 'from-blue-600 to-blue-500', url: 'https://facebook.com' }
            ].map((platform) => (
              <a 
                key={platform.name}
                href={platform.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group text-center hover:scale-110 transition-all duration-200"
              >
                <div className={`bg-gradient-to-tr ${platform.color} rounded-xl h-14 w-14 mx-auto flex items-center justify-center text-white font-bold text-xl group-hover:shadow-lg transition-shadow mb-2`}>
                  {platform.icon}
                </div>
                <p className="text-xs text-pr-text-2 group-hover:text-pr-text-1 transition-colors">{platform.name}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Simplified Features Section */}
      <section id="features" className="py-20 bg-pr-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-pr-text-1 mb-4">
              Four Ways to Earn
            </h2>
            <p className="text-xl text-pr-text-2 max-w-2xl mx-auto">
              Multiple income streams designed for creators, investors, and brands
            </p>
          </div>

          {loadingFeatures ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-pr-surface-card rounded-2xl p-6 shadow-sm border border-pr-border">
                  <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : featuresError ? (
            <ErrorState error={featuresError} onRetry={refetchFeatures} />
          ) : features ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  payout={feature.payout}
                  bgColorClass={feature.bgColorClass}
                  textColorClass={feature.textColorClass}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Simplified How it Works */}
      <section id="how-it-works" className="py-20 bg-pr-surface-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-pr-text-1 mb-4">
              Start Earning in 3 Steps
            </h2>
            <p className="text-xl text-pr-text-2">Simple. Fast. Profitable.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Sign Up Free",
                description: "Create your account in under 2 minutes",
                colorClass: "bg-gradient-to-r from-blue-500 to-blue-600"
              },
              {
                step: "2", 
                title: "Choose Your Path",
                description: "Select earning methods that fit your style",
                colorClass: "bg-gradient-to-r from-purple-500 to-purple-600"
              },
              {
                step: "3",
                title: "Get Paid",
                description: "Withdraw earnings instantly to your account",
                colorClass: "bg-gradient-to-r from-green-500 to-green-600"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`${step.colorClass} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg`}>
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{step.title}</h3>
                <p className="text-pr-text-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Social Proof */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12">Growing with Our Early Community</h2>
          
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3">
              <div className="text-4xl font-bold mb-2 text-yellow-300">{activeStats.earners.toLocaleString()}</div>
              <div className="text-blue-100">Early Adopters</div>
            </div>
            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3">
              <div className="text-4xl font-bold mb-2 text-green-300">${activeStats.payout.toFixed(1)}k</div>
              <div className="text-blue-100">Paid Out So Far</div>
            </div>
            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3">
              <div className="text-4xl font-bold mb-2 text-pink-300">4.8★</div>
              <div className="text-blue-100">Early User Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl font-bold mb-2 text-orange-300">${activeStats.earnings}</div>
              <div className="text-blue-100">Average Weekly Earnings</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-8 py-6 inline-block">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="font-bold text-lg">Be part of something new from the ground up</span>
            </div>
          </div>
        </div>
      </section>

      {/* Streamlined Success Stories */}
      <section id="success-stories" className="py-20 bg-pr-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-pr-text-1 mb-4">
              Real People, Real Results
            </h2>
            <p className="text-xl text-pr-text-2">Success stories from our community</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Early Creator", 
                earnings: "$247",
                timeframe: "first month",
                quote: "Made $25 on my first day with zero followers. Love being an early adopter!"
              },
              {
                name: "Mike Rodriguez", 
                role: "Beta Tester",
                earnings: "$384",
                timeframe: "2 months",
                quote: "Getting in early feels amazing. The platform has real potential."
              },
              {
                name: "Local Coffee Co.",
                role: "Early Brand Partner",
                earnings: "Great reach", 
                timeframe: "6 weeks",
                quote: "Loving the authentic engagement from real early users. Quality over quantity."
              }
            ].map((story, index) => (
              <div key={index} className="bg-pr-surface-card rounded-2xl p-8 shadow-sm border border-pr-border">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-bold text-pr-text-1">{story.name}</h4>
                    <p className="text-pr-text-2 text-sm">{story.role}</p>
                  </div>
                </div>
                
                <div className="bg-pr-surface-2 border border-green-500/60 rounded-lg p-3 mb-4">
                  <div className="text-lg font-bold text-green-300">{story.earnings}</div>
                  <div className="text-xs text-green-400">in {story.timeframe}</div>
                </div>
                
                <p className="text-pr-text-1 italic">"{story.quote}"</p>
                
                <div className="flex items-center text-yellow-500 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Your Financial Freedom Starts Now
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of creators already earning on Promorang
          </p>
          
          <button
            onClick={() => {
              console.log('Final CTA clicked');
              if (user) {
                navigate('/dashboard');
              } else {
                navigate('/auth');
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center"
          >
            {user ? 'Go to Dashboard' : 'Start Earning Today'}
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-pr-surface-card rounded-lg p-4 border border-pr-surface-3">
              <div className="font-bold text-green-300 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                100% Free to Start
              </div>
            </div>
            <div className="bg-pr-surface-card rounded-lg p-4 border border-pr-surface-3">
              <div className="font-bold text-yellow-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Grow Your Wealth
              </div>
            </div>
            <div className="bg-pr-surface-card rounded-lg p-4 border border-pr-surface-3">
              <div className="font-bold text-blue-300 flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                Secure & Trusted
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-pr-surface-2 border-t border-pr-surface-3 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
                alt="Promorang"
                className="h-8 w-auto mr-4"
              />
              <p className="text-pr-text-2 text-sm">
                Transform your influence into income
              </p>
            </div>
            <div className="flex space-x-8 text-sm text-pr-text-2">
              <a href="#" className="hover:text-pr-text-1 transition-colors">Privacy</a>
              <a href="#" className="hover:text-pr-text-1 transition-colors">Terms</a>
              <a href="#" className="hover:text-pr-text-1 transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-pr-surface-3 mt-8 pt-8 text-center text-pr-text-2 text-sm">
            <p>&copy; 2024 Promorang. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
