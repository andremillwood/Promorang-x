/**
 * Entry Layout
 * 
 * Branded header/footer wrapper for entry surface pages.
 * Provides consistent Promorang branding without the full dashboard chrome.
 * Used for /start, /deals, /events-entry, /post routes.
 */

import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import {
  Menu,
  X,
  User,
  LogOut,
  Gift,
  Calendar,
  Camera,
  Home,
  ChevronRight,
  Sparkles,
  Shield,
  Store,
  BarChart3,
  Star,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EntryLayoutProps {
  children: ReactNode;
  showBackToStart?: boolean;
}

const LOGO_URL = 'https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png';

export default function EntryLayout({ children, showBackToStart = true }: EntryLayoutProps) {
  const { user, signOut } = useAuth();
  const { maturityState, verified_actions_count: actionsCount, isLoading } = useMaturity();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Today', path: '/today', icon: Sparkles, color: 'text-amber-500' },
    { label: 'Shop', path: '/marketplace', icon: Store, color: 'text-amber-500' },
    { label: 'Market', path: '/market', icon: BarChart3, color: 'text-green-500' },
    { label: 'Deals', path: '/deals', icon: Gift, color: 'text-emerald-500' },
    { label: 'Events', path: '/events-entry', icon: Calendar, color: 'text-blue-500' },
    { label: 'Post', path: '/post', icon: Camera, color: 'text-purple-500' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-pr-surface-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-pr-surface-background/95 backdrop-blur-sm border-b border-pr-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={user ? '/start' : '/'} className="flex items-center gap-2">
              <img
                src={LOGO_URL}
                alt="Promorang"
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                    ? `bg-pr-surface-2 ${item.color}`
                    : 'text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-1'
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Progress indicator for early users */}
              {user && maturityState < 2 && actionsCount > 0 && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full border border-emerald-500/20">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-pr-text-1">
                    {actionsCount}/3 actions
                  </span>
                </div>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  {/* Dashboard link for users who have progressed */}
                  {maturityState >= 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                      className="hidden sm:flex"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-pr-text-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/auth?mode=signup')}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-pr-surface-1"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-pr-text-1" />
                ) : (
                  <Menu className="h-5 w-5 text-pr-text-1" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-pr-border bg-pr-surface-background">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                    ? `bg-pr-surface-2 ${item.color}`
                    : 'text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-1'
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}

              {user && maturityState >= 2 && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-1"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Breadcrumb for sub-pages */}
      {showBackToStart && location.pathname !== '/start' && (
        <div className="bg-pr-surface-1 border-b border-pr-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <Link
              to="/start"
              className="inline-flex items-center gap-1 text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Start</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-pr-text-1 font-medium">
                {navItems.find(item => item.path === location.pathname)?.label || 'Page'}
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-pr-surface-1 border-t border-pr-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo and tagline */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <img
                src={LOGO_URL}
                alt="Promorang"
                className="h-6 w-auto opacity-80"
              />
              <p className="text-xs text-pr-text-2">
                Earn rewards for sharing what you love
              </p>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-6 text-sm">
              <Link to="/about" className="text-pr-text-2 hover:text-pr-text-1 transition-colors">
                About
              </Link>
              <Link to="/how-it-works" className="text-pr-text-2 hover:text-pr-text-1 transition-colors">
                How It Works
              </Link>
              <Link to="/support" className="text-pr-text-2 hover:text-pr-text-1 transition-colors">
                Help
              </Link>
              <Link to="/privacy" className="text-pr-text-2 hover:text-pr-text-1 transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-pr-text-2 hover:text-pr-text-1 transition-colors">
                Terms
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pr-surface-2 rounded-full">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-pr-text-2">Verified Platform</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-pr-border text-center">
            <p className="text-xs text-pr-text-2">
              © {new Date().getFullYear()} Promorang. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
