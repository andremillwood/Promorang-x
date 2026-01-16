import { useEffect, useState } from 'react';
import { Link as _Link } from 'react-router-dom';
import { TrendingUp as _TrendingUp, DollarSign as _DollarSign, Plus as _Plus, Target as _Target } from 'lucide-react';

const Link = _Link as any;
const TrendingUp = _TrendingUp as any;
const DollarSign = _DollarSign as any;
const Plus = _Plus as any;
const Target = _Target as any;
import CreateForecastModal from '../components/CreateForecastModal';
import PlaceForecastModal from '../components/PlaceForecastModal';
import ForecastCard, { type SocialForecast } from '../components/ForecastCard';
import BuySharesModal from '@/react-app/components/BuySharesModal';
import api from '@/react-app/lib/api';
import { API_BASE_URL } from '@/react-app/config';
import type { ContentPieceType, WalletType } from '@/shared/types';

interface UserForecast {
  id: number;
  forecast_id: number;
  prediction_amount: number;
  prediction_side: string;
  potential_payout: number;
  actual_payout: number;
  status: string;
  forecast_type: string;
  target_value: number;
  current_value: number;
  platform: string;
  content_url: string;
  media_url?: string;
  expires_at: string;
  forecast_status: string;
  result: string;
  creator_name: string;
  created_at: string;
}

export default function Invest() {
  const [activeTab, setActiveTab] = useState<'positions' | 'holdings' | 'explore'>('positions');
  const [forecasts, setForecasts] = useState<SocialForecast[]>([]);
  const [myForecasts, setMyForecasts] = useState<UserForecast[]>([]);
  const [myCreatedForecasts, setMyCreatedForecasts] = useState<SocialForecast[]>([]);
  const [content, setContent] = useState<ContentPieceType[]>([]);
    const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<SocialForecast | null>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentPieceType | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Always fetch user's positions and holdings for portfolio summary
      const [forecastsData, myForecastsData, myCreatedData, contentData, walletData] = await Promise.all([
        api.get<SocialForecast[]>('/social-forecasts').catch(() => []),
        api.get<UserForecast[]>('/users/forecasts').catch(() => []),
        api.get<SocialForecast[]>('/users/created-forecasts').catch(() => []),
        api.get<ContentPieceType[]>('/content').catch(() => []),
        api.get<WalletType[]>('/users/me/wallets').catch(() => [])
      ]);
      
      setForecasts(Array.isArray(forecastsData) ? forecastsData : []);
      setMyForecasts(Array.isArray(myForecastsData) ? myForecastsData : []);
      setMyCreatedForecasts(Array.isArray(myCreatedData) ? myCreatedData : []);
      setContent(Array.isArray(contentData) ? contentData : []);
      setWallets(Array.isArray(walletData) ? walletData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio stats
  const portfolioStats = {
    totalValue: myForecasts.reduce((sum, f) => sum + f.prediction_amount, 0) + 
                content.reduce((sum, c) => sum + (c.share_price || 0) * ((c as any).shares_owned || 0), 0),
    activePositions: myForecasts.filter(f => f.forecast_status === 'active').length,
    totalHoldings: content.filter(c => ((c as any).shares_owned || 0) > 0).length,
    pendingPayout: myForecasts.filter(f => f.forecast_status === 'active').reduce((sum, f) => sum + f.potential_payout, 0),
  };

  const handleBuyShares = async (contentPiece: ContentPieceType, sharesCount: number) => {
    try {
      await api.post('/content/buy-shares', {
        content_id: contentPiece.id,
        shares_count: sharesCount
      });

      await fetchData();
    } catch (error) {
      console.error('Failed to buy shares:', error);
      throw error;
    }
  };

  const openBuySharesModal = (contentPiece: ContentPieceType) => {
    setSelectedContent(contentPiece);
    setBuyModalOpen(true);
  };

  const handlePlacePrediction = (forecast: SocialForecast) => {
    setSelectedForecast(forecast);
    setShowPlaceModal(true);
  };

  const handleForecastCreated = () => {
    fetchData();
    setShowCreateModal(false);
  };

  const handlePredictionPlaced = () => {
    fetchData();
  };


  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-pr-text-2 bg-pr-surface-2';
      case 'resolved': return 'text-blue-600 bg-blue-100';
      default: return 'text-pr-text-2 bg-pr-surface-2';
    }
  };

  const MyForecastCard = ({ forecast }: { forecast: UserForecast }) => {
    const isResolved = forecast.forecast_status === 'resolved';
    const isWin = isResolved && forecast.actual_payout > 0;

    return (
      <div className="bg-pr-surface-card rounded-lg border border-pr-surface-3 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-medium text-pr-text-1">
              {forecast.forecast_type} forecast by {forecast.creator_name}
            </p>
            <p className="text-sm text-pr-text-2">{forecast.platform}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(forecast.forecast_status)}`}>
            {forecast.forecast_status}
          </span>
        </div>

        {forecast.media_url && (
          <div className="mb-4 rounded-lg overflow-hidden h-32 bg-pr-surface-2">
            <img
              src={forecast.media_url}
              alt="Forecast Content"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-pr-text-2">Your Prediction</p>
            <p className="font-medium text-blue-600">{forecast.prediction_side.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-pr-text-2">Amount Staked</p>
            <p className="font-medium">${forecast.prediction_amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-pr-text-2">Target Value</p>
            <p className="font-medium">{forecast.target_value.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-pr-text-2">Current Value</p>
            <p className="font-medium">{forecast.current_value.toLocaleString()}</p>
          </div>
        </div>

        {isResolved ? (
          <div className={`p-3 rounded-lg ${isWin ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm font-medium ${isWin ? 'text-green-600' : 'text-red-600'}`}>
              {isWin ? 'Won!' : 'Lost'} • {isWin ? `+$${forecast.actual_payout.toFixed(2)}` : `$${forecast.prediction_amount.toFixed(2)} lost`}
            </p>
          </div>
        ) : (
          <div className="bg-pr-surface-2 rounded-lg p-3">
            <p className="text-sm text-pr-text-2">
              Potential payout: <span className="font-medium text-green-600">${forecast.potential_payout.toFixed(2)}</span>
            </p>
            <p className="text-xs text-pr-text-2">
              Expires: {formatTimeRemaining(forecast.expires_at)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const ContentShareCard = ({ content }: { content: ContentPieceType }) => (
    <div className="bg-pr-surface-card rounded-lg border border-pr-surface-3 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <img
          src={content.creator_avatar || `${API_BASE_URL}/api/placeholder/32/32`}
          alt={content.creator_username}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="font-medium text-pr-text-1">{content.creator_username}</p>
          <p className="text-xs text-pr-text-2">{content.platform}</p>
        </div>
      </div>

      <Link to={`/content/${content.id}`}>
        <h3 className="font-medium text-pr-text-1 mb-3 hover:text-blue-600 transition-colors">{content.title}</h3>
      </Link>

      {content.media_url && (
        <div className="mb-4 rounded-lg overflow-hidden h-32 bg-pr-surface-2">
          <img
            src={content.media_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-pr-text-2">Share Price</p>
          <p className="font-medium">${content.share_price?.toFixed(2) || '0.00'}</p>
        </div>
        <div>
          <p className="text-xs text-pr-text-2">Available</p>
          <p className="font-medium">{content.available_shares}/{content.total_shares}</p>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-600 font-medium">
          Price: ${typeof content.share_price === 'number' ? content.share_price.toFixed(2) : '0.00'}
        </p>
      </div>

      <button
        onClick={() => openBuySharesModal(content)}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
      >
        Buy Shares
      </button>
    </div>
  );

  return (
    <>
      <div className="min-h-screen-dynamic bg-pr-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-pr-text-1">My Portfolio</h1>
              <p className="text-pr-text-2">Track your predictions and content holdings</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Forecast</span>
            </button>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-4">
              <p className="text-xs text-pr-text-2 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-pr-text-1">${portfolioStats.totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-4">
              <p className="text-xs text-pr-text-2 mb-1">Active Positions</p>
              <p className="text-2xl font-bold text-pr-text-1">{portfolioStats.activePositions}</p>
            </div>
            <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-4">
              <p className="text-xs text-pr-text-2 mb-1">Content Holdings</p>
              <p className="text-2xl font-bold text-pr-text-1">{portfolioStats.totalHoldings}</p>
            </div>
            <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-4">
              <p className="text-xs text-pr-text-2 mb-1">Pending Payout</p>
              <p className="text-2xl font-bold text-green-600">${portfolioStats.pendingPayout.toFixed(2)}</p>
            </div>
          </div>

          {/* Tab Navigation - Consolidated to 3 tabs */}
          <div className="flex items-center gap-1 bg-pr-surface-1 rounded-xl p-1 mb-6 w-fit border border-pr-surface-3">
            {[
              { id: 'positions', label: 'My Positions', icon: Target },
              { id: 'holdings', label: 'Content Holdings', icon: DollarSign },
              { id: 'explore', label: 'Explore', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-2'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* My Positions Tab - Shows user's forecasts and predictions */}
              {activeTab === 'positions' && (
                <>
                  {myForecasts.map((forecast) => (
                    <MyForecastCard key={forecast.id} forecast={forecast} />
                  ))}
                  {myCreatedForecasts.map((forecast) => (
                    <ForecastCard
                      key={`created-${forecast.id}`}
                      forecast={forecast}
                      onPlacePrediction={handlePlacePrediction}
                    />
                  ))}
                </>
              )}

              {/* Holdings Tab - Shows content shares owned */}
              {activeTab === 'holdings' && content.filter(c => ((c as any).shares_owned || 0) > 0).map((contentPiece) => (
                <ContentShareCard key={contentPiece.id} content={contentPiece} />
              ))}

              {/* Explore Tab - Shows available forecasts to join */}
              {activeTab === 'explore' && forecasts.map((forecast) => (
                <ForecastCard
                  key={forecast.id}
                  forecast={forecast}
                  onPlacePrediction={handlePlacePrediction}
                />
              ))}
            </div>
          )}

          {/* Empty States */}
          {!loading && (
            <>
              {activeTab === 'positions' && myForecasts.length === 0 && myCreatedForecasts.length === 0 && (
                <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
                  <Target className="w-12 h-12 text-pr-text-2 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-pr-text-1 mb-2">No Active Positions</h3>
                  <p className="text-pr-text-2 mb-4 max-w-md mx-auto">
                    You haven't made any predictions yet. Explore active forecasts or create your own!
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setActiveTab('explore')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Explore Forecasts
                    </button>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-pr-surface-2 text-pr-text-1 px-4 py-2 rounded-xl hover:bg-pr-surface-3 transition-colors"
                    >
                      Create Forecast
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'holdings' && content.filter(c => ((c as any).shares_owned || 0) > 0).length === 0 && (
                <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
                  <DollarSign className="w-12 h-12 text-pr-text-2 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-pr-text-1 mb-2">No Content Holdings</h3>
                  <p className="text-pr-text-2 mb-4 max-w-md mx-auto">
                    You don't own any content shares yet. Visit the market to discover and invest in creator content.
                  </p>
                  <a
                    href="/market"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Explore Market
                  </a>
                </div>
              )}

              {activeTab === 'explore' && forecasts.length === 0 && (
                <div className="text-center py-12 bg-pr-surface-card rounded-xl border border-pr-surface-3">
                  <TrendingUp className="w-12 h-12 text-pr-text-2 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-pr-text-1 mb-2">No Active Forecasts</h3>
                  <p className="text-pr-text-2 mb-4 max-w-md mx-auto">
                    Be the first to create a prediction market! Put up your stake and let others predict.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Create First Forecast
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateForecastModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onForecastCreated={handleForecastCreated}
      />

      {selectedForecast && (
        <PlaceForecastModal
          isOpen={showPlaceModal}
          onClose={() => setShowPlaceModal(false)}
          forecast={selectedForecast}
          onPredictionPlaced={handlePredictionPlaced}
        />
      )}

      {selectedContent && (
        <BuySharesModal
          content={selectedContent}
          wallet={wallets.find((wallet) => wallet.currency_type === 'USD')}
          isOpen={buyModalOpen}
          onClose={() => {
            setBuyModalOpen(false);
            setSelectedContent(null);
          }}
          onPurchase={handleBuyShares}
        />
      )}
    </>
  );
}
