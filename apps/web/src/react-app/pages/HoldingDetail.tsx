import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp, DollarSign, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { ContentHoldingDetail } from '../../shared/types';
import { getHoldingDetail } from '@/react-app/services/portfolioService';

export default function HoldingDetailPage() {
  const { holdingId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ContentHoldingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!holdingId) return;
    const load = async () => {
      setLoading(true);
      const data = await getHoldingDetail(holdingId);
      setDetail(data);
      setLoading(false);
    };
    load();
  }, [holdingId]);

  if (!holdingId) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-pr-text-2 hover:text-pr-text-1">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <p className="mt-6 text-pr-text-2">Holding not found.</p>
      </div>
    );
  }

  if (loading || !detail) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-pr-text-2 hover:text-pr-text-1">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <div className="mt-10 flex justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const { holding, content, performance, marketplace } = detail;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-pr-text-2 hover:text-pr-text-1">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to portfolio
        </button>
      </div>

      <div className="bg-pr-surface-card rounded-2xl border border-pr-surface-3 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img src={holding.content_thumbnail} alt={holding.content_title} className="w-20 h-20 rounded-xl object-cover" />
            <div>
              <h1 className="text-2xl font-semibold text-pr-text-1">{holding.content_title}</h1>
              <p className="text-sm text-pr-text-2">
                {holding.creator_name} • {holding.platform.toUpperCase()}
              </p>
              <p className="text-sm text-pr-text-2 mt-1">{content.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-right">
              <p className="text-xs text-pr-text-2">Shares Owned</p>
              <p className="text-lg font-semibold text-pr-text-1">{holding.owned_shares}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-pr-text-2">Market Value</p>
              <p className="text-lg font-semibold text-pr-text-1">${holding.market_value.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-pr-text-2">Unrealized Gain</p>
              <p className={`text-lg font-semibold ${holding.unrealized_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {holding.unrealized_gain >= 0 ? '+' : ''}${holding.unrealized_gain.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-pr-text-2">Available to sell</p>
              <p className="text-lg font-semibold text-pr-text-1">{holding.available_to_sell}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-pr-surface-card border border-pr-surface-3 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-pr-text-1">Performance history</h2>
            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              <TrendingUp className="w-3 h-3 mr-1" /> 30 day trend
            </span>
          </div>
          <div className="space-y-2">
            {performance.history.map((entry) => (
              <div key={entry.date} className="flex items-center justify-between text-sm text-pr-text-2">
                <span>{entry.date}</span>
                <span>${entry.price.toFixed(2)} • {entry.volume} shares traded</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-pr-surface-card border border-pr-surface-3 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-pr-text-1 mb-4">Activity</h2>
          <div className="space-y-3">
            {performance.ledger.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-pr-surface-2 rounded-full flex items-center justify-center">
                    {item.type === 'purchase' ? (
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-pr-text-1 capitalize">{item.type}</p>
                    <p className="text-xs text-pr-text-2">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-pr-text-1">
                  {item.quantity ? `${item.quantity} shares @ $${item.price.toFixed(2)}` : `$${item.price.toFixed(2)}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-pr-surface-card border border-pr-surface-3 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-pr-text-1 mb-4">Marketplace listings</h2>
          <div className="space-y-3">
            {marketplace.listings.length ? (
              marketplace.listings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between bg-pr-surface-2 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-pr-text-1">{listing.quantity} shares</p>
                    <p className="text-xs text-pr-text-2 capitalize">Status: {listing.status}</p>
                  </div>
                  <div className="text-sm font-semibold text-pr-text-1">${listing.ask_price.toFixed(2)}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-pr-text-2">No listing history yet.</p>
            )}
          </div>
        </div>

        <div className="bg-pr-surface-card border border-pr-surface-3 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-pr-text-1 mb-4">Recent offers</h2>
          <div className="space-y-3">
            {marketplace.offers.length ? (
              marketplace.offers.map((offer) => (
                <div key={offer.id} className="bg-pr-surface-2 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-pr-text-1">{offer.quantity} shares @ ${offer.bid_price.toFixed(2)}</p>
                      <p className="text-xs text-pr-text-2">{offer.buyer_name}</p>
                    </div>
                    <span className="text-xs font-semibold text-orange-600">{offer.status}</span>
                  </div>
                  {offer.message && <p className="text-xs text-pr-text-2 mt-2">“{offer.message}”</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-pr-text-2">No offers yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-pr-surface-card border border-pr-surface-3 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-pr-text-1 mb-4">Content performance overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-orange-600">Total views</p>
            <p className="text-xl font-semibold text-orange-900">{content.total_views.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-blue-600">Engagement rate</p>
            <p className="text-xl font-semibold text-blue-900">{content.engagement_rate}%</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-purple-600">Earnings to date</p>
            <p className="text-xl font-semibold text-purple-900">${content.earnings_to_date.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-green-600">Last trade</p>
            <p className="text-xl font-semibold text-green-900">{holding.last_trade_at ? new Date(holding.last_trade_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
