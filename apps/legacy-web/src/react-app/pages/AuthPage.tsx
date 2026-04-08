import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Gift, Sun, Moon, Shield, CheckCircle, Network, Sparkles, Store } from 'lucide-react';
import { supabase } from '@/react-app/lib/supabaseClient';
import { useUnauthenticatedTheme } from '../hooks/useUnauthenticatedTheme';

export default function AuthPage() {
  const { signIn, signUp, demoLogin, checkDemoHealth, initializeDemo, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, setTheme } = useUnauthenticatedTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<any>(null);
  const [demoStatus, setDemoStatus] = useState<{ status: string; missing?: number } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    display_name: ''
  });
  const [error, setError] = useState<string | Error | null>(null);

  // Check for referral code and demo health
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setIsSignUp(true);
      validateReferralCode(refCode);
    }

    const checkHealth = async () => {
      const health = await checkDemoHealth();
      if (health.success) {
        setDemoStatus({ status: health.status, missing: health.missing });
      }
    };
    checkHealth();
  }, [searchParams, checkDemoHealth]);

  const handleInitializeDemo = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      const result = await initializeDemo();
      if (result.success) {
        const health = await checkDemoHealth();
        if (health.success) setDemoStatus({ status: health.status, missing: health.missing });
      } else {
        setError('Failed to initialize demo environment');
      }
    } catch (err) {
      setError('Initialization error');
    } finally {
      setIsInitializing(false);
    }
  };

  const validateReferralCode = async (code: string) => {
    try {
      const response = await fetch('/api/referrals/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include',
      });
      const data = await response.json();
      if (data.status === 'success') {
        setReferrerInfo(data.data.referrer);
      } else {
        setReferralCode(null);
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
    }
  };

  const trackReferral = async (userId: string) => {
    if (!referralCode) return;

    try {
      await fetch('/api/referrals/track-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referred_user_id: userId,
          referral_code: referralCode,
        }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error tracking referral:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        if (!formData.email || !formData.password || !formData.username) {
          setError('Please fill in all required fields');
          return;
        }
        const result = await signUp(formData.email, formData.password, formData.username, formData.display_name);
        if (result.error) {
          setError(typeof result.error === 'string' ? result.error : result.error.message || 'Signup failed');
        } else if ((result as any).requiresConfirmation) {
          setError('Please check your email to confirm your account.');
        } else {
          // Track referral if code was provided
          if (referralCode && result.user?.id) {
            await trackReferral(result.user.id);
          }
          navigate('/onboarding');
        }
      } else {
        if (!formData.email || !formData.password) {
          setError('Please enter email and password');
          return;
        }
        const result = await signIn(formData.email, formData.password);
        if (result.error) {
          setError(typeof result.error === 'string' ? result.error : result.error.message || 'Login failed');
        } else {
          // Route to Today screen instead of dashboard
          navigate('/today');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    }
  };

  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);

  const handleDemoLogin = async (type: 'creator' | 'investor' | 'advertiser' | 'operator' | 'merchant' | 'matrix' | 'samplingMerchant' | 'activeSampling' | 'graduatedMerchant' | 'state0' | 'state1' | 'state2' | 'state3') => {
    setError(null);
    setLoadingDemo(type);
    try {
      const result = await demoLogin[type]();
      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : result.error.message || 'Demo login failed');
      } else {
        // State-aware redirect based on demo type
        if (type === 'matrix') {
          navigate('/matrix');
        } else if (type === 'advertiser' || type === 'merchant' || type === 'samplingMerchant' || type === 'activeSampling' || type === 'graduatedMerchant') {
          navigate('/advertiser/dashboard');
        } else if (type === 'operator') {
          navigate('/operator/dashboard');
        } else if (type === 'state0') {
          // State 0: New user - go to onboarding flow
          navigate('/onboarding');
        } else if (type === 'state1') {
          // State 1: Exploring - go to Today
          navigate('/today');
        } else if (type === 'state2' || type === 'state3') {
          // State 2/3: Engaged/Power - go to Today
          navigate('/today');
        } else {
          // Other demo types (creators, investors) - go to Today
          navigate('/today');
        }
      }
    } catch (error) {
      console.error('Demo login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login with demo account. Please try again.';
      setError(errorMessage);
    } finally {
      setLoadingDemo(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to initialize Google login');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-background flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="absolute top-4 right-4 p-2 rounded-lg bg-pr-surface-card border border-pr-border hover:bg-pr-surface-2 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-pr-text-2" />
        ) : (
          <Sun className="w-5 h-5 text-pr-text-2" />
        )}
      </button>
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <img
            src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
            alt="Promorang"
            className="h-10 sm:h-12 w-auto mx-auto mb-3 sm:mb-4"
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-pr-text-1">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-pr-text-2">
            {isSignUp
              ? 'Join thousands of professionals building a proven track record'
              : 'Sign in to your success terminal to continue'
            }
          </p>
        </div>

        {/* Social Shield Value Prop - Show on signup */}
        {isSignUp && !referralCode && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-emerald-400 text-sm mb-1">Social Shield Protection Included</h3>
                <p className="text-xs text-pr-text-2 mb-2">
                  Your earnings are protected when content underperforms. Algorithm changes? We cover the difference.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Auto-protection', 'No claims needed', 'All members'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle className="w-3 h-3" /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Referral Banner */}
        {referralCode && referrerInfo && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-3 sm:p-4 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base">You've been invited!</p>
                <p className="text-xs sm:text-sm text-white/90 truncate">
                  {referrerInfo.display_name || referrerInfo.username} invited you to join Promorang
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Demo Environment Readiness */}
        {demoStatus && demoStatus.status === 'incomplete' && !isSignUp && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-amber-500 text-sm mb-1">Demo Environment Incomplete</h3>
                <p className="text-xs text-pr-text-2">
                  Some demo accounts are missing in the current environment.
                </p>
              </div>
            </div>
            <button
              onClick={handleInitializeDemo}
              disabled={isInitializing}
              className="w-full py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isInitializing ? (
                <>
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Initializing...</span>
                </>
              ) : (
                <span>Initialize Demo Environment</span>
              )}
            </button>
          </div>
        )}

        {/* Demo Login Buttons */}
        <div className="space-y-4">
          {/* Creator Role Pool */}
          <div className="bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden">
            <div className="bg-pr-surface-2 px-4 py-2 border-b border-pr-border flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-pr-text-2 uppercase tracking-wider">Professional Track Record</h3>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse delay-150"></div>
              </div>
            </div>
            <div className="p-2 grid grid-cols-4 gap-2">
              <button
                onClick={() => handleDemoLogin('state0')}
                disabled={!!loadingDemo}
                className="flex flex-col items-center justify-center p-3 border border-pr-border rounded-xl bg-pr-surface-background hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
              >
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <User className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">Level 0 (New)</span>
                {loadingDemo === 'state0' && <div className="mt-1 w-1 h-1 rounded-full bg-emerald-500 animate-ping"></div>}
              </button>
              {[1, 2, 3].map((state) => (
                <button
                  key={state}
                  onClick={() => handleDemoLogin(`state${state}` as any)}
                  disabled={!!loadingDemo}
                  className="flex flex-col items-center justify-center p-3 border border-pr-border rounded-xl bg-pr-surface-background hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tight">Level {state}</span>
                  {loadingDemo === `state${state}` && <div className="mt-1 w-1 h-1 rounded-full bg-blue-500 animate-ping"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Brand / Merchant Pool */}
            <div className="bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden">
              <div className="bg-pr-surface-2 px-4 py-2 border-b border-pr-border">
                <h3 className="text-[10px] font-bold text-pr-text-2 uppercase tracking-wider">Campaigns & Destinations</h3>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleDemoLogin('samplingMerchant')}
                  disabled={!!loadingDemo}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-orange-500/10 group transition-all"
                >
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Store className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-pr-text-1">Destinations</div>
                    <div className="text-[8px] text-pr-text-3">Proven Flow</div>
                  </div>
                  {loadingDemo === 'samplingMerchant' && <div className="ml-auto w-1 h-1 rounded-full bg-orange-500 animate-ping"></div>}
                </button>
                <button
                  onClick={() => handleDemoLogin('advertiser')}
                  disabled={!!loadingDemo}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-purple-500/10 group transition-all"
                >
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-pr-text-1">Success Manager</div>
                    <div className="text-[8px] text-pr-text-3">Verified Results</div>
                  </div>
                  {loadingDemo === 'advertiser' && <div className="ml-auto w-1 h-1 rounded-full bg-purple-500 animate-ping"></div>}
                </button>
              </div>
            </div>

            {/* Auditor / Operator Pool */}
            <div className="bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden">
              <div className="bg-pr-surface-2 px-4 py-2 border-b border-pr-border">
                <h3 className="text-[10px] font-bold text-pr-text-2 uppercase tracking-wider">Verification & Logic</h3>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleDemoLogin('operator')}
                  disabled={!!loadingDemo}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-emerald-500/10 group transition-all"
                >
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-pr-text-1">Verification Officer</div>
                    <div className="text-[8px] text-pr-text-3">Success Audits</div>
                  </div>
                  {loadingDemo === 'operator' && <div className="ml-auto w-1 h-1 rounded-full bg-emerald-500 animate-ping"></div>}
                </button>
                <button
                  onClick={() => handleDemoLogin('matrix')}
                  disabled={!!loadingDemo}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-pr-surface-3 group transition-all opacity-50 grayscale hover:grayscale-0"
                >
                  <div className="w-8 h-8 bg-pr-surface-3 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Network className="w-4 h-4 text-pr-text-3" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-pr-text-2">Network Logic</div>
                    <div className="text-[8px] text-pr-text-3">Matrix Graph</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-pr-text-3 italic">
            Note: Demo accounts require a professional track record history. Run migrations if login fails.
          </p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isInitializing || isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all group shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-zinc-700 font-semibold text-sm">
              {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-pr-surface-3" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-pr-surface-background text-pr-text-2">
              Or use email
            </span>
          </div>
        </div>

        {/* Auth Form */}
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm break-words">
              {typeof error === 'string' ? error : error instanceof Error ? error.message : 'An error occurred'}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-pr-text-1 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-pr-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-pr-surface-card text-pr-text-1 placeholder:text-pr-text-3"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {isSignUp && (
            <>
              <div>
                <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-pr-text-1 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-pr-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-pr-surface-card text-pr-text-1 placeholder:text-pr-text-3"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="display_name" className="block text-xs sm:text-sm font-medium text-pr-text-1 mb-1">
                  Display Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <input
                    id="display_name"
                    name="display_name"
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-pr-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-pr-surface-card text-pr-text-1 placeholder:text-pr-text-3"
                    placeholder="Your display name"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-pr-text-1 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-pr-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-pr-surface-card text-pr-text-1 placeholder:text-pr-text-3"
                placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pr-text-2 tap-target"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {!isSignUp && (
              <div className="mt-1 text-right">
                <a
                  href="/auth/reset-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/auth/reset-password');
                  }}
                >
                  Forgot password?
                </a>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center px-3 sm:px-4 py-2.5 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tap-target"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </button>
        </form>

        {/* Toggle Sign In/Sign Up */}
        <div className="text-center">
          <p className="text-sm text-pr-text-2">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ email: '', password: '', username: '', display_name: '' });
              }}
              className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {isSignUp ? 'Sign in instead' : 'Create one here'}
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
