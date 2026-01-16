import { useState } from 'react';
import { Link as _Link } from 'react-router-dom';
import { X as _X, Sparkles as _Sparkles, ArrowRight as _ArrowRight, Gift as _Gift, Users as _Users, TrendingUp as _TrendingUp } from 'lucide-react';

const Link = _Link as any;
const X = _X as any;
const Sparkles = _Sparkles as any;
const ArrowRight = _ArrowRight as any;
const Gift = _Gift as any;
const Users = _Users as any;
const TrendingUp = _TrendingUp as any;

interface WelcomeBannerProps {
  userName?: string;
  onDismiss?: () => void;
}

export default function WelcomeBanner({ userName, onDismiss }: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
    localStorage.setItem('welcome_banner_dismissed', 'true');
  };

  const quickActions = [
    {
      icon: Gift,
      label: 'Complete a Drop',
      description: 'Earn your first gems',
      href: '/earn',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      label: 'Explore Market',
      description: 'Discover content shares',
      href: '/market',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      label: 'Invite Friends',
      description: 'Earn referral bonuses',
      href: '/referrals',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl p-6 mb-6 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        aria-label="Dismiss welcome banner"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium text-white/90">Welcome to Promorang!</span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Hey {userName || 'there'}! Ready to start earning?
        </h2>
        
        <p className="text-white/90 mb-6 max-w-xl">
          Complete these quick actions to unlock your first rewards and discover everything Promorang has to offer.
        </p>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="group flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{action.label}</p>
                <p className="text-xs text-white/70 truncate">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
