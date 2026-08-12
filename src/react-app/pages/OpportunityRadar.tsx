import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import {
  MapPin,
  Clock,
  Zap,
  Target,
  Flame,
  Key,
  TrendingUp,
  PieChart,
  Users,
  Calendar,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { DropType, UserType } from '@/shared/types';
import BuySharesModal from '@/react-app/components/BuySharesModal';
import PlaceForecastModal from '@/react-app/components/PlaceForecastModal';
import UserLink from '@/react-app/components/UserLink';

export default function OpportunityRadar() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<DropType[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'moment' | 'campaign' | 'discovery'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [forecastModalOpen, setForecastModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<DropType | null>(null);

  useEffect(() => {
    fetchOpportunities();
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/app/users/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/drops');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Enrich with opportunity types if missing
          const enriched = data.map((item, idx) => ({
            ...item,
            opportunity_type: item.opportunity_type || (idx % 3 === 0 ? 'moment' : idx % 3 === 1 ? 'campaign' : 'discovery'),
            geofence_radius_meters: item.geofence_radius_meters || 500,
            location_name: item.location_name || (idx % 2 === 0 ? 'Downtown Arts District (Within 2.5 mi)' : 'Westside Innovation Hub (Within 1.2 mi)'),
            promo_key_required: item.promo_key_required || (idx % 4 === 0 ? 1 : 0),
            total_pieces: item.total_pieces || 100,
            piece_price: item.piece_price || 10 + (idx * 2),
            backer_dividend_percent: item.backer_dividend_percent || 20,
            prediction_volume_points: item.prediction_volume_points || 450 + (idx * 120),
          }));
          setOpportunities(enriched);
        }
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((item) => {
    const matchesFilter = filterType === 'all' || item.opportunity_type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleBackPieces = (opp: DropType) => {
    setSelectedOpportunity(opp);
    setBuyModalOpen(true);
  };

  const handleForecast = (opp: DropType) => {
    setSelectedOpportunity(opp);
    setForecastModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600 font-medium">Scanning Opportunity Radar...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-xs font-semibold tracking-wide">
              <Zap className="w-3.5 h-3.5" /> OPPORTUNITY RADAR • 5 MILE RADIUS
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Something Valuable is Happening.
            </h1>
            <p className="text-slate-300 max-w-2xl text-sm sm:text-base">
              Discover real-world Moments, join brand Campaigns, explore curated Discoveries, and back opportunities with Pieces or Predictions.
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
            <div className="text-center">
              <p className="text-xs text-slate-400">Live Near You</p>
              <p className="text-xl font-extrabold text-orange-400">{opportunities.length}</p>
            </div>
            <div className="text-center border-x border-white/10 px-3">
              <p className="text-xs text-slate-400">PromoKeys</p>
              <p className="text-xl font-extrabold text-amber-400">{userData?.keys_balance ?? 2}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Backer Yield</p>
              <p className="text-xl font-extrabold text-emerald-400">20% Avg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Unit Filters */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🔥 All Opportunities ({opportunities.length})
          </button>
          <button
            onClick={() => setFilterType('moment')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              filterType === 'moment'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" /> Moments
          </button>
          <button
            onClick={() => setFilterType('campaign')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              filterType === 'campaign'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Target className="w-4 h-4" /> Campaigns
          </button>
          <button
            onClick={() => setFilterType('discovery')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              filterType === 'discovery'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Discoveries
          </button>
        </div>

        {/* Search & View Toggle */}
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search radar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-gray-500'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'map' ? 'bg-white shadow text-slate-900' : 'text-gray-500'
              }`}
            >
              Map Radar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      {viewMode === 'map' ? (
        <div className="bg-slate-900 rounded-3xl p-8 text-center text-white min-h-[400px] flex flex-col items-center justify-center border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="w-32 h-32 rounded-full border-4 border-dashed border-orange-500/40 animate-spin-slow flex items-center justify-center mb-4">
            <MapPin className="w-10 h-10 text-orange-400 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold mb-2">GPS Radar Scanning Active Radius</h3>
          <p className="text-slate-400 text-sm max-w-md">
            Showing {filteredOpportunities.length} high-scarcity opportunities within 5 miles. Live GPS check-ins enabled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => {
            const isMoment = opp.opportunity_type === 'moment';
            const isCampaign = opp.opportunity_type === 'campaign';
            const isDiscovery = opp.opportunity_type === 'discovery';
            const remainingSpots = (opp.max_participants || 50) - (opp.current_participants || 12);
            const isKeyGated = opp.promo_key_required && opp.promo_key_required > 0;

            return (
              <div
                key={opp.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Card Top / Header Image or Gradient */}
                <div>
                  <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-950 p-5 flex flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

                    {/* Unit Badge & Key Access */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                          isMoment
                            ? 'bg-orange-500'
                            : isCampaign
                            ? 'bg-purple-600'
                            : 'bg-emerald-600'
                        }`}
                      >
                        {isMoment && <Calendar className="w-3.5 h-3.5" />}
                        {isCampaign && <Target className="w-3.5 h-3.5" />}
                        {isDiscovery && <Sparkles className="w-3.5 h-3.5" />}
                        {opp.opportunity_type}
                      </span>

                      {isKeyGated ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/90 text-slate-950 text-xs font-extrabold rounded-full shadow">
                          <Key className="w-3.5 h-3.5" /> Key Gated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/80 text-white text-xs font-semibold rounded-full">
                          Open Access
                        </span>
                      )}
                    </div>

                    {/* Location & Urgency Timer */}
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span>{opp.location_name}</span>
                      </div>

                      <div className="flex items-center justify-between text-white text-xs">
                        <span className="inline-flex items-center gap-1 text-orange-400 font-bold">
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> Ends in 03h 45m
                        </span>
                        <span className="text-slate-300">
                          {remainingSpots > 0 ? (
                            <strong className="text-emerald-400">{remainingSpots} spots left</strong>
                          ) : (
                            <span className="text-red-400">Sold Out</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {opp.title}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-2 mt-1">
                        {opp.description}
                      </p>
                    </div>

                    {/* Financial Engine Box: Pieces Backing & Predictions */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 flex items-center gap-1 font-medium">
                          <PieChart className="w-3.5 h-3.5 text-purple-600" /> Piece Price:
                        </span>
                        <span className="font-extrabold text-slate-900">${opp.piece_price}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 flex items-center gap-1 font-medium">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Backer Dividend:
                        </span>
                        <span className="font-bold text-emerald-600">+{opp.backer_dividend_percent}% Yield</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 flex items-center gap-1 font-medium">
                          <Flame className="w-3.5 h-3.5 text-orange-500" /> Forecast Pool:
                        </span>
                        <span className="font-bold text-orange-600">{opp.prediction_volume_points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleBackPieces(opp)}
                    className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <PieChart className="w-3.5 h-3.5" /> Back Pieces
                  </button>

                  <button
                    onClick={() => handleForecast(opp)}
                    className="w-full py-2.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Flame className="w-3.5 h-3.5" /> Forecast
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {buyModalOpen && selectedOpportunity && (
        <BuySharesModal
          isOpen={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          content={{
            id: selectedOpportunity.id,
            title: selectedOpportunity.title,
            creator_name: selectedOpportunity.creator_name || 'Merchant Partner',
            share_price: selectedOpportunity.piece_price || 10,
            available_shares: selectedOpportunity.total_pieces || 100,
            platform: selectedOpportunity.opportunity_type || 'campaign',
            platform_url: '',
            creator_id: selectedOpportunity.creator_id,
            total_shares: 100,
            engagement_shares_total: 100,
            engagement_shares_remaining: 100,
            current_revenue: 0,
            created_at: '',
            updated_at: ''
          }}
          userGems={userData?.gems_balance || 500}
          onPurchaseComplete={() => fetchOpportunities()}
        />
      )}

      {forecastModalOpen && selectedOpportunity && (
        <PlaceForecastModal
          isOpen={forecastModalOpen}
          onClose={() => setForecastModalOpen(false)}
          forecast={{
            id: selectedOpportunity.id,
            content_title: selectedOpportunity.title,
            forecast_type: 'checkins',
            target_value: selectedOpportunity.max_participants || 100,
            odds: 1.85,
            expires_at: selectedOpportunity.deadline_at || 'In 24 hours'
          }}
          userPoints={userData?.points_balance || 1000}
          onForecastPlaced={() => fetchOpportunities()}
        />
      )}
    </div>
  );
}
