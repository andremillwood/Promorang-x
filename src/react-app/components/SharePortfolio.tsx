import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Wallet,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
  Star,
  Activity,
} from 'lucide-react';

interface Holding {
  content_id: string;
  content_title: string;
  content_thumbnail: string;
  creator_name: string;
  platform: string;
  owned_shares: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  unrealized_gain: number;
  day_change_pct: number;
  week_change_pct: number;
  category_name?: string;
  category_slug?: string;
}

interface PortfolioTotals {
  portfolio_value: number;
  invested: number;
  unrealized_gain: number;
  day_change_pct: number;
  week_change_pct: number;
}

interface CategoryAllocation {
  category_name: string;
  category_slug: string;
  category_color: string;
  value: number;
  percentage: number;
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

const formatPercent = (value: number) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Donut chart for allocation
const AllocationChart = ({ allocations }: { allocations: CategoryAllocation[] }) => {
  if (!allocations || allocations.length === 0) return null;

  const total = allocations.reduce((sum, a) => sum + a.value, 0);
  let currentAngle = -90; // Start from top

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {allocations.map((allocation, index) => {
          const percentage = (allocation.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          const pathD = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={index}
              d={pathD}
              fill={allocation.category_color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        {/* Center hole */}
        <circle cx="50" cy="50" r="25" className="fill-pr-surface-1" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs text-pr-text-2">Total</p>
          <p className="text-sm font-bold text-pr-text-1">{formatCurrency(total)}</p>
        </div>
      </div>
    </div>
  );
};

// Mini sparkline for holdings
const MiniSparkline = ({ data, isPositive }: { data: number[]; isPositive: boolean }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;

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
        stroke={isPositive ? '#10B981' : '#EF4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Holding row component
const HoldingRow = ({ 
  holding, 
  onClick,
  showValue = true,
}: { 
  holding: Holding; 
  onClick: () => void;
  showValue?: boolean;
}) => {
  const isPositive = holding.unrealized_gain >= 0;
  const dayPositive = holding.day_change_pct >= 0;

  // Generate mock sparkline data
  const sparklineData = Array.from({ length: 7 }, (_, i) => {
    const base = holding.current_price * 0.9;
    return base + Math.random() * holding.current_price * 0.2;
  });

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 p-4 hover:bg-pr-surface-2 cursor-pointer transition-colors border-b border-pr-surface-3 last:border-b-0"
    >
      {/* Content info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={holding.content_thumbnail}
          alt={holding.content_title}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="font-medium text-pr-text-1 truncate">{holding.content_title}</p>
          <p className="text-xs text-pr-text-2">{holding.creator_name} • {holding.owned_shares} shares</p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="hidden sm:block">
        <MiniSparkline data={sparklineData} isPositive={dayPositive} />
      </div>

      {/* Price & Change */}
      <div className="text-right">
        <p className="font-medium text-pr-text-1">${holding.current_price.toFixed(2)}</p>
        <p className={`text-xs flex items-center justify-end ${dayPositive ? 'text-green-500' : 'text-red-500'}`}>
          {dayPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(holding.day_change_pct).toFixed(2)}%
        </p>
      </div>

      {/* Value & P/L */}
      {showValue && (
        <div className="text-right min-w-[80px]">
          <p className="font-medium text-pr-text-1">{formatCurrency(holding.market_value)}</p>
          <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{formatCurrency(holding.unrealized_gain)}
          </p>
        </div>
      )}

      <ChevronRight className="w-4 h-4 text-pr-text-2 flex-shrink-0" />
    </div>
  );
};

export default function SharePortfolio() {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [totals, setTotals] = useState<PortfolioTotals | null>(null);
  const [allocations, setAllocations] = useState<CategoryAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'name'>('value');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/portfolio/holdings', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setHoldings(data.holdings || []);
        setTotals(data.totals || null);
        
        // Calculate allocations by category
        const categoryMap = new Map<string, { value: number; color: string }>();
        const colors = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#6366F1', '#EF4444', '#14B8A6'];
        
        (data.holdings || []).forEach((h: Holding, i: number) => {
          const cat = h.category_name || 'Other';
          const existing = categoryMap.get(cat) || { value: 0, color: colors[i % colors.length] };
          existing.value += h.market_value;
          categoryMap.set(cat, existing);
        });

        const totalValue = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.value, 0);
        const allocs: CategoryAllocation[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
          category_name: name,
          category_slug: name.toLowerCase().replace(/\s+/g, '-'),
          category_color: data.color,
          value: data.value,
          percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        }));

        setAllocations(allocs);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort holdings
  const sortedHoldings = [...holdings].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return b.market_value - a.market_value;
      case 'change':
        return b.day_change_pct - a.day_change_pct;
      case 'name':
        return a.content_title.localeCompare(b.content_title);
      default:
        return 0;
    }
  });

  const isPortfolioPositive = (totals?.unrealized_gain || 0) >= 0;
  const isDayPositive = (totals?.day_change_pct || 0) >= 0;

  if (loading) {
    return (
      <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-pr-text-2 animate-spin" />
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 p-8 text-center">
        <Wallet className="w-12 h-12 text-pr-text-2 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-pr-text-1 mb-2">No Holdings Yet</h3>
        <p className="text-pr-text-2 mb-4">Start investing in content shares to build your portfolio</p>
        <button
          onClick={() => navigate('/market')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Explore Market
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-pr-text-1 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Your Portfolio
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowValues(!showValues)}
              className="p-2 text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-2 rounded-lg transition-colors"
              title={showValues ? 'Hide values' : 'Show values'}
            >
              {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={fetchPortfolio}
              className="p-2 text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-2 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Value */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <p className="text-sm text-pr-text-2 mb-1">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-pr-text-1">
                {showValues ? formatCurrency(totals?.portfolio_value || 0) : '••••••'}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`flex items-center text-sm font-medium ${isDayPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isDayPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {formatPercent(totals?.day_change_pct || 0)} today
                </span>
                <span className={`flex items-center text-sm ${isPortfolioPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPortfolioPositive ? '+' : ''}{showValues ? formatCurrency(totals?.unrealized_gain || 0) : '••••'} total
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-pr-surface-3">
              <div>
                <p className="text-xs text-pr-text-2">Invested</p>
                <p className="font-semibold text-pr-text-1">
                  {showValues ? formatCurrency(totals?.invested || 0) : '••••'}
                </p>
              </div>
              <div>
                <p className="text-xs text-pr-text-2">7d Change</p>
                <p className={`font-semibold ${(totals?.week_change_pct || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercent(totals?.week_change_pct || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-pr-text-2">Holdings</p>
                <p className="font-semibold text-pr-text-1">{holdings.length}</p>
              </div>
            </div>
          </div>

          {/* Allocation Chart */}
          <div>
            <p className="text-sm text-pr-text-2 mb-3 text-center">Allocation</p>
            <AllocationChart allocations={allocations} />
            <div className="mt-3 space-y-1">
              {allocations.slice(0, 4).map((alloc, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: alloc.category_color }}
                    />
                    <span className="text-pr-text-2">{alloc.category_name}</span>
                  </div>
                  <span className="text-pr-text-1 font-medium">{alloc.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden">
        <div className="p-4 border-b border-pr-surface-3 flex items-center justify-between">
          <h3 className="font-semibold text-pr-text-1 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Holdings ({holdings.length})
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm bg-pr-surface-2 border border-pr-surface-3 rounded-lg px-3 py-1.5 text-pr-text-1"
          >
            <option value="value">By Value</option>
            <option value="change">By Change</option>
            <option value="name">By Name</option>
          </select>
        </div>

        <div className="divide-y divide-pr-surface-3">
          {sortedHoldings.map((holding) => (
            <HoldingRow
              key={holding.content_id}
              holding={holding}
              onClick={() => navigate(`/shares/${holding.content_id}`)}
              showValue={showValues}
            />
          ))}
        </div>

        {/* View all link */}
        <div className="p-4 border-t border-pr-surface-3">
          <button
            onClick={() => navigate('/market')}
            className="w-full py-2 text-center text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center justify-center gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            Explore More Shares
          </button>
        </div>
      </div>
    </div>
  );
}
