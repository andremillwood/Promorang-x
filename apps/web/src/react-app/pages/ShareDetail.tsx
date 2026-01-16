import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  StarOff,
  Share2,
  Bell,
  BellOff,
  ExternalLink,
  Users,
  Activity,
  Clock,
  BarChart3,
  DollarSign,
  Layers,
  Info,
  ShoppingCart,
  Wallet,
} from 'lucide-react';

interface ShareStats {
  content_id: string;
  current_price: number;
  previous_close: number;
  day_open: number;
  day_high: number;
  day_low: number;
  week_high: number;
  week_low: number;
  all_time_high: number;
  all_time_low: number;
  total_shares: number;
  available_shares: number;
  market_cap: number;
  volume_24h: number;
  volume_7d: number;
  trade_count_24h: number;
  change_24h: number;
  change_7d: number;
  change_30d: number;
  holder_count: number;
}

interface ContentInfo {
  id: string;
  title: string;
  description: string;
  creator_name: string;
  creator_avatar: string;
  creator_username: string;
  platform: string;
  platform_url: string;
  media_url: string;
  category_name: string;
  category_slug: string;
  created_at: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
}

interface OHLCData {
  period_start: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Trade {
  id: string;
  quantity: number;
  price_per_share: number;
  total_value: number;
  trade_type: string;
  executed_at: string;
}

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

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Full candlestick chart with interactive features
const FullCandlestickChart = ({ 
  data,
  height = 300,
}: { 
  data: OHLCData[];
  height?: number;
}) => {
  const [hoveredCandle, setHoveredCandle] = useState<OHLCData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-pr-text-2">
        <Activity className="w-8 h-8 mr-2 opacity-50" />
        <span>No price data available</span>
      </div>
    );
  }

  const chartHeight = height - 60; // Leave room for volume
  const volumeHeight = 50;
  const padding = { top: 20, right: 60, bottom: 10, left: 10 };
  
  const prices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;
  const priceRange = maxPrice - minPrice || 1;

  const volumes = data.map(d => d.volume);
  const maxVolume = Math.max(...volumes) || 1;

  const getY = (price: number) => padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  const getVolumeHeight = (volume: number) => (volume / maxVolume) * volumeHeight;

  const candleWidth = Math.max(4, (100 - padding.left - padding.right) / data.length * 0.7);
  const gap = (100 - padding.left - padding.right) / data.length;

  // Price levels for grid
  const priceLevels = Array.from({ length: 5 }, (_, i) => minPrice + (priceRange / 4) * i);

  return (
    <div className="relative">
      <svg 
        width="100%" 
        height={height + volumeHeight + 20} 
        viewBox={`0 0 100 ${height + volumeHeight + 20}`} 
        preserveAspectRatio="none"
        className="overflow-visible"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const index = Math.floor((x - padding.left) / gap);
          if (index >= 0 && index < data.length) {
            setHoveredCandle(data[index]);
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }
        }}
        onMouseLeave={() => setHoveredCandle(null)}
      >
        {/* Grid lines */}
        {priceLevels.map((price, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={getY(price)}
              x2={100 - padding.right}
              y2={getY(price)}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeDasharray="2,2"
            />
            <text
              x={100 - padding.right + 2}
              y={getY(price)}
              fontSize="3"
              fill="currentColor"
              fillOpacity="0.5"
              dominantBaseline="middle"
            >
              ${price.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Candlesticks */}
        {data.map((candle, index) => {
          const x = padding.left + index * gap + (gap - candleWidth) / 2;
          const isGreen = candle.close >= candle.open;
          const color = isGreen ? '#10B981' : '#EF4444';
          const bodyTop = getY(Math.max(candle.open, candle.close));
          const bodyBottom = getY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(0.5, bodyBottom - bodyTop);

          return (
            <g key={index} className="cursor-pointer">
              {/* Wick */}
              <line
                x1={x + candleWidth / 2}
                y1={getY(candle.high)}
                x2={x + candleWidth / 2}
                y2={getY(candle.low)}
                stroke={color}
                strokeWidth="0.3"
              />
              {/* Body */}
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={color}
                rx="0.2"
              />
            </g>
          );
        })}

        {/* Volume bars */}
        {data.map((candle, index) => {
          const x = padding.left + index * gap + (gap - candleWidth) / 2;
          const isGreen = candle.close >= candle.open;
          const color = isGreen ? '#10B98140' : '#EF444440';
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

        {/* Volume label */}
        <text
          x={padding.left}
          y={height + 8}
          fontSize="2.5"
          fill="currentColor"
          fillOpacity="0.5"
        >
          Volume
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredCandle && (
        <div 
          className="absolute bg-pr-surface-1 border border-pr-surface-3 rounded-lg p-3 shadow-lg z-10 pointer-events-none"
          style={{ 
            left: Math.min(mousePos.x + 10, window.innerWidth - 200),
            top: mousePos.y - 100,
          }}
        >
          <p className="text-xs text-pr-text-2 mb-2">{formatDate(hoveredCandle.period_start)}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-pr-text-2">Open:</span>
            <span className="text-pr-text-1 font-medium">${hoveredCandle.open.toFixed(2)}</span>
            <span className="text-pr-text-2">High:</span>
            <span className="text-green-500 font-medium">${hoveredCandle.high.toFixed(2)}</span>
            <span className="text-pr-text-2">Low:</span>
            <span className="text-red-500 font-medium">${hoveredCandle.low.toFixed(2)}</span>
            <span className="text-pr-text-2">Close:</span>
            <span className="text-pr-text-1 font-medium">${hoveredCandle.close.toFixed(2)}</span>
            <span className="text-pr-text-2">Volume:</span>
            <span className="text-pr-text-1 font-medium">{formatVolume(hoveredCandle.volume)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Trade modal component
const TradeModal = ({
  isOpen,
  onClose,
  content,
  stats,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: ContentInfo | null;
  stats: ShareStats | null;
  mode: 'buy' | 'sell';
}) => {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(stats?.current_price || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !content || !stats) return null;

  const currentPrice = stats.current_price;
  const totalCost = orderType === 'market' ? quantity * currentPrice : quantity * limitPrice;
  const maxBuyable = Math.floor(1000 / currentPrice); // Assume $1000 balance
  const maxSellable = 50; // Assume user owns 50 shares

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error('Trade failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-pr-surface-1 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-pr-surface-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-pr-text-1">
              {mode === 'buy' ? 'Buy' : 'Sell'} Shares
            </h2>
            <button onClick={onClose} className="text-pr-text-2 hover:text-pr-text-1">
              ✕
            </button>
          </div>
          <p className="text-sm text-pr-text-2 mt-1">{content.title}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Current Price */}
          <div className="bg-pr-surface-2 rounded-lg p-4">
            <p className="text-sm text-pr-text-2">Current Price</p>
            <p className="text-2xl font-bold text-pr-text-1">${currentPrice.toFixed(2)}</p>
            <p className={`text-sm ${stats.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.change_24h >= 0 ? '+' : ''}{stats.change_24h.toFixed(2)}% today
            </p>
          </div>

          {/* Order Type */}
          <div>
            <label className="text-sm font-medium text-pr-text-1 block mb-2">Order Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  orderType === 'market'
                    ? 'bg-blue-600 text-white'
                    : 'bg-pr-surface-2 text-pr-text-2 hover:bg-pr-surface-3'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  orderType === 'limit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-pr-surface-2 text-pr-text-2 hover:bg-pr-surface-3'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          {/* Limit Price (if limit order) */}
          {orderType === 'limit' && (
            <div>
              <label className="text-sm font-medium text-pr-text-1 block mb-2">Limit Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pr-text-2">$</span>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 bg-pr-surface-2 border border-pr-surface-3 rounded-lg text-pr-text-1"
                />
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium text-pr-text-1 block mb-2">Quantity</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-pr-surface-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-3"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={mode === 'buy' ? maxBuyable : maxSellable}
                className="flex-1 text-center py-2 bg-pr-surface-2 border border-pr-surface-3 rounded-lg text-pr-text-1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-pr-surface-2 rounded-lg text-pr-text-1 hover:bg-pr-surface-3"
              >
                +
              </button>
            </div>
            <p className="text-xs text-pr-text-2 mt-1">
              Max: {mode === 'buy' ? maxBuyable : maxSellable} shares
            </p>
          </div>

          {/* Total */}
          <div className="bg-pr-surface-2 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-pr-text-2">Total {mode === 'buy' ? 'Cost' : 'Proceeds'}</span>
              <span className="text-xl font-bold text-pr-text-1">${totalCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              mode === 'buy'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50`}
          >
            {isSubmitting ? 'Processing...' : `${mode === 'buy' ? 'Buy' : 'Sell'} ${quantity} Share${quantity > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ShareDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<ContentInfo | null>(null);
  const [stats, setStats] = useState<ShareStats | null>(null);
  const [priceHistory, setPriceHistory] = useState<OHLCData[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [hasAlerts, setHasAlerts] = useState(false);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell' | null>(null);

  useEffect(() => {
    const fetchShareData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [contentRes, historyRes] = await Promise.all([
          fetch(`/api/content/${id}`),
          fetch(`/api/market/shares/${id}/history?period=${timeframe}`),
        ]);

        if (contentRes.ok) {
          const data = await contentRes.json();
          setContent(data.content || data);
          
          // Mock stats for now
          setStats({
            content_id: id,
            current_price: data.content?.share_price || 15.50,
            previous_close: 14.80,
            day_open: 14.90,
            day_high: 16.20,
            day_low: 14.50,
            week_high: 18.00,
            week_low: 12.50,
            all_time_high: 25.00,
            all_time_low: 5.00,
            total_shares: 10000,
            available_shares: 2500,
            market_cap: 155000,
            volume_24h: 12500,
            volume_7d: 85000,
            trade_count_24h: 145,
            change_24h: 4.73,
            change_7d: 12.5,
            change_30d: 28.3,
            holder_count: 234,
          });
        }

        if (historyRes.ok) {
          const data = await historyRes.json();
          setPriceHistory(data.history || []);
        }

        // Mock recent trades
        setRecentTrades([
          { id: '1', quantity: 25, price_per_share: 15.50, total_value: 387.50, trade_type: 'market', executed_at: new Date(Date.now() - 5 * 60000).toISOString() },
          { id: '2', quantity: 10, price_per_share: 15.45, total_value: 154.50, trade_type: 'limit', executed_at: new Date(Date.now() - 15 * 60000).toISOString() },
          { id: '3', quantity: 50, price_per_share: 15.40, total_value: 770.00, trade_type: 'market', executed_at: new Date(Date.now() - 30 * 60000).toISOString() },
          { id: '4', quantity: 15, price_per_share: 15.35, total_value: 230.25, trade_type: 'limit', executed_at: new Date(Date.now() - 45 * 60000).toISOString() },
          { id: '5', quantity: 100, price_per_share: 15.30, total_value: 1530.00, trade_type: 'market', executed_at: new Date(Date.now() - 60 * 60000).toISOString() },
        ]);
      } catch (error) {
        console.error('Failed to fetch share data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShareData();
  }, [id, timeframe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pr-surface-2 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!content || !stats) {
    return (
      <div className="min-h-screen bg-pr-surface-2 flex flex-col items-center justify-center">
        <BarChart3 className="w-16 h-16 text-pr-text-2 mb-4" />
        <h2 className="text-xl font-semibold text-pr-text-1">Share not found</h2>
        <button
          onClick={() => navigate('/market')}
          className="mt-4 text-blue-500 hover:text-blue-600"
        >
          Back to Market
        </button>
      </div>
    );
  }

  const isPositive = stats.change_24h >= 0;

  return (
    <div className="min-h-screen bg-pr-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-pr-surface-1 rounded-lg hover:bg-pr-surface-3 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-pr-text-1" />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <img
                src={content.media_url || content.creator_avatar}
                alt={content.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-pr-text-1">{content.title}</h1>
                <p className="text-sm text-pr-text-2">
                  {content.creator_name} • {content.platform}
                  {content.category_name && ` • ${content.category_name}`}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWatchlisted(!isWatchlisted)}
              className={`p-2 rounded-lg transition-colors ${
                isWatchlisted ? 'bg-yellow-500/20 text-yellow-500' : 'bg-pr-surface-1 text-pr-text-2 hover:bg-pr-surface-3'
              }`}
            >
              {isWatchlisted ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setHasAlerts(!hasAlerts)}
              className={`p-2 rounded-lg transition-colors ${
                hasAlerts ? 'bg-blue-500/20 text-blue-500' : 'bg-pr-surface-1 text-pr-text-2 hover:bg-pr-surface-3'
              }`}
            >
              {hasAlerts ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
            <a
              href={content.platform_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-pr-surface-1 rounded-lg text-pr-text-2 hover:bg-pr-surface-3 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button className="p-2 bg-pr-surface-1 rounded-lg text-pr-text-2 hover:bg-pr-surface-3 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Header */}
            <div className="bg-pr-surface-1 rounded-xl p-6 border border-pr-surface-3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-pr-text-1">${stats.current_price.toFixed(2)}</p>
                  <div className={`flex items-center gap-2 mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span className="font-medium">
                      {isPositive ? '+' : ''}{stats.change_24h.toFixed(2)}% (${(stats.current_price - stats.previous_close).toFixed(2)})
                    </span>
                    <span className="text-pr-text-2 text-sm">Today</span>
                  </div>
                </div>

                {/* Timeframe selector */}
                <div className="flex items-center gap-1 bg-pr-surface-2 rounded-lg p-1">
                  {(['1h', '4h', '1d', '1w'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
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
              <FullCandlestickChart data={priceHistory} height={300} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3">
                <p className="text-xs text-pr-text-2 mb-1">Day Range</p>
                <p className="font-semibold text-pr-text-1">
                  ${stats.day_low.toFixed(2)} - ${stats.day_high.toFixed(2)}
                </p>
              </div>
              <div className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3">
                <p className="text-xs text-pr-text-2 mb-1">Week Range</p>
                <p className="font-semibold text-pr-text-1">
                  ${stats.week_low.toFixed(2)} - ${stats.week_high.toFixed(2)}
                </p>
              </div>
              <div className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3">
                <p className="text-xs text-pr-text-2 mb-1">All-Time High</p>
                <p className="font-semibold text-green-500">${stats.all_time_high.toFixed(2)}</p>
              </div>
              <div className="bg-pr-surface-1 rounded-xl p-4 border border-pr-surface-3">
                <p className="text-xs text-pr-text-2 mb-1">All-Time Low</p>
                <p className="font-semibold text-red-500">${stats.all_time_low.toFixed(2)}</p>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden">
              <div className="p-4 border-b border-pr-surface-3">
                <h3 className="font-semibold text-pr-text-1 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recent Trades
                </h3>
              </div>
              <div className="divide-y divide-pr-surface-3">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-pr-text-1">{trade.quantity} shares @ ${trade.price_per_share.toFixed(2)}</p>
                      <p className="text-xs text-pr-text-2">{formatDate(trade.executed_at)} • {trade.trade_type}</p>
                    </div>
                    <p className="font-semibold text-pr-text-1">${trade.total_value.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trade Panel */}
            <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden">
              <div className="p-4 border-b border-pr-surface-3">
                <h3 className="font-semibold text-pr-text-1">Trade</h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setTradeMode('buy')}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Shares
                </button>
                <button
                  onClick={() => setTradeMode('sell')}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  Sell Shares
                </button>
              </div>
            </div>

            {/* Market Stats */}
            <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden">
              <div className="p-4 border-b border-pr-surface-3">
                <h3 className="font-semibold text-pr-text-1 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Market Stats
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-pr-text-2">Market Cap</span>
                  <span className="font-medium text-pr-text-1">{formatCurrency(stats.market_cap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">24h Volume</span>
                  <span className="font-medium text-pr-text-1">{formatVolume(stats.volume_24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">7d Volume</span>
                  <span className="font-medium text-pr-text-1">{formatVolume(stats.volume_7d)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">Trades (24h)</span>
                  <span className="font-medium text-pr-text-1">{stats.trade_count_24h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">Holders</span>
                  <span className="font-medium text-pr-text-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {stats.holder_count}
                  </span>
                </div>
              </div>
            </div>

            {/* Share Info */}
            <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden">
              <div className="p-4 border-b border-pr-surface-3">
                <h3 className="font-semibold text-pr-text-1 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Share Info
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-pr-text-2">Total Shares</span>
                  <span className="font-medium text-pr-text-1">{stats.total_shares.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">Available</span>
                  <span className="font-medium text-pr-text-1">{stats.available_shares.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">7d Change</span>
                  <span className={`font-medium ${stats.change_7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.change_7d >= 0 ? '+' : ''}{stats.change_7d.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">30d Change</span>
                  <span className={`font-medium ${stats.change_30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.change_30d >= 0 ? '+' : ''}{stats.change_30d.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Content Performance */}
            <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden">
              <div className="p-4 border-b border-pr-surface-3">
                <h3 className="font-semibold text-pr-text-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Content Performance
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-pr-text-2">Views</span>
                  <span className="font-medium text-pr-text-1">{formatVolume(content.views_count || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">Likes</span>
                  <span className="font-medium text-pr-text-1">{formatVolume(content.likes_count || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">Comments</span>
                  <span className="font-medium text-pr-text-1">{formatVolume(content.comments_count || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pr-text-2">Created</span>
                  <span className="font-medium text-pr-text-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(content.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeMode !== null}
        onClose={() => setTradeMode(null)}
        content={content}
        stats={stats}
        mode={tradeMode || 'buy'}
      />
    </div>
  );
}
