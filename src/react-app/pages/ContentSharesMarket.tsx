import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Cpu,
  Shirt,
  Music,
  Laugh,
  Sparkles,
  Briefcase,
  Gamepad2,
  Dumbbell,
  UtensilsCrossed,
  Plane,
  GraduationCap,
  Heart,
  ChevronRight,
  Eye,
  Users,
  Clock,
  Zap,
  Target,
  Timer,
  DollarSign,
  Layers,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
}

interface CategoryIndex {
  category_id: string;
  category_name: string;
  category_slug: string;
  category_color: string;
  index_value: number;
  change_percent: number;
  total_volume: number;
}

interface MarketOverview {
  index_value: number;
  change_percent: number;
  total_market_cap: number;
  total_volume: number;
  active_shares: number;
  top_gainers: Mover[];
  top_losers: Mover[];
  most_traded: Mover[];
}

interface Mover {
  content_id: string;
  title: string;
  change_percent: number;
  price: number;
  volume?: number;
}

interface ContentShare {
  id: string;
  content_id: string;
  title: string;
  creator_name: string;
  creator_avatar: string;
  platform: string;
  category_name: string;
  category_slug: string;
  current_price: number;
  previous_close: number;
  change_24h: number;
  change_7d: number;
  volume_24h: number;
  market_cap: number;
  total_shares: number;
  available_shares: number;
  holder_count: number;
  day_high: number;
  day_low: number;
  all_time_high: number;
  thumbnail?: string;
}

interface OHLCData {
  period_start: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface SocialForecast {
  id: string;
  content_id: string;
  content_title: string;
  content_thumbnail?: string;
  creator_name: string;
  platform: string;
  forecast_type: string;
  target_value: number;
  current_value: number;
  odds: number;
  pool_size: number;
  participants: number;
  expires_at: string;
  status: string;
  volume: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Shirt,
  Music,
  Laugh,
  Sparkles,
  Briefcase,
  Gamepad2,
  Dumbbell,
  UtensilsCrossed,
  Plane,
  GraduationCap,
  Heart,
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

const formatVolume = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

// Mini sparkline chart component
const MiniChart = ({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) => {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Candlestick chart component
const CandlestickChart = ({ 
  data, 
  height = 200,
  showVolume = true 
}: { 
  data: OHLCData[]; 
  height?: number;
  showVolume?: boolean;
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-pr-text-2">
        <Activity className="w-8 h-8 mr-2 opacity-50" />
        <span>No price data available</span>
      </div>
    );
  }

  const chartHeight = showVolume ? height - 40 : height;
  const volumeHeight = 35;
  const width = 100;
  const candleWidth = Math.max(2, (width / data.length) * 0.6);
  const gap = (width / data.length) * 0.4;

  const prices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const volumes = data.map(d => d.volume);
  const maxVolume = Math.max(...volumes) || 1;

  const getY = (price: number) => chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  const getVolumeHeight = (volume: number) => (volume / maxVolume) * volumeHeight;

  return (
    <svg width="100%" height={height + (showVolume ? volumeHeight + 10 : 0)} viewBox={`0 0 ${width} ${height + (showVolume ? volumeHeight + 10 : 0)}`} preserveAspectRatio="none">
      {/* Candlesticks */}
      {data.map((candle, index) => {
        const x = (index / data.length) * width + gap / 2;
        const isGreen = candle.close >= candle.open;
        const color = isGreen ? '#10B981' : '#EF4444';
        const bodyTop = getY(Math.max(candle.open, candle.close));
        const bodyBottom = getY(Math.min(candle.open, candle.close));
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);

        return (
          <g key={index}>
            {/* Wick */}
            <line
              x1={x + candleWidth / 2}
              y1={getY(candle.high)}
              x2={x + candleWidth / 2}
              y2={getY(candle.low)}
              stroke={color}
              strokeWidth="1"
            />
            {/* Body */}
            <rect
              x={x}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={color}
              rx="0.5"
            />
          </g>
        );
      })}

      {/* Volume bars */}
      {showVolume && data.map((candle, index) => {
        const x = (index / data.length) * width + gap / 2;
        const isGreen = candle.close >= candle.open;
        const color = isGreen ? '#10B98150' : '#EF444450';
        const barHeight = getVolumeHeight(candle.volume);

        return (
          <rect
            key={`vol-${index}`}
            x={x}
            y={height + 10 + volumeHeight - barHeight}
            width={candleWidth}
            height={barHeight}
            fill={color}
          />
        );
      })}
    </svg>
  );
};

// Category card component
const CategoryCard = ({ 
  category, 
  index: categoryIndex,
  onClick 
}: { 
  category: Category; 
  index?: CategoryIndex;
  onClick: () => void;
}) => {
  const IconComponent = ICON_MAP[category.icon] || BarChart3;
  const change = categoryIndex?.change_percent ?? 0;
  const isPositive = change >= 0;

  return (
    <button
      onClick={onClick}
      className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3 hover:border-blue-500/50 transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <IconComponent className="w-5 h-5" style={{ color: category.color }} />
        </div>
        <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <h3 className="font-semibold text-pr-text-1 group-hover:text-blue-500 transition-colors">
        {category.name}
      </h3>
      <p className="text-xs text-pr-text-2 mt-1 line-clamp-2">{category.description}</p>
      {categoryIndex && (
        <div className="mt-3 pt-3 border-t border-pr-surface-3 flex justify-between text-xs text-pr-text-2">
          <span>Index: {categoryIndex.index_value.toFixed(0)}</span>
          <span>Vol: {formatVolume(categoryIndex.total_volume)}</span>
        </div>
      )}
    </button>
  );
};

// Share row component for the table
const ShareRow = ({ share, onClick }: { share: ContentShare; onClick: () => void }) => {
  const isPositive = share.change_24h >= 0;

  return (
    <tr 
      onClick={onClick}
      className="border-b border-pr-surface-3 hover:bg-pr-surface-2 cursor-pointer transition-colors"
    >
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          <img
            src={share.thumbnail || share.creator_avatar}
            alt={share.title}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-pr-text-1 line-clamp-1">{share.title}</p>
            <p className="text-xs text-pr-text-2">{share.creator_name} • {share.platform}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="font-semibold text-pr-text-1">${share.current_price.toFixed(2)}</span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className={`flex items-center justify-end font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(share.change_24h).toFixed(2)}%
        </span>
      </td>
      <td className="py-3 px-4 text-right text-pr-text-2">
        {formatVolume(share.volume_24h)}
      </td>
      <td className="py-3 px-4 text-right text-pr-text-2">
        {formatCurrency(share.market_cap)}
      </td>
      <td className="py-3 px-4 text-right text-pr-text-2">
        <div className="flex items-center justify-end space-x-1">
          <Users className="w-3 h-3" />
          <span>{share.holder_count}</span>
        </div>
      </td>
    </tr>
  );
};

// Mover card component
const MoverCard = ({ 
  mover, 
  type 
}: { 
  mover: Mover; 
  type: 'gainer' | 'loser' | 'traded';
}) => {
  const isGainer = type === 'gainer';
  const isLoser = type === 'loser';

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-pr-surface-2 transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-pr-text-1 text-sm truncate">{mover.title}</p>
        <p className="text-xs text-pr-text-2">${mover.price.toFixed(2)}</p>
      </div>
      <div className={`text-right ${isGainer ? 'text-green-500' : isLoser ? 'text-red-500' : 'text-pr-text-2'}`}>
        {type === 'traded' ? (
          <span className="text-sm font-medium">{formatVolume(mover.volume || 0)}</span>
        ) : (
          <span className="flex items-center text-sm font-medium">
            {isGainer ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(mover.change_percent).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

// Forecast card component
const ForecastCard = ({ forecast, onClick }: { forecast: SocialForecast; onClick: () => void }) => {
  const timeLeft = new Date(forecast.expires_at).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const progress = forecast.target_value > 0 ? (forecast.current_value / forecast.target_value) * 100 : 0;
  
  return (
    <div 
      onClick={onClick}
      className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3 hover:border-blue-500/50 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium text-purple-500 uppercase">{forecast.forecast_type}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          forecast.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
        }`}>
          {forecast.status}
        </span>
      </div>
      
      <h3 className="font-medium text-pr-text-1 mb-1 line-clamp-1">{forecast.content_title}</h3>
      <p className="text-xs text-pr-text-2 mb-3">{forecast.creator_name} • {forecast.platform}</p>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-pr-text-2">Progress</span>
          <span className="text-pr-text-1">{forecast.current_value.toLocaleString()} / {forecast.target_value.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-pr-surface-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-pr-text-2">Odds</p>
          <p className="font-semibold text-pr-text-1">{forecast.odds.toFixed(2)}x</p>
        </div>
        <div>
          <p className="text-xs text-pr-text-2">Pool</p>
          <p className="font-semibold text-pr-text-1">${forecast.pool_size.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-xs text-pr-text-2">Time Left</p>
          <p className="font-semibold text-pr-text-1 flex items-center justify-center gap-1">
            <Timer className="w-3 h-3" />
            {hoursLeft}h
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ContentSharesMarket() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'shares' | 'forecasts'>(
    searchParams.get('tab') === 'forecasts' ? 'forecasts' : 'shares'
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIndices, setCategoryIndices] = useState<CategoryIndex[]>([]);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [shares, setShares] = useState<ContentShare[]>([]);
  const [forecasts, setForecasts] = useState<SocialForecast[]>([]);
  const [indexHistory, setIndexHistory] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'price' | 'market_cap'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const [overviewRes, categoriesRes, indexHistoryRes, forecastsRes] = await Promise.all([
          fetch('/api/market/overview'),
          fetch('/api/market/categories'),
          fetch(`/api/market/index/history?period=${timeframe}`),
          fetch('/api/social-forecasts'),
        ]);

        if (overviewRes.ok) {
          const data = await overviewRes.json();
          setMarketOverview(data.market);
          setCategoryIndices(data.category_indices || []);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }

        if (indexHistoryRes.ok) {
          const data = await indexHistoryRes.json();
          setIndexHistory(data.history || []);
        }

        if (forecastsRes.ok) {
          const data = await forecastsRes.json();
          setForecasts(data.forecasts || data || []);
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [timeframe]);

  // Fetch category shares when category is selected
  useEffect(() => {
    const fetchCategoryShares = async () => {
      if (!selectedCategory) {
        // Fetch all shares or movers
        try {
          const res = await fetch('/api/market/movers');
          if (res.ok) {
            const data = await res.json();
            // Combine gainers and losers for display
            const allShares = [
              ...(data.gainers || []).map((m: Mover) => ({
                id: m.content_id,
                content_id: m.content_id,
                title: m.title,
                current_price: m.price,
                change_24h: m.change_percent,
                volume_24h: m.volume || 0,
              })),
            ];
            setShares(allShares as ContentShare[]);
          }
        } catch (error) {
          console.error('Failed to fetch movers:', error);
        }
        return;
      }

      try {
        const res = await fetch(`/api/market/category/${selectedCategory}?sort=${sortBy}&order=${sortOrder}`);
        if (res.ok) {
          const data = await res.json();
          setShares(data.shares || []);
        }
      } catch (error) {
        console.error('Failed to fetch category shares:', error);
      }
    };

    fetchCategoryShares();
  }, [selectedCategory, sortBy, sortOrder]);

  // Handle category selection
  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    setSearchParams({ category: slug });
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setShares(data.results || []);
        setSelectedCategory(null);
        setSearchParams({});
      }
    } catch (error) {
      console.error('Failed to search:', error);
    }
  };

  // Sort shares
  const sortedShares = useMemo(() => {
    return [...shares].sort((a, b) => {
      let aVal = 0, bVal = 0;
      switch (sortBy) {
        case 'volume':
          aVal = a.volume_24h || 0;
          bVal = b.volume_24h || 0;
          break;
        case 'change':
          aVal = a.change_24h || 0;
          bVal = b.change_24h || 0;
          break;
        case 'price':
          aVal = a.current_price || 0;
          bVal = b.current_price || 0;
          break;
        case 'market_cap':
          aVal = a.market_cap || 0;
          bVal = b.market_cap || 0;
          break;
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [shares, sortBy, sortOrder]);

  // Get category index for a category
  const getCategoryIndex = (categoryId: string) => {
    return categoryIndices.find(idx => idx.category_id === categoryId);
  };

  // Market index change indicator
  const indexChange = marketOverview?.change_percent ?? 0;
  const isMarketUp = indexChange >= 0;

  // Handle tab change
  const handleTabChange = (tab: 'shares' | 'forecasts') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-pr-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1">Market</h1>
            <p className="text-pr-text-2 mt-1">Explore content shares and social forecasts</p>
          </div>
          
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pr-text-2" />
              <input
                type="text"
                placeholder={activeTab === 'shares' ? "Search shares..." : "Search forecasts..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-pr-surface-1 border border-pr-surface-3 rounded-lg text-pr-text-1 placeholder-pr-text-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => navigate('/invest')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">My Portfolio</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-pr-surface-1 rounded-xl p-1 mb-6 w-fit border border-pr-surface-3">
          <button
            onClick={() => handleTabChange('shares')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'shares'
                ? 'bg-blue-600 text-white'
                : 'text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-2'
            }`}
          >
            <Layers className="w-4 h-4" />
            Content Shares
          </button>
          <button
            onClick={() => handleTabChange('forecasts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'forecasts'
                ? 'bg-purple-600 text-white'
                : 'text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-2'
            }`}
          >
            <Target className="w-4 h-4" />
            Social Forecasts
            {forecasts.length > 0 && (
              <span className="bg-purple-500/20 text-purple-400 text-xs px-1.5 py-0.5 rounded-full">
                {forecasts.filter(f => f.status === 'active').length}
              </span>
            )}
          </button>
        </div>

        {/* Content Shares Tab */}
        {activeTab === 'shares' && (
          <>
        {/* Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Index Chart */}
          <div className="lg:col-span-2 bg-pr-surface-1 rounded-xl p-6 border border-pr-surface-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-pr-text-1">Promorang Content Index</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-bold text-pr-text-1">
                    {marketOverview?.index_value?.toFixed(2) || '1,000.00'}
                  </span>
                  <span className={`flex items-center text-sm font-medium ${isMarketUp ? 'text-green-500' : 'text-red-500'}`}>
                    {isMarketUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {isMarketUp ? '+' : ''}{indexChange.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              {/* Timeframe selector */}
              <div className="flex items-center gap-1 bg-pr-surface-2 rounded-lg p-1">
                {(['1h', '4h', '1d', '1w'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'text-pr-text-2 hover:text-pr-text-1'
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Candlestick Chart */}
            <div className="h-64">
              <CandlestickChart data={indexHistory} height={200} showVolume={true} />
            </div>
            
            {/* Market Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-pr-surface-3">
              <div>
                <p className="text-xs text-pr-text-2">Market Cap</p>
                <p className="font-semibold text-pr-text-1">{formatCurrency(marketOverview?.total_market_cap || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-pr-text-2">24h Volume</p>
                <p className="font-semibold text-pr-text-1">{formatVolume(marketOverview?.total_volume || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-pr-text-2">Active Shares</p>
                <p className="font-semibold text-pr-text-1">{marketOverview?.active_shares || 0}</p>
              </div>
            </div>
          </div>

          {/* Top Movers */}
          <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden">
            <div className="p-4 border-b border-pr-surface-3">
              <h3 className="font-semibold text-pr-text-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Top Movers
              </h3>
            </div>
            
            <div className="divide-y divide-pr-surface-3">
              {/* Gainers */}
              <div className="p-3">
                <p className="text-xs font-medium text-green-500 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Top Gainers
                </p>
                {(marketOverview?.top_gainers || []).slice(0, 3).map((mover, i) => (
                  <MoverCard key={i} mover={mover} type="gainer" />
                ))}
              </div>
              
              {/* Losers */}
              <div className="p-3">
                <p className="text-xs font-medium text-red-500 mb-2 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Top Losers
                </p>
                {(marketOverview?.top_losers || []).slice(0, 3).map((mover, i) => (
                  <MoverCard key={i} mover={mover} type="loser" />
                ))}
              </div>
              
              {/* Most Traded */}
              <div className="p-3">
                <p className="text-xs font-medium text-pr-text-2 mb-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Most Traded
                </p>
                {(marketOverview?.most_traded || []).slice(0, 3).map((mover, i) => (
                  <MoverCard key={i} mover={mover} type="traded" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-pr-text-1">Browse by Category</h2>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchParams({});
              }}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={getCategoryIndex(category.id)}
                onClick={() => handleCategoryClick(category.slug)}
              />
            ))}
          </div>
        </div>

        {/* Shares Table */}
        <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden">
          <div className="p-4 border-b border-pr-surface-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="font-semibold text-pr-text-1">
              {selectedCategory 
                ? `${categories.find(c => c.slug === selectedCategory)?.name || 'Category'} Shares`
                : 'All Content Shares'
              }
            </h3>
            
            {/* Sort controls */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-pr-text-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-pr-surface-2 border border-pr-surface-3 rounded-lg px-3 py-1.5 text-sm text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="volume">Volume</option>
                <option value="change">24h Change</option>
                <option value="price">Price</option>
                <option value="market_cap">Market Cap</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1.5 bg-pr-surface-2 border border-pr-surface-3 rounded-lg hover:bg-pr-surface-3 transition-colors"
              >
                {sortOrder === 'desc' ? (
                  <ArrowDownRight className="w-4 h-4 text-pr-text-2" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-pr-text-2" />
                )}
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sortedShares.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-pr-text-2">
              <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
              <p>No shares found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pr-surface-2 text-xs text-pr-text-2 uppercase">
                  <tr>
                    <th className="py-3 px-4 text-left">Content</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">24h Change</th>
                    <th className="py-3 px-4 text-right">Volume</th>
                    <th className="py-3 px-4 text-right">Market Cap</th>
                    <th className="py-3 px-4 text-right">Holders</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedShares.map((share) => (
                    <ShareRow
                      key={share.id}
                      share={share}
                      onClick={() => navigate(`/invest?content=${share.content_id}`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}

        {/* Forecasts Tab */}
        {activeTab === 'forecasts' && (
          <div className="space-y-6">
            {/* Forecasts Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3">
                <p className="text-xs text-pr-text-2 mb-1">Active Forecasts</p>
                <p className="text-2xl font-bold text-pr-text-1">{forecasts.filter(f => f.status === 'active').length}</p>
              </div>
              <div className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3">
                <p className="text-xs text-pr-text-2 mb-1">Total Pool Size</p>
                <p className="text-2xl font-bold text-pr-text-1">
                  ${forecasts.reduce((sum, f) => sum + (f.pool_size || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3">
                <p className="text-xs text-pr-text-2 mb-1">Total Participants</p>
                <p className="text-2xl font-bold text-pr-text-1">
                  {forecasts.reduce((sum, f) => sum + (f.participants || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3">
                <p className="text-xs text-pr-text-2 mb-1">Avg Odds</p>
                <p className="text-2xl font-bold text-pr-text-1">
                  {forecasts.length > 0 
                    ? (forecasts.reduce((sum, f) => sum + (f.odds || 0), 0) / forecasts.length).toFixed(2)
                    : '0.00'}x
                </p>
              </div>
            </div>

            {/* Forecasts Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-pr-text-1">Active Forecasts</h2>
                <div className="flex items-center gap-2">
                  <select
                    className="bg-pr-surface-1 border border-pr-surface-3 rounded-lg px-3 py-1.5 text-sm text-pr-text-1"
                    defaultValue="all"
                  >
                    <option value="all">All Types</option>
                    <option value="likes">Likes</option>
                    <option value="views">Views</option>
                    <option value="followers">Followers</option>
                    <option value="comments">Comments</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : forecasts.length === 0 ? (
                <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 p-12 text-center">
                  <Target className="w-12 h-12 text-pr-text-2 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-pr-text-1 mb-2">No Active Forecasts</h3>
                  <p className="text-pr-text-2 mb-4">Be the first to create a forecast on content performance</p>
                  <button
                    onClick={() => navigate('/invest')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Forecast
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {forecasts.map((forecast) => (
                    <ForecastCard
                      key={forecast.id}
                      forecast={forecast}
                      onClick={() => navigate(`/invest?forecast=${forecast.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
