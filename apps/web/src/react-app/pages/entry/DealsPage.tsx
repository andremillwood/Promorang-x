/**
 * Deals Entry Page
 * 
 * Primary entry surface for new users. Shows available deals/drops
 * in a simple, action-first interface without requiring explanation.
 * 
 * This is a NEW route - does not replace existing /drops or /earn pages.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import { EntryLayout } from '@/react-app/components/entry';
import { Gift, Clock, Users, ChevronRight, Sparkles, Shield, Star, Tag, Trophy, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/react-app/utils/api';
import { WhatsNextTooltip } from '@/react-app/components/WhatsNextCard';
import { markCompleted, STORAGE_KEYS } from '@/react-app/hooks/useWhatsNext';

interface Deal {
  id: string;
  title: string;
  brand: string;
  brand_logo?: string;
  description: string;
  reward_amount: number;
  reward_type: 'gems' | 'points' | 'coupon';
  participants_count: number;
  max_participants?: number;
  expires_at?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  image_url?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Mock deals for demo
const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    title: 'Share Your Favorite Coffee Spot',
    brand: 'Local Cafes',
    description: 'Post a photo of your favorite local coffee shop and tag us',
    reward_amount: 50,
    reward_type: 'gems',
    participants_count: 234,
    max_participants: 500,
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty: 'easy',
    tags: ['photo', 'local', 'food']
  },
  {
    id: '2',
    title: 'Review a New Restaurant',
    brand: 'FoodieHub',
    description: 'Try a new restaurant and share your honest review',
    reward_amount: 100,
    reward_type: 'gems',
    participants_count: 89,
    max_participants: 200,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty: 'medium',
    tags: ['review', 'food', 'video']
  },
  {
    id: '3',
    title: 'Unbox & React',
    brand: 'TechGear',
    description: 'Create an unboxing video for our latest product',
    reward_amount: 250,
    reward_type: 'gems',
    participants_count: 45,
    max_participants: 100,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty: 'hard',
    tags: ['video', 'tech', 'unboxing']
  },
  {
    id: '4',
    title: 'Style Challenge',
    brand: 'FashionForward',
    description: 'Show us your unique style with our new collection',
    reward_amount: 75,
    reward_type: 'gems',
    participants_count: 156,
    max_participants: 300,
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty: 'easy',
    tags: ['fashion', 'photo', 'style']
  }
];

function DealCard({ deal, onClaim }: { deal: Deal; onClaim: (id: string) => void }) {
  const daysLeft = deal.expires_at
    ? Math.ceil((new Date(deal.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const spotsLeft = deal.max_participants
    ? deal.max_participants - deal.participants_count
    : null;

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-pr-surface-1 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-pr-surface-3/50">
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {deal.brand.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-pr-text-2">{deal.brand}</p>
              <h3 className="font-semibold text-pr-text-1 line-clamp-1">{deal.title}</h3>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[deal.difficulty]}`}>
            {deal.difficulty}
          </span>
        </div>

        <p className="text-sm text-pr-text-2 line-clamp-2 mb-3">
          {deal.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {deal.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-pr-surface-2 rounded-full text-xs text-pr-text-2">
              #{tag}
            </span>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-pr-text-2">
          {daysLeft !== null && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {daysLeft}d left
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {deal.participants_count} joined
          </span>
          {spotsLeft !== null && spotsLeft < 50 && (
            <span className="text-amber-600 font-medium">
              {spotsLeft} spots left!
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-pr-surface-2/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-purple-500" />
          <span className="font-bold text-pr-text-1">{deal.reward_amount}</span>
          <span className="text-sm text-pr-text-2">
            {deal.reward_type === 'gems' ? 'Gems' : deal.reward_type === 'points' ? 'Points' : 'Reward'}
          </span>
        </div>
        <button
          onClick={() => onClaim(deal.id)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1"
        >
          Claim <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const { user } = useAuth();
  const { recordAction, visibility, maturityState } = useMaturity();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // Fetch user preferences if logged in
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      try {
        const response = await apiFetch('/api/users/preferences');
        const data = await response.json();
        if (data.success && data.preferences?.interests) {
          setUserInterests(data.preferences.interests);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };
    fetchPreferences();
  }, [user]);

  // Fetch deals from API with preference targeting
  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        // Build URL with interests if available
        let apiUrl = `${API_BASE}/api/drops?status=active&limit=20`;
        if (userInterests.length > 0) {
          apiUrl += `&interests=${userInterests.join(',')}`;
        }

        const response = await fetch(apiUrl);
        if (response.ok) {
          const result = await response.json();
          // The API might return just an array or { data: [...] }
          const dropsData = Array.isArray(result) ? result : result.data || [];

          if (dropsData.length > 0) {
            // Map API response to Deal format
            const apiDeals = dropsData.map((drop: any) => ({
              id: drop.id,
              title: drop.title || drop.name,
              brand: drop.brand_name || drop.advertiser_name || drop.creator_name || 'Promorang',
              description: drop.description || '',
              reward_amount: drop.gem_reward_base || drop.gem_reward || drop.reward_amount || 50,
              reward_type: 'gems' as const,
              participants_count: drop.current_participants || drop.applications_count || 0,
              max_participants: drop.max_participants,
              expires_at: drop.deadline_at || drop.end_date || drop.expires_at,
              difficulty: drop.difficulty || 'easy',
              tags: drop.tags || [drop.category || drop.drop_type || 'deal']
            }));
            setDeals([...apiDeals, ...MOCK_DEALS.slice(0, 2)]);
          }
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, [userInterests]); // Re-fetch when interests change

  const handleClaimDeal = async (dealId: string) => {
    if (!user) {
      navigate('/auth', { state: { from: `/deals`, action: 'claim', dealId } });
      return;
    }

    // Record the action
    await recordAction('deal_claimed', { deal_id: dealId });

    // Mark as completed for What's Next
    markCompleted(STORAGE_KEYS.claimedDeal);

    // Navigate to deal detail
    navigate(`/d/${dealId}`);
  };

  const filteredDeals = filter === 'all'
    ? deals
    : deals.filter(d => d.difficulty === filter);

  return (
    <EntryLayout>
      <div className="min-h-screen bg-pr-surface-2">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Earn rewards for what you already do</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Today's {visibility.labels.deals}
            </h1>
            <p className="text-lg opacity-90 max-w-xl">
              Complete simple tasks, share content, and earn real rewards. No experience needed.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{deals.length}</p>
                  <p className="text-sm opacity-80">Active Deals</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5,000+</p>
                  <p className="text-sm opacity-80">Gems Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Row - Always visible */}
        <div className="bg-pr-surface-1 border-b border-pr-surface-3">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-pr-text-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>{visibility.labels.verified}</span>
              </div>
              <div className="flex items-center gap-1.5 text-pr-text-2">
                <Tag className="w-4 h-4 text-amber-500" />
                <span>{visibility.labels.weeklyWins}</span>
              </div>
              {!user && (
                <Link to="/auth" className="ml-auto text-blue-500 hover:text-blue-600 font-medium">
                  Sign in to track progress →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Rank Progress Banner - Only for State 0/1 */}
          {maturityState <= 1 && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-blue-900">Your current rank: {maturityState === 0 ? 'Rank 0 (New)' : 'Rank 1 (Explorer)'}</h2>
                  <p className="text-sm text-blue-700">Claim deals and complete actions to increase your Access Rank and unlock better rewards.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase">Rank Up!</div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f
                  ? 'bg-pr-text-1 text-pr-surface-1'
                  : 'bg-pr-surface-1 text-pr-text-2 hover:bg-pr-surface-3'
                  }`}
              >
                {f === 'all' ? 'All Deals' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Deals Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDeals.map(deal => (
                <DealCard key={deal.id} deal={deal} onClaim={handleClaimDeal} />
              ))}
            </div>
          )}

          {filteredDeals.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-pr-text-2">No deals found for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </EntryLayout>
  );
}
