import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Chrome, Gift, Sun, Moon, Shield, CheckCircle, Network } from 'lucide-react';
import { useUnauthenticatedTheme } from '../hooks/useUnauthenticatedTheme';

export default function AuthPage() {
  const { signIn, signUp, signInWithOAuth, demoLogin, checkDemoHealth, initializeDemo, isLoading } = useAuth();
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
        const result = await signUp(formData.email, formData.password);
        if (result.error) {
          setError(typeof result.error === 'string' ? result.error : result.error.message || 'Signup failed');
        } else if (result.requiresConfirmation) {
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
        } else if (type === 'state0') {
          // State 0: New user - go to start page
          navigate('/start');
        } else if (type === 'state1') {
          // State 1: Exploring - go to Today
          navigate('/today');
        } else if (type === 'state2' || type === 'state3') {
          // State 2/3: Engaged/Power - go to Today
          navigate('/today');
        } else {
          // Other demo types - go to Today
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

  const handleOAuthLogin = async () => {
    setError('');

    // Store referral code in localStorage before OAuth redirect
    // This allows us to attribute the signup after OAuth completes
    if (referralCode) {
      localStorage.setItem('pending_referral_code', referralCode);
    }

    const result = await signInWithOAuth('google');
    if (result?.error) {
      setError(result.error);
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
              ? 'Join thousands of creators earning on Promorang'
              : 'Sign in to your account to continue earning'
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
          <div className="bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden">
            <div className="bg-pr-surface-2 px-4 py-2 border-b border-pr-border flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-pr-text-2 uppercase tracking-wider">Merchant Sampling Program</h3>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-150"></div>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleDemoLogin('samplingMerchant')}
                disabled={!!loadingDemo}
                className="w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium text-pr-text-1 hover:bg-emerald-500/5 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sun className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold flex items-center gap-2">
                      New Merchant
                      {loadingDemo === 'samplingMerchant' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>}
                    </div>
                    <div className="text-[10px] text-pr-text-2">Test activation creation limits</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-pr-text-3 group-hover:text-emerald-500 transition-colors" />
              </button>

              <button
                onClick={() => handleDemoLogin('activeSampling')}
                disabled={!!loadingDemo}
                className="w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium text-pr-text-1 hover:bg-blue-500/5 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold flex items-center gap-2">
                      Active Sampling
                      {loadingDemo === 'activeSampling' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>}
                    </div>
                    <div className="text-[10px] text-pr-text-2">Test dashboard metrics & gating</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-pr-text-3 group-hover:text-blue-500 transition-colors" />
              </button>

              <button
                onClick={() => handleDemoLogin('graduatedMerchant')}
                disabled={!!loadingDemo}
                className="w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium text-pr-text-1 hover:bg-purple-500/5 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Gift className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold flex items-center gap-2">
                      Graduated
                      {loadingDemo === 'graduatedMerchant' && <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>}
                    </div>
                    <div className="text-[10px] text-pr-text-2">Test post-sampling upgrade flow</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-pr-text-3 group-hover:text-purple-500 transition-colors" />
              </button>
            </div>
          </div>

          <div className="bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden">
            <div className="bg-pr-surface-2 px-4 py-2 border-b border-pr-border">
              <h3 className="text-[10px] font-bold text-pr-text-2 uppercase tracking-wider">Platform Roles</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('creator')}
                disabled={!!loadingDemo}
                className="flex flex-col items-center justify-center p-3 border border-pr-border rounded-xl bg-pr-surface-background hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
              >
                <User className="w-6 h-6 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Creator</span>
                {loadingDemo === 'creator' && <div className="mt-1 w-1 h-1 rounded-full bg-blue-500 animate-ping"></div>}
              </button>
              <button
                onClick={() => handleDemoLogin('investor')}
                disabled={!!loadingDemo}
                className="flex flex-col items-center justify-center p-3 border border-pr-border rounded-xl bg-pr-surface-background hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
              >
                <Sun className="w-6 h-6 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Investor</span>
                {loadingDemo === 'investor' && <div className="mt-1 w-1 h-1 rounded-full bg-purple-500 animate-ping"></div>}
              </button>
              <button
                onClick={() => handleDemoLogin('advertiser')}
                disabled={!!loadingDemo}
                className="flex flex-col items-center justify-center p-3 border border-pr-border rounded-xl bg-pr-surface-background hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
              >
                <Shield className="w-6 h-6 text-orange-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Advertiser</span>
                {loadingDemo === 'advertiser' && <div className="mt-1 w-1 h-1 rounded-full bg-orange-500 animate-ping"></div>}
              </button>
              <button
                onClick={() => handleDemoLogin('matrix')}
                disabled={!!loadingDemo}
                className="flex flex-col items-center justify-center p-3 border border-purple-500/30 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 transition-all group relative overflow-hidden"
              >
                <Network className="w-6 h-6 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-tight">MLM Matrix</span>
                {loadingDemo === 'matrix' && <div className="mt-1 w-1 h-1 rounded-full bg-purple-600 animate-ping"></div>}
              </button>
            </div>
          </div>

          <div className="bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden">
            <div className="bg-pr-surface-2 px-4 py-2 border-b border-pr-border flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-pr-text-2 uppercase tracking-wider">Maturity States (UX Testing)</h3>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                <div className="w-1 h-1 rounded-full bg-blue-300"></div>
              </div>
            </div>
            <div className="p-2 grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((state) => (
                <button
                  key={state}
                  onClick={() => handleDemoLogin(`state${state}` as any)}
                  disabled={!!loadingDemo}
                  className="flex flex-col items-center justify-center p-2 border border-pr-border rounded-lg bg-pr-surface-background hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                  title={`Login as State ${state} user`}
                >
                  <span className="text-xs font-bold text-pr-text-1 group-hover:text-blue-500">S{state}</span>
                  {loadingDemo === `state${state}` && <div className="mt-1 w-1 h-1 rounded-full bg-blue-500 animate-ping"></div>}
                </button>
              ))}
            </div>
            <div className="px-3 pb-2 text-[8px] text-pr-text-3 text-center">
              Test progressive disclosure & state-aware copy
            </div>
          </div>

          <p className="text-[10px] text-center text-pr-text-3 italic">
            Note: Demo accounts require seed data. Run migrations if login fails.
          </p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-pr-surface-3" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-pr-surface-background text-pr-text-2">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth Button */}
        <button
          onClick={handleOAuthLogin}
          disabled={isLoading}
          className="w-full flex justify-center items-center px-3 sm:px-4 py-2.5 sm:py-3 border border-pr-border rounded-lg shadow-sm text-sm font-medium text-pr-text-1 bg-pr-surface-card hover:bg-pr-surface-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 tap-target"
        >
          <Chrome className="w-5 h-5 mr-2 sm:mr-3 text-red-500 flex-shrink-0" />
          Continue with Google
        </button>

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
