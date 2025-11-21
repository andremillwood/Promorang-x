import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Chrome, Gift, Sun, Moon } from 'lucide-react';
import { useUnauthenticatedTheme } from '../hooks/useUnauthenticatedTheme';

export default function AuthPage() {
  const { signIn, signUp, signInWithOAuth, demoLogin, isPending } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, setTheme } = useUnauthenticatedTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    display_name: ''
  });
  const [error, setError] = useState<string | Error | null>(null);

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setIsSignUp(true); // Auto-switch to signup mode
      validateReferralCode(refCode);
    }
  }, [searchParams]);

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
          navigate('/dashboard');
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
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    }
  };

  const handleDemoLogin = async (type: 'creator' | 'investor' | 'advertiser' | 'operator' | 'merchant') => {
    setError(null);
    try {
      const result = await demoLogin[type]();
      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : result.error.message || 'Demo login failed');
      } else {
        // Redirect to dashboard after successful demo login
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login with demo account. Please try again.';
      setError(errorMessage);
    }
  };

  const handleOAuthLogin = async () => {
    setError('');
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

        {/* Demo Login Buttons */}
        <div className="space-y-2 sm:space-y-3">
          <p className="text-center text-xs sm:text-sm text-pr-text-2 font-medium">Quick Demo Login:</p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleDemoLogin('creator')}
              disabled={isPending}
              className="w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 border border-pr-border rounded-lg text-sm font-medium text-pr-text-1 bg-pr-surface-card hover:bg-pr-surface-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 tap-target"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-sm">Demo Creator</div>
                  <div className="text-xs text-pr-text-2 truncate">creator@demo.com</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('investor')}
              disabled={isPending}
              className="w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 border border-pr-surface-3 rounded-lg text-sm font-medium text-pr-text-1 bg-pr-surface-card hover:bg-pr-surface-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50 tap-target"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-sm">Demo Investor</div>
                  <div className="text-xs text-pr-text-2 truncate">investor@demo.com</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('advertiser')}
              disabled={isPending}
              className="w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 border border-pr-surface-3 rounded-lg text-sm font-medium text-pr-text-1 bg-pr-surface-card hover:bg-pr-surface-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:opacity-50 tap-target"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-sm">Demo Advertiser</div>
                  <div className="text-xs text-pr-text-2 truncate">advertiser@demo.com</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('operator')}
              disabled={isPending}
              className="w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-300 rounded-lg text-sm font-medium text-pr-text-1 bg-pr-surface-card hover:bg-pr-surface-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50 tap-target"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-700" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-sm">Demo Operator</div>
                  <div className="text-xs text-pr-text-2 truncate">castleblack-demo@promorang.co</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('merchant')}
              disabled={isPending}
              className="w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 border border-green-300 rounded-lg text-sm font-medium text-pr-text-1 bg-pr-surface-card hover:bg-pr-surface-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:opacity-50 tap-target"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-700" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-sm">Demo Merchant</div>
                  <div className="text-xs text-pr-text-2 truncate">merchant@demo.com</div>
                </div>
              </div>
            </button>
          </div>
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
          disabled={isPending}
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
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-pr-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-pr-surface-card text-pr-text-1"
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
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-pr-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-pr-surface-card text-pr-text-1"
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
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-pr-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-pr-surface-card text-pr-text-1"
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
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
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
            disabled={isPending}
            className="w-full flex justify-center items-center px-3 sm:px-4 py-2.5 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tap-target"
          >
            {isPending ? (
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
