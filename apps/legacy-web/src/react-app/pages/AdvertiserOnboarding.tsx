import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMaturity } from '../context/MaturityContext';
import AdvertiserOnboardingSimplified from './AdvertiserOnboardingSimplified';
import {
  Megaphone,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight,
  Crown,
  Zap,
  BarChart3,
  Target,
  DollarSign
} from 'lucide-react';

const MegaphoneIcon = Megaphone as any;
const UsersIcon = Users as any;
const TrendingUpIcon = TrendingUp as any;
const StarIcon = Star as any;
const CheckCircleIcon = CheckCircle as any;
const ArrowRightIcon = ArrowRight as any;
const CrownIcon = Crown as any;
const ZapIcon = Zap as any;
const BarChart3Icon = BarChart3 as any;
const TargetIcon = Target as any;
const DollarSignIcon = DollarSign as any;



export default function AdvertiserOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { maturityState, isLoading: maturityLoading } = useMaturity();
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State 0/1 users see simplified onboarding unless they explicitly reactivation full view
  const forceFullView = searchParams.get('full') === 'true';
  if (!maturityLoading && maturityState <= 1 && !forceFullView) {
    return <AdvertiserOnboardingSimplified />;
  }

  const handleBecomeAdvertiser = async (brandName?: string, brandLogoUrl?: string) => {
    if (!user) {
      navigate('/?error=auth_required');
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const response = await fetch('/api/users/become-advertiser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify({ brand_name: brandName, brand_logo_url: brandLogoUrl }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        if (data.token && data.user) {
          localStorage.setItem('access_token', data.token);
          localStorage.setItem('advertiser_conversion', 'true');
          window.location.href = '/advertiser#converted';
          return;
        }

        localStorage.setItem('advertiser_conversion', 'true');
        window.location.href = '/advertiser#converted';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to become advertiser');
      }
    } catch (error) {
      console.error('Error becoming advertiser:', error);
      setError('Network error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  const tierBenefits = {
    free: {
      name: 'Free Advertiser',
      color: 'text-pr-text-2 bg-pr-surface-2 border-pr-surface-3',
      inventory: 'Monthly Sample: 50 moves, 5 proof drops',
      features: ['Basic analytics', 'Standard support', 'Create proof drops only', 'Sponsor any content with verified_credits']
    },
    premium: {
      name: 'Premium Advertiser',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      inventory: 'Weekly: 200 moves, 15 proof drops, 8 paid drops',
      features: ['Advanced analytics', 'Priority support', 'Custom targeting', 'Create proof & paid drops', 'Sponsor content with verified_credits']
    },
    super: {
      name: 'Super Advertiser',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      inventory: 'Weekly: 500 moves, 25 proof drops, 15 paid drops',
      features: ['Premium analytics', 'Priority support', 'Custom targeting', 'Advanced reporting', 'Create proof & paid drops', 'Sponsor content with verified_credits']
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-purple-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/[0.05] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.05] blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/today')}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowRightIcon className="w-4 h-4 rotate-180" />
            Back to Journal
          </button>
          <div className="text-sm font-bold tracking-widest uppercase text-purple-500">Promorang Business</div>
        </div>

        {/* Hero Section */}
        <div className="px-6 py-20 lg:py-32 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-8">
            <MegaphoneIcon className="w-3 h-3" />
            Partnership Portal
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text text-transparent italic">
            Sponsor the moments<br />that matter.
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect your brand with high-intent audiences through authentic, verified moments.
            Real inventory. Real ROI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-medium text-zinc-500 mb-16">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-purple-500" />
              <span>50k+ Active Creators</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-purple-500" />
              <span>95% Completion Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-purple-500" />
              <span>Premium Reliability</span>
            </div>
          </div>
        </div>

        {/* Value Props */}
        <div className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 hover:border-purple-500/20 transition-colors group">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <TargetIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Precision Inventory</h3>
              <p className="text-zinc-400 leading-relaxed">
                Access structured "moves" and "proof drops" that guarantee user attention and verifiable action.
              </p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 hover:border-purple-500/20 transition-colors group">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <BarChart3Icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Scalable Capacity</h3>
              <p className="text-zinc-400 leading-relaxed">
                Start with free monthly samples, then upgrade to weekly inventory allocations as your campaigns grow.
              </p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 hover:border-purple-500/20 transition-colors group">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <DollarSignIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Direct ROI</h3>
              <p className="text-zinc-400 leading-relaxed">
                Allocate `verified_credits` directly to sponsor high-performing content, boosting visibility securely.
              </p>
            </div>
          </div>
        </div>

        {/* Tiers */}
        <div className="max-w-6xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Choose your capacity.</h2>
            <p className="text-zinc-400 text-lg">Scale your advertising reach with our tiered inventory system.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {Object.entries(tierBenefits).map(([tier, info]) => (
              <div
                key={tier}
                className={`relative p-8 rounded-[2.5rem] border transition-all duration-300 ${tier === 'premium'
                  ? 'bg-zinc-900/80 border-purple-500/50 shadow-2xl shadow-purple-500/10'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
              >
                {tier === 'premium' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="flex justify-center mb-6">
                    {tier === 'free' && <ZapIcon className="w-10 h-10 text-zinc-600" />}
                    {tier === 'premium' && <StarIcon className="w-10 h-10 text-purple-500" />}
                    {tier === 'super' && <CrownIcon className="w-10 h-10 text-amber-400" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{info.name}</h3>
                  <div className="h-px w-12 bg-zinc-800 mx-auto my-4" />
                  <p className="text-lg font-medium text-white mb-1">{info.inventory}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {info.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 ${tier === 'premium' ? 'text-purple-500' : 'text-zinc-600'}`} />
                      <span className="text-sm text-zinc-400 text-left leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto px-6 pb-32">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 md:p-12 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

            <h2 className="text-3xl font-bold text-white mb-4 relative z-10">
              Ready to advertise?
            </h2>
            <p className="text-zinc-400 mb-8 relative z-10">
              Join hundreds of brands using Promorang to drive real engagement.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-8 relative z-10 text-left">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 pl-4">
                  Brand Name
                </label>
                <input
                  type="text"
                  id="brandName"
                  placeholder="e.g. Acme Corp"
                  className="w-full px-6 py-4 bg-black border border-zinc-800 rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 pl-4">
                  Logo URL (Optional)
                </label>
                <input
                  type="text"
                  id="brandLogoUrl"
                  placeholder="https://..."
                  className="w-full px-6 py-4 bg-black border border-zinc-800 rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const brandName = (document.getElementById('brandName') as HTMLInputElement)?.value;
                const brandLogoUrl = (document.getElementById('brandLogoUrl') as HTMLInputElement)?.value;

                if (!brandName) {
                  setError('Please enter your brand name');
                  return;
                }

                handleBecomeAdvertiser(brandName, brandLogoUrl);
              }}
              disabled={isConverting}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold px-8 py-5 rounded-2xl text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-3 relative z-10"
            >
              {isConverting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                  <span>Setting up account...</span>
                </>
              ) : (
                <>
                  <span>Initialize Advertising Account</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-xs text-zinc-500 mt-6 font-medium">
              Free to start • No credit card required today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

