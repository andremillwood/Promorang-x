import { useEffect, useState } from 'react';
import { TrendingUp, Users, Clock, DollarSign, Plus, Target, ExternalLink } from 'lucide-react';
import CreateForecastModal from '../components/CreateForecastModal';
import PlaceForecastModal from '../components/PlaceForecastModal';
import BuySharesModal from '@/react-app/components/BuySharesModal';
import api from '@/react-app/lib/api';
import { API_BASE_URL } from '@/react-app/config';
import type { ContentPieceType, WalletType } from '@/shared/types';

interface SocialForecast {
  id: number;
  creator_id: number;
  creator_name: string;
  creator_avatar: string;
  platform: string;
  content_url: string;
  content_id?: number;
  content_title?: string;
  content_platform?: string;
  forecast_type: string;
  target_value: number;
  current_value: number;
  odds: number;
  pool_size: number;
  creator_initial_amount: number;
  creator_side: string;
  expires_at: string;
  status: string;
  created_at: string;
}

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
  expires_at: string;
  forecast_status: string;
  result: string;
  creator_name: string;
  created_at: string;
}

export default function Invest() {
  const [activeTab, setActiveTab] = useState<'forecasts' | 'my-forecasts' | 'my-created' | 'content'>('forecasts');
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
      if (activeTab === 'forecasts') {
        const data = await api.get<SocialForecast[]>('/social-forecasts');
        setForecasts(Array.isArray(data) ? data : []);
      } else if (activeTab === 'my-forecasts') {
        const data = await api.get<UserForecast[]>('/users/forecasts');
        setMyForecasts(Array.isArray(data) ? data : []);
      } else if (activeTab === 'my-created') {
        const data = await api.get<SocialForecast[]>('/users/created-forecasts');
        setMyCreatedForecasts(Array.isArray(data) ? data : []);
      } else if (activeTab === 'content') {
        const [contentData, walletData] = await Promise.all([
          api.get<ContentPieceType[]>('/content'),
          api.get<WalletType[]>('/users/me/wallets').catch(() => [])
        ]);
        setContent(Array.isArray(contentData) ? contentData : []);
        setWallets(Array.isArray(walletData) ? walletData : []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
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

  const formatNumber = (value: number | null | undefined, options?: Intl.NumberFormatOptions) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '—';
    }
    return value.toLocaleString(undefined, options);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '—';
    }
    return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  const ForecastCard = ({ forecast }: { forecast: SocialForecast }) => {
    const isExpired = new Date(forecast.expires_at) <= new Date();
    
    return (
      <div className="bg-pr-surface-card rounded-lg border border-pr-surface-3 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={forecast.creator_avatar || `${API_BASE_URL}/api/placeholder/32/32`}
              alt={forecast.creator_name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium text-pr-text-1">{forecast.creator_name}</p>
              <p className="text-xs text-pr-text-2">{forecast.platform}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(forecast.status)}`}>
              {forecast.status}
            </span>
            <a
              href={forecast.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pr-text-2"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {forecast.content_title && (
          <div className="mb-3 p-3 bg-pr-surface-2 rounded-lg">
            <p className="text-sm font-medium text-pr-text-1">{forecast.content_title}</p>
            <p className="text-xs text-pr-text-2">{forecast.content_platform}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">
                {forecast.forecast_type} {formatNumber(forecast.target_value)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-pr-text-2">Pool</p>
              <p className="font-semibold text-green-600">{formatCurrency(forecast.pool_size)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-pr-text-2">
                {formatTimeRemaining(forecast.expires_at)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-pr-text-2">Odds</p>
              <p className="font-semibold text-blue-600">
                {typeof forecast.odds === 'number' && !Number.isNaN(forecast.odds) ? `${forecast.odds}x` : '—'}
              </p>
            </div>
          </div>

          {forecast.creator_side && forecast.creator_initial_amount > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-pr-text-2 mb-1">Creator's Prediction</p>
              <p className="text-sm font-medium text-blue-600">
                {forecast.creator_side.toUpperCase()} • {formatCurrency(forecast.creator_initial_amount)} staked
              </p>
            </div>
          )}

          {!isExpired && (
            <button
              onClick={() => handlePlacePrediction(forecast)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Make Your Prediction
            </button>
          )}
        </div>
      </div>
    );
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
          alt={content.creator_name}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="font-medium text-pr-text-1">{content.creator_name}</p>
          <p className="text-xs text-pr-text-2">{content.platform}</p>
        </div>
      </div>
      
      <h3 className="font-medium text-pr-text-1 mb-3">{content.title}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-pr-text-2">Share Price</p>
          <p className="font-medium">${content.share_price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-pr-text-2">Available</p>
          <p className="font-medium">{content.available_shares}/{content.total_shares}</p>
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-600 font-medium">
          Revenue: ${content.current_revenue.toFixed(2)}
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-pr-text-1">Investment Hub</h1>
              <p className="text-pr-text-2">Create forecasts, make predictions, and invest in creator success</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Forecast</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-pr-surface-3 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'forecasts', label: 'All Forecasts', icon: TrendingUp },
                { id: 'my-forecasts', label: 'My Predictions', icon: Users },
                { id: 'my-created', label: 'My Forecasts', icon: Target },
                { id: 'content', label: 'Content Shares', icon: DollarSign },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-pr-text-2 hover:text-pr-text-1 hover:border-pr-surface-3'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'forecasts' && forecasts.map((forecast) => (
                <ForecastCard key={forecast.id} forecast={forecast} />
              ))}

              {activeTab === 'my-forecasts' && myForecasts.map((forecast) => (
                <MyForecastCard key={forecast.id} forecast={forecast} />
              ))}

              {activeTab === 'my-created' && myCreatedForecasts.map((forecast) => (
                <ForecastCard key={forecast.id} forecast={forecast} />
              ))}

              {activeTab === 'content' && content.map((contentPiece) => (
                <ContentShareCard key={contentPiece.id} content={contentPiece} />
              ))}
            </div>
          )}

          {/* Empty States */}
          {!loading && (
            <>
              {activeTab === 'forecasts' && forecasts.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-pr-text-1 mb-2">No Active Forecasts</h3>
                  <p className="text-pr-text-2 mb-4">
                    Be the first to create a prediction market! Put up your own stake and let others predict on your forecast.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Forecast
                  </button>
                </div>
              )}

              {activeTab === 'my-forecasts' && myForecasts.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-pr-text-1 mb-2">No Predictions Yet</h3>
                  <p className="text-pr-text-2">Browse active forecasts and make your first prediction to start earning!</p>
                </div>
              )}

              {activeTab === 'my-created' && myCreatedForecasts.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-pr-text-1 mb-2">No Created Forecasts</h3>
                  <p className="text-pr-text-2 mb-4">
                    Create your first prediction market by putting up initial stake and letting others predict against you!
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Forecast
                  </button>
                </div>
              )}

              {activeTab === 'content' && content.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-pr-text-1 mb-2">No Content Available</h3>
                  <p className="text-pr-text-2">No content shares are currently available for investment.</p>
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
