import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaturity } from '@/react-app/context/MaturityContext';
import {
  Wallet as WalletIcon,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Filter,
  Coins,
  Key,
  Trophy,
  Diamond,
  TrendingUp,
  Activity,
  Target,
  Sparkles,
  ArrowRight,
  Gift
} from 'lucide-react';
import type { WalletType, TransactionType, UserType, ContentHolding, ShareListing, ShareOffer } from '../../shared/types';
import CurrencyConversionModal from '@/react-app/components/CurrencyConversionModal';
import MasterKeyModal from '@/react-app/components/MasterKeyModal';
import GoldShopModal from '@/react-app/components/GoldShopModal';
import WithdrawalModal from '@/react-app/components/WithdrawalModal';
import PaymentPreferencesModal from '@/react-app/components/PaymentPreferencesModal';
import GemStoreModal from '@/react-app/components/GemStoreModal';
import AchievementsModal from '@/react-app/components/AchievementsModal';
import AuthDebugger from '@/react-app/components/AuthDebugger';
import { buildAuthHeaders } from '@/react-app/utils/api';
import ListShareModal from '@/react-app/components/ListShareModal';
import { getPortfolioHoldings } from '@/react-app/services/portfolioService';
import { fetchShareListings, fetchShareOffers, acceptShareOffer } from '@/react-app/services/sharesService';
import {
  EarningsChart,
  PerformanceMetrics,
  ActivityBreakdown,
  TrendLine,
  KPICard
} from '@/react-app/components/AnalyticsCharts';

/**
 * Simplified Wallet View for State 0/1 users
 * Shows educational content about the currency system
 */
function WalletSimplified() {
  const navigate = useNavigate();

  const currencies = [
    {
      name: 'Points',
      icon: <Coins className="w-6 h-6" />,
      color: 'blue',
      description: 'Earned from daily activities and social actions',
      howToEarn: 'Complete your Today tasks',
    },
    {
      name: 'PromoKeys',
      icon: <Key className="w-6 h-6" />,
      color: 'orange',
      description: 'Used to unlock premium drops and opportunities',
      howToEarn: 'Convert 500 Points into 1 Key',
    },
    {
      name: 'Gems',
      icon: <Diamond className="w-6 h-6" />,
      color: 'purple',
      description: 'Premium currency earned from completed drops',
      howToEarn: 'Complete drops and tasks',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <WalletIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-pr-text-1 mb-2">Your Wallet</h1>
        <p className="text-pr-text-2">Earn and manage multiple currencies</p>
      </div>

      {/* Currency Cards - Simple Version */}
      <div className="space-y-4">
        {currencies.map((currency) => (
          <div
            key={currency.name}
            className={`bg-pr-surface-card rounded-xl p-5 border border-pr-border`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-${currency.color}-100 dark:bg-${currency.color}-900/30 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <div className={`text-${currency.color}-600`}>{currency.icon}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-pr-text-1">{currency.name}</h3>
                  <span className="text-2xl font-bold text-pr-text-1">0</span>
                </div>
                <p className="text-sm text-pr-text-2 mb-2">{currency.description}</p>
                <p className="text-xs text-pr-text-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {currency.howToEarn}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Get Started CTA */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5" />
          <span className="text-sm font-medium opacity-90">Start earning</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Complete Your First Task</h3>
        <p className="text-white/80 text-sm mb-4">
          Head to Today to start earning points and unlock the full wallet features
        </p>
        <button
          onClick={() => navigate('/today')}
          className="w-full bg-white text-blue-600 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
        >
          Go to Today
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Coming Soon Preview */}
      <div className="text-center text-sm text-pr-text-2">
        <p>Unlock analytics, withdrawals, and more as you earn</p>
      </div>
    </div>
  );
}

// Wallet Analytics Component
function WalletAnalyticsOverview({ userData }: { userData: UserType | null; transactions: TransactionType[] }) {
  const navigate = useNavigate();
  // Generate mock earnings data for the last 30 days
  const generateEarningsData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        earnings: Math.floor(Math.random() * 50) + 10,
        gems: Math.floor(Math.random() * 20) + 5,
        points: Math.floor(Math.random() * 100) + 20
      };
    });
    return last30Days;
  };

  const earningsData = generateEarningsData();

  const currencyBreakdown = [
    { name: 'Points', value: userData?.points_balance || 0, color: '#3b82f6' },
    { name: 'Keys', value: (userData?.keys_balance || 0) * 10, color: '#f97316' },
    { name: 'Gems', value: (userData?.gems_balance || 0) * 5, color: '#8b5cf6' },
    { name: 'Gold', value: (userData?.gold_collected || 0) * 2, color: '#eab308' }
  ];

  const earningsSources = [
    { metric: 'Social Actions', value: 45 },
    { metric: 'Drop Completions', value: 30 },
    { metric: 'Content Investments', value: 15 },
    { metric: 'Referral Bonuses', value: 8 },
    { metric: 'Achievements', value: 2 }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-xl p-6 text-white shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-white/80">New</div>
            <h3 className="text-2xl font-semibold">Growth Hub is live</h3>
            <p className="text-sm text-white/80 mt-1">Stake gems, fund creators, and unlock higher returns on your balance.</p>
          </div>
          <button
            onClick={() => navigate('/growth-hub')}
            className="inline-flex items-center justify-center px-4 py-2 bg-pr-surface-card text-blue-600 font-medium rounded-lg shadow-sm hover:bg-blue-50 transition"
          >
            Explore Growth Hub
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="This Month"
          value="$127.50"
          change={23}
          changeType="increase"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={earningsData.slice(-7).map(d => ({ date: d.date, value: d.earnings }))}
        />

        <KPICard
          title="All Time"
          value="$1,456.80"
          change={8}
          changeType="increase"
          icon={<Activity className="w-5 h-5" />}
          trend={earningsData.slice(-7).map(d => ({ date: d.date, value: d.earnings * 5 }))}
        />

        <KPICard
          title="Pending"
          value="$89.25"
          change={12}
          changeType="increase"
          icon={<Clock className="w-5 h-5" />}
          trend={earningsData.slice(-7).map(d => ({ date: d.date, value: d.earnings * 0.5 }))}
        />

        <KPICard
          title="Available"
          value="$234.75"
          change={5}
          changeType="increase"
          icon={<WalletIcon className="w-5 h-5" />}
          trend={earningsData.slice(-7).map(d => ({ date: d.date, value: d.earnings * 2 }))}
        />
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
          <h3 className="text-lg font-semibold text-pr-text-1 mb-6">Earnings Trend (30 Days)</h3>
          <EarningsChart
            data={earningsData}
            height={300}
          />
        </div>

        {/* Currency Distribution */}
        <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
          <h3 className="text-lg font-semibold text-pr-text-1 mb-6">Currency Distribution</h3>
          <ActivityBreakdown
            data={currencyBreakdown.filter(item => item.value > 0)}
            height={300}
          />
        </div>

        {/* Earning Sources */}
        <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
          <h3 className="text-lg font-semibold text-pr-text-1 mb-6">Earning Sources</h3>
          <PerformanceMetrics
            data={earningsSources}
            height={300}
          />
        </div>

        {/* Currency Trends */}
        <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
          <h3 className="text-lg font-semibold text-pr-text-1 mb-6">Currency Growth</h3>
          <TrendLine
            data={earningsData.map(d => ({
              date: d.date,
              value: d.points,
              secondary: d.gems * 5
            }))}
            height={300}
            primaryKey="value"
            secondaryKey="secondary"
            primaryColor="#3b82f6"
            secondaryColor="#8b5cf6"
          />
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-pr-text-2">Points</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
              <span className="text-pr-text-2">Gems (×5)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
        <h3 className="text-lg font-semibold text-pr-text-1 mb-6">Wallet Insights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Coins className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{userData?.points_balance || 0}</p>
            <p className="text-sm text-blue-600">Active Points</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Key className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{userData?.keys_balance || 0}</p>
            <p className="text-sm text-orange-600">Keys Available</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Diamond className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{userData?.gems_balance || 0}</p>
            <p className="text-sm text-purple-600">Gems Earned</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">{userData?.gold_collected || 0}</p>
            <p className="text-sm text-yellow-600">Gold Collection</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">Level {userData?.level || 1}</p>
            <p className="text-sm text-green-600">Current Level</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Activity className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-900">{userData?.points_streak_days || 0}</p>
            <p className="text-sm text-red-600">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Earning Sources Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-pr-text-1">Currency Breakdown</h3>
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Points</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-blue-900">{userData?.points_balance?.toLocaleString() || '0'}</p>
            <p className="text-sm text-blue-600">From social actions</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">Keys</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-orange-900">{userData?.keys_balance || '0'}</p>
            <p className="text-sm text-orange-600">For drop applications</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Diamond className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Gems</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-purple-900">{userData?.gems_balance || '0'}</p>
            <p className="text-sm text-purple-600">From completed drops</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-900">Gold</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-yellow-900">{userData?.gold_collected || '0'}</p>
            <p className="text-sm text-yellow-600">Prestige collection</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioHoldingsSection({
  holdings,
  loading,
  onList,
  onView,
}: {
  holdings: ContentHolding[];
  loading: boolean;
  onList: (holding: ContentHolding) => void;
  onView: (holding: ContentHolding) => void;
}) {
  if (loading) {
    return (
      <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
        <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Content Portfolio</h3>
        <p className="text-sm text-pr-text-2">Loading holdings…</p>
      </div>
    );
  }

  if (!holdings.length) {
    return (
      <div className="bg-pr-surface-card rounded-xl p-6 border border-dashed border-pr-surface-3 text-center">
        <h3 className="text-lg font-semibold text-pr-text-1 mb-2">Start building your portfolio</h3>
        <p className="text-pr-text-2 mb-4">
          Invest in creator content to earn returns and unlock secondary market trading.
        </p>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
          Discover Opportunities
        </button>
      </div>
    );
  }

  const totals = holdings.reduce(
    (
      acc,
      holding,
    ) => {
      acc.value += holding.market_value;
      acc.gain += holding.unrealized_gain;
      return acc;
    },
    { value: 0, gain: 0 },
  );

  return (
    <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-pr-text-1">Content Portfolio</h3>
          <p className="text-sm text-pr-text-2">Track your holdings, performance, and resale opportunities.</p>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div>
            <p className="text-pr-text-2">Portfolio Value</p>
            <p className="text-lg font-semibold text-pr-text-1">${totals.value.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-pr-text-2">Unrealized Gain</p>
            <p className={`text-lg font-semibold ${totals.gain >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {totals.gain >= 0 ? '+' : ''}${totals.gain.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-pr-surface-2">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                Asset
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                Shares
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                Avg. Cost
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                Market Value
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                Unrealized
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                Day
              </th>
              <th scope="col" className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="bg-pr-surface-card divide-y divide-gray-200">
            {holdings.map((holding) => (
              <tr key={holding.content_id} className="hover:bg-pr-surface-2">
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={holding.content_thumbnail}
                      alt={holding.content_title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-pr-text-1">{holding.content_title}</p>
                      <p className="text-sm text-pr-text-2">
                        {holding.creator_name} • {holding.platform.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="font-semibold text-pr-text-1">{holding.owned_shares}</div>
                  <div className="text-xs text-pr-text-2">{holding.available_to_sell} sellable</div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="text-pr-text-1">${holding.avg_cost.toFixed(2)}</div>
                  <div className="text-xs text-pr-text-2">Now ${holding.current_price.toFixed(2)}</div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="text-pr-text-1">${holding.market_value.toFixed(2)}</div>
                  <div className="text-xs text-pr-text-2">Weekly {holding.week_change_pct.toFixed(1)}%</div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className={`font-semibold ${holding.unrealized_gain >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {holding.unrealized_gain >= 0 ? '+' : ''}${holding.unrealized_gain.toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${holding.day_change_pct >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                    {holding.day_change_pct >= 0 ? '+' : ''}{holding.day_change_pct.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-4 text-right space-x-2">
                  <button
                    onClick={() => onView(holding)}
                    className="px-3 py-1.5 text-sm font-medium border border-pr-surface-3 text-pr-text-2 rounded-lg hover:bg-pr-surface-2"
                  >
                    View details
                  </button>
                  {holding.available_to_sell > 0 ? (
                    <button
                      onClick={() => onList(holding)}
                      className="px-3 py-1.5 text-sm font-medium border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50"
                    >
                      List for resale
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">All shares listed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActiveListingsSection({ listings, loading }: { listings: ShareListing[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
        <h3 className="text-lg font-semibold text-pr-text-1 mb-4">My Listings</h3>
        <p className="text-sm text-pr-text-2">Loading listings…</p>
      </div>
    );
  }

  if (!listings.length) {
    return null;
  }

  return (
    <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-pr-text-1">My Listings</h3>
          <p className="text-sm text-pr-text-2">Active resale listings awaiting buyers.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          {listings.length} active
        </span>
      </div>

      <div className="space-y-3">
        {listings.map((listing) => (
          <div key={listing.id} className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={listing.content_thumbnail}
                alt={listing.content_title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium text-pr-text-1">{listing.content_title}</p>
                <p className="text-sm text-pr-text-2">
                  {listing.remaining_quantity}/{listing.quantity} shares available
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-pr-text-2">Ask price</p>
              <p className="text-lg font-semibold text-pr-text-1">${listing.ask_price.toFixed(2)}</p>
              <p className="text-xs text-pr-text-2 mt-1">
                Created {new Date(listing.created_at).toLocaleDateString()} • {listing.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OffersSection({
  incoming,
  outgoing,
  loading,
  onAccept,
}: {
  incoming: ShareOffer[];
  outgoing: ShareOffer[];
  loading: boolean;
  onAccept: (offerId: string) => void;
}) {
  if (loading) {
    return (
      <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
        <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Offers</h3>
        <p className="text-sm text-pr-text-2">Loading offers…</p>
      </div>
    );
  }

  if (!incoming.length && !outgoing.length) {
    return null;
  }

  return (
    <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
      <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Offers</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-pr-text-1">Incoming</h4>
            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
              {incoming.length}
            </span>
          </div>
          <div className="space-y-3">
            {incoming.map((offer) => (
              <div key={offer.id} className="bg-pr-surface-2 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-pr-text-1">
                      {offer.quantity} shares @ ${offer.bid_price.toFixed(2)}
                    </p>
                    <p className="text-sm text-pr-text-2">
                      {offer.content_title || offer.content_id}
                    </p>
                    {offer.message && (
                      <p className="text-xs text-pr-text-2 mt-1">“{offer.message}”</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onAccept(offer.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Accept
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium border border-pr-surface-3 text-pr-text-2 rounded-lg hover:bg-pr-surface-2">
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!incoming.length && <p className="text-sm text-pr-text-2">No incoming offers.</p>}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-pr-text-1">Outgoing</h4>
            <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
              {outgoing.length}
            </span>
          </div>
          <div className="space-y-3">
            {outgoing.map((offer) => (
              <div key={offer.id} className="bg-pr-surface-2 rounded-lg p-4">
                <p className="font-semibold text-pr-text-1">
                  {offer.quantity} shares @ ${offer.bid_price.toFixed(2)}
                </p>
                <p className="text-sm text-pr-text-2">
                  {offer.content_title || offer.content_id}
                </p>
                <p className="text-xs text-pr-text-2 mt-1 capitalize">Status: {offer.status}</p>
              </div>
            ))}
            {!outgoing.length && <p className="text-sm text-pr-text-2">No outgoing offers.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Wallet() {
  const navigate = useNavigate();
  const { maturityState, isLoading: maturityLoading } = useMaturity();
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [holdings, setHoldings] = useState<ContentHolding[]>([]);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [listings, setListings] = useState<ShareListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [incomingOffers, setIncomingOffers] = useState<ShareOffer[]>([]);
  const [outgoingOffers, setOutgoingOffers] = useState<ShareOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [selectedHolding, setSelectedHolding] = useState<ContentHolding | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showMasterKeyModal, setShowMasterKeyModal] = useState(false);
  const [showGoldShopModal, setShowGoldShopModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showPaymentPreferencesModal, setShowPaymentPreferencesModal] = useState(false);
  const [showGemStoreModal, setShowGemStoreModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // State 0/1: Show simplified view
  if (!maturityLoading && maturityState <= 1) {
    return <WalletSimplified />;
  }

  // Debug logging
  console.log('Wallet component rendered, modal states:', {
    showGemStoreModal,
    showCurrencyModal,
    showWithdrawalModal
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    loadHoldings();
    loadListings();
    loadOffers();
  }, []);

  const fetchWalletData = async () => {
    try {
      console.log('=== fetchWalletData Debug ===');
      console.log('Starting wallet data fetch...');

      // Check authentication with comprehensive logging
      console.log('Checking authentication with Mocha service...');
      console.log('Current cookies:', document.cookie);

      const authHeaders = buildAuthHeaders();
      const authResponse = await fetch('/api/users/me', {
        credentials: 'include',
        headers: authHeaders
      });
      console.log('Auth response:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        headers: Object.fromEntries(authResponse.headers.entries())
      });

      let authData = null;
      try {
        const responseText = await authResponse.text();
        console.log('Raw auth response:', responseText);

        if (responseText) {
          authData = JSON.parse(responseText);
        }

        console.log('Auth data parsed:', {
          isNull: authData === null,
          hasId: !!(authData?.id),
          hasEmail: !!(authData?.email),
          type: typeof authData,
          data: authData
        });
      } catch (parseError) {
        console.error('Failed to parse auth response:', parseError);
      }

      if (!authData || authData === null) {
        console.log('User not authenticated - showing error and manual auth options');
        // Don't redirect immediately, show user state for debugging
        setUserData(null);
        setWallets([]);
        setTransactions([]);

        // Set a temporary notification instead of redirecting
        alert('Authentication failed. Please try the "Force Re-Login" button or refresh the page.');
        return;
      }

      console.log('User is authenticated, fetching user data...');

      // Fetch user data from database with error handling
      const response = await fetch('/api/users/me/wallets', {
        credentials: 'include',
        headers: buildAuthHeaders()
      });
      console.log('User data response status:', response.status);

      let userData = null;
      try {
        userData = await response.json();
        console.log('User data parsed:', {
          isNull: userData === null,
          hasError: !!(userData?.error),
          hasId: !!(userData?.id),
          hasEmail: !!(userData?.email),
          gems_balance: userData?.gems_balance,
          type: typeof userData
        });
      } catch (parseError) {
        console.error('Failed to parse user response:', parseError);
      }

      // Handle error responses
      if (userData?.error) {
        console.error('User data API error:', userData.error);
        if (userData.error.includes('configuration')) {
          alert('Server configuration error. Please contact support.');
          return;
        }
      }

      // If still no user data, create temporary user for display
      if (!userData || userData === null || userData?.error) {
        console.log('No valid database user found, creating temporary user...');
        const tempUser: UserType = {
          id: Date.now(),
          mocha_user_id: authData.id || 'temp',
          email: authData.email || '',
          display_name: authData.google_user_data?.name || authData.email?.split('@')[0] || 'User',
          username: authData.email?.split('@')[0] || 'user',
          avatar_url: authData.google_user_data?.picture || undefined,
          bio: 'Welcome to Promorang!',
          banner_url: undefined,
          website_url: undefined,
          social_links: undefined,
          user_type: 'regular',
          xp_points: 100,
          level: 1,
          referral_code: 'TEMP' + Date.now().toString().slice(-4),
          referred_by: undefined,
          follower_count: 0,
          following_count: 0,
          total_earnings_usd: 0,
          promogem_balance: 0,
          points_balance: 25,
          keys_balance: 1,
          gems_balance: 0,
          gold_collected: 0,
          user_tier: 'free',
          points_streak_days: 0,
          last_activity_date: new Date().toISOString().split('T')[0],
          master_key_activated_at: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('Using temporary user data:', tempUser);
        setUserData(tempUser);
      } else {
        console.log('Setting valid user data:', {
          id: userData.id,
          email: userData.email,
          gems_balance: userData.gems_balance
        });
        setUserData(userData);
      }

      // Fetch wallets and transactions with error handling
      try {
        const sharedHeaders = buildAuthHeaders();
        const [walletsResponse, transactionsResponse] = await Promise.all([
          fetch('/api/users/wallets', { credentials: 'include', headers: sharedHeaders }),
          fetch('/api/users/transactions', { credentials: 'include', headers: sharedHeaders })
        ]);

        let walletsData = [];
        let transactionsData = [];

        if (walletsResponse.ok) {
          const walletsJson = await walletsResponse.json();
          // Handle both direct array and object with wallets property
          if (Array.isArray(walletsJson)) {
            walletsData = walletsJson;
          } else if (walletsJson && Array.isArray(walletsJson.wallets)) {
            walletsData = walletsJson.wallets;
          }
        }

        if (transactionsResponse.ok) {
          const transactionsJson = await transactionsResponse.json();
          // Handle both direct array and object with transactions property
          if (Array.isArray(transactionsJson)) {
            transactionsData = transactionsJson;
          } else if (transactionsJson && Array.isArray(transactionsJson.transactions)) {
            transactionsData = transactionsJson.transactions;
          }
        }

        setWallets(walletsData || []);
        setTransactions(transactionsData || []);

        console.log('Fetched additional data:', {
          wallets: walletsData.length,
          transactions: transactionsData.length
        });
      } catch (additionalDataError) {
        console.error('Error fetching wallets/transactions:', additionalDataError);
        setWallets([]);
        setTransactions([]);
      }

    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      // Don't redirect on general errors, just show empty state
      setUserData(null);
      setWallets([]);
      setTransactions([]);
    } finally {
      setLoading(false);
      console.log('fetchWalletData completed, loading set to false');
    }
  };

  const loadHoldings = async () => {
    setHoldingsLoading(true);
    const data = await getPortfolioHoldings();
    setHoldings(data);
    setHoldingsLoading(false);
  };

  const loadListings = async () => {
    setListingsLoading(true);
    const data = await fetchShareListings(true);
    setListings(data);
    setListingsLoading(false);
  };

  const loadOffers = async () => {
    setOffersLoading(true);
    const [sellerOffers, buyerOffers] = await Promise.all([
      fetchShareOffers('seller'),
      fetchShareOffers('buyer'),
    ]);
    setIncomingOffers(sellerOffers);
    setOutgoingOffers(buyerOffers);
    setOffersLoading(false);
  };

  const openListModal = (holding: ContentHolding) => {
    setSelectedHolding(holding);
    setListModalOpen(true);
  };

  const handleListingSuccess = () => {
    loadHoldings();
    loadListings();
    loadOffers();
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptShareOffer(offerId);
      await Promise.all([loadHoldings(), loadListings(), loadOffers()]);
    } catch (error) {
      console.error('Failed to accept offer:', error);
      alert(error instanceof Error ? error.message : 'Failed to accept offer');
    }
  };

  const usdWallet = wallets && wallets.length > 0 ? wallets.find(w => w.currency_type === 'USD') : null;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'task_payment':
      case 'referral_bonus':
      case 'staking_reward':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-pr-text-2" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Button handlers with comprehensive logging
  const handleBuyMoreGems = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Buy More Gems button clicked!');
    console.log('Current showGemStoreModal state:', showGemStoreModal);
    console.log('Current userData:', userData);
    setShowGemStoreModal(true);
    console.log('Setting showGemStoreModal to true');

    // Force re-render to ensure state change is detected
    setTimeout(() => {
      console.log('showGemStoreModal after timeout:', showGemStoreModal);
    }, 100);
  };

  const handleConvertCurrency = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Convert Currency button clicked!');
    console.log('Current showCurrencyModal state:', showCurrencyModal);
    setShowCurrencyModal(true);
    console.log('Setting showCurrencyModal to true');
  };

  const handleWithdrawGems = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Withdraw Gems button clicked!');
    console.log('Current showWithdrawalModal state:', showWithdrawalModal);
    setShowWithdrawalModal(true);
    console.log('Setting showWithdrawalModal to true');
  };

  const handleCloseGemStore = () => {
    console.log('Closing Gem Store Modal');
    setShowGemStoreModal(false);
  };

  const handleCloseCurrencyModal = () => {
    console.log('Closing Currency Modal');
    setShowCurrencyModal(false);
  };

  const handleCloseWithdrawalModal = () => {
    console.log('Closing Withdrawal Modal');
    setShowWithdrawalModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-pr-text-1">Wallet</h1>
        <p className="text-pr-text-2 mt-2">Manage your earnings and transactions</p>
      </div>

      {/* Currency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-6 h-6" />
              <span className="text-lg font-medium">Points</span>
            </div>
            <div className="w-8 h-8 bg-pr-surface-card/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">PTS</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">{userData?.points_balance?.toLocaleString() || '0'}</p>
            <p className="text-blue-100 text-sm">Earn from social actions</p>
          </div>
          <button
            onClick={handleConvertCurrency}
            className="w-full bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-colors"
          >
            Convert to Keys
          </button>
        </div>

        {/* Keys Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Key className="w-6 h-6" />
              <span className="text-lg font-medium">Keys</span>
            </div>
            <div className="w-8 h-8 bg-pr-surface-card/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">KEY</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">{userData?.keys_balance || '0'}</p>
            <p className="text-orange-100 text-sm">Apply for paid drops</p>
          </div>
          <button
            onClick={() => setShowMasterKeyModal(true)}
            className="w-full bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-colors"
          >
            Master Key Status
          </button>
        </div>

        {/* Gems Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Diamond className="w-6 h-6" />
              <span className="text-lg font-medium">Gems</span>
            </div>
            <div className="w-8 h-8 bg-pr-surface-card/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">GEM</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">{userData?.gems_balance || '0'}</p>
            <p className="text-purple-100 text-sm">Earn from completed drops</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleBuyMoreGems}
              className="bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors"
            >
              Buy More
            </button>
            <button
              onClick={handleConvertCurrency}
              className="bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors"
            >
              Convert
            </button>
            <button
              onClick={handleWithdrawGems}
              disabled={(userData?.gems_balance || 0) < 200}
              className="bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Gold Card */}
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6" />
              <span className="text-lg font-medium">Gold</span>
            </div>
            <div className="w-8 h-8 bg-pr-surface-card/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">AU</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">{userData?.gold_collected || '0'}</p>
            <p className="text-yellow-100 text-sm">Prestige currency</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowGoldShopModal(true)}
              className="bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors"
            >
              Gold Shop
            </button>
            <button
              onClick={() => setShowAchievementsModal(true)}
              className="bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors"
            >
              Achievements
            </button>
          </div>
        </div>
      </div>

      {/* Legacy USD Wallet (if exists) */}
      {usdWallet && usdWallet.balance > 0 && (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-lg font-medium">USD Balance</span>
            </div>
            <WalletIcon className="w-6 h-6 opacity-75" />
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold">${(usdWallet?.balance || 0).toFixed(2)}</p>
            <p className="text-green-100 text-sm">Available for withdrawal</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex-1 bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-colors">
              Withdraw
            </button>
            <button
              onClick={() => setShowPaymentPreferencesModal(true)}
              className="flex-1 bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-colors"
            >
              Payment Methods
            </button>
          </div>
        </div>
      )}

      {/* Staking Rewards Card */}
      <div className="bg-pr-surface-card rounded-xl p-6 shadow-sm border border-pr-surface-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-pr-text-1">Staking Rewards</h2>
          <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            12.5% APY
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-pr-text-1">0</p>
            <p className="text-sm text-pr-text-2">Staked PromoGems</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">0.00</p>
            <p className="text-sm text-pr-text-2">Pending Rewards</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">$0.00</p>
            <p className="text-sm text-pr-text-2">Total Earned</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-pr-surface-3">
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200">
            Start Staking PromoGems
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-pr-surface-card rounded-xl shadow-sm border border-pr-surface-3">
        <div className="border-b border-pr-surface-3">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 font-medium text-sm ${activeTab === 'overview'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-pr-text-2 hover:text-pr-text-1'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 border-b-2 font-medium text-sm ${activeTab === 'transactions'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-pr-text-2 hover:text-pr-text-1'
                }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Enhanced Analytics Overview */}
              <WalletAnalyticsOverview userData={userData} transactions={transactions} />
              <PortfolioHoldingsSection
                holdings={holdings}
                loading={holdingsLoading}
                onList={openListModal}
                onView={(holding) => navigate(`/portfolio/holdings/${holding.content_id}`)}
              />
              <ActiveListingsSection listings={listings} loading={listingsLoading} />
              <OffersSection
                incoming={incomingOffers}
                outgoing={outgoingOffers}
                loading={offersLoading}
                onAccept={handleAcceptOffer}
              />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-pr-text-1">Transaction History</h3>
                <button className="flex items-center space-x-2 px-4 py-2 border border-pr-surface-3 rounded-lg hover:bg-pr-surface-2 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>

              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pr-surface-card rounded-full flex items-center justify-center shadow-sm">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <p className="font-medium text-pr-text-1">
                            {transaction.description || transaction.transaction_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-pr-text-2">
                            {new Date(transaction.created_at).toLocaleDateString()} • {transaction.currency_type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getTransactionColor(transaction.amount)}`}>
                          {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-pr-text-2 capitalize">{transaction.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-pr-text-1 mb-2">No transactions yet</h3>
                    <p className="text-pr-text-2">Your transaction history will appear here once you start earning.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Debugger - shown when user data is null */}
      {!userData && <AuthDebugger />}

      {/* Modals */}
      <CurrencyConversionModal
        user={userData}
        isOpen={showCurrencyModal}
        onClose={handleCloseCurrencyModal}
        onSuccess={fetchWalletData}
      />

      <MasterKeyModal
        user={userData}
        isOpen={showMasterKeyModal}
        onClose={() => setShowMasterKeyModal(false)}
        onSuccess={fetchWalletData}
      />

      <GoldShopModal
        user={userData}
        isOpen={showGoldShopModal}
        onClose={() => setShowGoldShopModal(false)}
        onPurchase={fetchWalletData}
      />

      <WithdrawalModal
        user={userData}
        isOpen={showWithdrawalModal}
        onClose={handleCloseWithdrawalModal}
        onSuccess={fetchWalletData}
      />

      <ListShareModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        holding={selectedHolding}
        onSuccess={handleListingSuccess}
      />

      <PaymentPreferencesModal
        user={userData}
        isOpen={showPaymentPreferencesModal}
        onClose={() => setShowPaymentPreferencesModal(false)}
        onSuccess={fetchWalletData}
      />

      <GemStoreModal
        user={userData}
        isOpen={showGemStoreModal}
        onClose={handleCloseGemStore}
        onSuccess={fetchWalletData}
      />

      <AchievementsModal
        user={userData}
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </div>
  );
}
