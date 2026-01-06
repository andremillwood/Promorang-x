import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from "react-router-dom";
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
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({ brand_name: brandName, brand_logo_url: brandLogoUrl }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        if (data.token && data.user) {
          localStorage.setItem('authToken', data.token);
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
      features: ['Basic analytics', 'Standard support', 'Create proof drops only', 'Sponsor any content with gems']
    },
    premium: {
      name: 'Premium Advertiser',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      inventory: 'Weekly: 200 moves, 15 proof drops, 8 paid drops',
      features: ['Advanced analytics', 'Priority support', 'Custom targeting', 'Create proof & paid drops', 'Sponsor content with gems']
    },
    super: {
      name: 'Super Advertiser',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      inventory: 'Weekly: 500 moves, 25 proof drops, 15 paid drops',
      features: ['Premium analytics', 'Priority support', 'Custom targeting', 'Advanced reporting', 'Create proof & paid drops', 'Sponsor content with gems']
    }
  };

  return (
    <div className="min-h-screen-dynamic bg-gradient-to-br from-orange-50 via-red-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-pr-surface-card/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <MegaphoneIcon className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Advertise on Promorang
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto">
              Connect with thousands of creators and build authentic campaigns that drive real engagement
            </p>
            <div className="flex items-center justify-center space-x-8 text-orange-100">
              <div className="flex items-center space-x-2">
                <UsersIcon className="w-5 h-5" />
                <span>50k+ Active Creators</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUpIcon className="w-5 h-5" />
                <span>95% Completion Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5" />
                <span>4.9★ Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-pr-text-1 mb-12">
            Why Choose Promorang for Advertising?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-pr-surface-card rounded-2xl p-8 shadow-sm border border-pr-surface-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <TargetIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-pr-text-1 mb-4">Moves & Proof System</h3>
              <p className="text-pr-text-2">
                Create "moves" that help users earn keys for their Master Key progression, and "proof drops" that contribute to daily activation requirements.
              </p>
            </div>

            <div className="bg-pr-surface-card rounded-2xl p-8 shadow-sm border border-pr-surface-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3Icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-pr-text-1 mb-4">Flexible Inventory System</h3>
              <p className="text-pr-text-2">
                Start with free monthly samples, then upgrade to weekly inventory allocations for moves, proof drops, and paid opportunities.
              </p>
            </div>

            <div className="bg-pr-surface-card rounded-2xl p-8 shadow-sm border border-pr-surface-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <DollarSignIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-pr-text-1 mb-4">Gem Sponsorship System</h3>
              <p className="text-pr-text-2">
                All advertisers can allocate gems to sponsor any content, boosting visibility and engagement regardless of tier level.
              </p>
            </div>
          </div>
        </div>

        {/* Advertiser Tiers */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-pr-text-1 mb-4">
            Advertiser Tiers
          </h2>
          <p className="text-center text-pr-text-2 mb-12 text-lg">
            Choose the tier that matches your advertising needs and scale
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(tierBenefits).map(([tier, info]) => (
              <div key={tier} className={`border-2 rounded-2xl p-8 ${info.color} relative`}>
                {tier === 'premium' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {tier === 'free' && <ZapIcon className="w-8 h-8 text-pr-text-2" />}
                    {tier === 'premium' && <StarIcon className="w-8 h-8 text-purple-600" />}
                    {tier === 'super' && <CrownIcon className="w-8 h-8 text-yellow-600" />}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{info.name}</h3>
                  <p className="text-lg font-semibold">{info.inventory}</p>
                  <p className="text-sm opacity-75">
                    {tier === 'free' ? 'Sample inventory allocation' : 'Weekly inventory allocation'}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {info.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier === 'free' && (
                  <p className="text-xs opacity-75 text-center">
                    Free tier can create proof drops and sponsor content. Upgrade to create paid drops.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-pr-text-1 mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-pr-text-1 mb-2">Create Campaigns</h3>
              <p className="text-pr-text-2 text-sm">
                Set up drops with your requirements, budget, and target audience
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-pr-text-1 mb-2">Creators Apply</h3>
              <p className="text-pr-text-2 text-sm">
                Qualified creators apply to your campaigns with their proposals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-pr-text-1 mb-2">Review & Approve</h3>
              <p className="text-pr-text-2 text-sm">
                Review submissions and approve the best content for your brand
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-pr-text-1 mb-2">Track Results</h3>
              <p className="text-pr-text-2 text-sm">
                Monitor performance and measure ROI with detailed analytics
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-pr-surface-card rounded-2xl shadow-lg border border-pr-surface-3 p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-pr-text-1 mb-4">
              Ready to Start Advertising?
            </h2>
            <p className="text-pr-text-2 mb-8 text-lg">
              Join hundreds of brands already using Promorang to create authentic, high-performing campaigns
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-pr-surface-2 text-pr-text-1"
                  id="brandName"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-1">
                  Brand Logo URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-pr-surface-2 text-pr-text-1"
                  id="brandLogoUrl"
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
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
            >
              {isConverting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Setting up your account...</span>
                </>
              ) : (
                <>
                  <span>Become an Advertiser</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-sm text-pr-text-2 mt-4">
              Free to get started • No setup fees • Pay only for completed work
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

