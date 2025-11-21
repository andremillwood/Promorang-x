import { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Target, Clock, AlertCircle } from 'lucide-react';
import api from '@/react-app/lib/api';
import ModalBase from '@/react-app/components/ModalBase';

interface SocialForecast {
  id: number;
  creator_name: string;
  platform: string;
  content_url: string;
  content_title?: string;
  forecast_type: string;
  target_value: number;
  current_value: number;
  odds: number;
  pool_size: number;
  creator_initial_amount: number;
  creator_side: string;
  expires_at: string;
}

interface PlaceForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: SocialForecast;
  onPredictionPlaced: () => void;
}

export default function PlaceForecastModal({ isOpen, onClose, forecast, onPredictionPlaced }: PlaceForecastModalProps) {
  const [predictionSide, setPredictionSide] = useState<'over' | 'under'>('over');
  const [predictionAmount, setPredictionAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userWallet, setUserWallet] = useState({ balance: 0 });

  const safeForecast = forecast ?? ({} as SocialForecast);

  useEffect(() => {
    if (isOpen) {
      fetchUserWallet();
    }
  }, [isOpen]);

  const fetchUserWallet = async () => {
    try {
      const wallets = await api.get<any[]>('/users/me/wallets');
      const usdWallet = Array.isArray(wallets)
        ? wallets.find((w) => w.currency_type?.toLowerCase() === 'usd')
        : undefined;
      setUserWallet({ balance: Number(usdWallet?.balance) || 0 });
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/social-forecasts/${safeForecast.id}/predict`, {
        prediction_amount: parseFloat(predictionAmount),
        prediction_side: predictionSide,
      });

      onPredictionPlaced();
      onClose();
      setPredictionAmount('');
      setPredictionSide('over');
    } catch (error: any) {
      const message = error?.message || error?.response?.error || 'Failed to place prediction';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetValue = typeof safeForecast.target_value === 'number' ? safeForecast.target_value : 0;
  const poolSize = typeof safeForecast.pool_size === 'number' ? safeForecast.pool_size : 0;
  const odds = typeof safeForecast.odds === 'number' ? safeForecast.odds : 0;
  const creatorStake = typeof safeForecast.creator_initial_amount === 'number'
    ? safeForecast.creator_initial_amount
    : 0;

  const potentialPayout = predictionAmount
    ? (parseFloat(predictionAmount) * odds).toFixed(2)
    : '0';

  const formatNumber = (value: number | undefined) =>
    typeof value === 'number' && !Number.isNaN(value) ? value.toLocaleString() : '—';

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

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden">
        <div className="border-b border-pr-surface-3 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center text-xl font-semibold text-pr-text-1">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
              Make Your Prediction
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
              aria-label="Close place forecast modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          {/* Forecast Summary */}
          <div className="bg-pr-surface-2 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-pr-text-1">Forecast Details</h3>
              <span className="text-sm text-pr-text-2">{safeForecast.platform || '—'}</span>
            </div>
            
            {safeForecast.content_title && (
              <p className="text-sm text-pr-text-1 mb-2">{safeForecast.content_title}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-pr-text-2">Metric</p>
                <p className="font-medium flex items-center">
                  <Target className="w-4 h-4 mr-1 text-blue-600" />
                  {`${safeForecast.forecast_type || ''} ${formatNumber(targetValue)}`.trim()}
                </p>
              </div>
              <div>
                <p className="text-pr-text-2">Current Pool</p>
                <p className="font-medium text-green-600">${poolSize.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-pr-text-2">Odds</p>
                <p className="font-medium text-blue-600">{odds}x payout</p>
              </div>
              <div>
                <p className="text-pr-text-2">Time Left</p>
                <p className="font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {safeForecast.expires_at ? formatTimeRemaining(safeForecast.expires_at) : '—'}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-pr-surface-3">
              <p className="text-xs text-pr-text-2 mb-1">Creator's Prediction</p>
              <p className="text-sm font-medium text-blue-600">
                {(safeForecast.creator_side || '').toUpperCase() || '—'} • ${creatorStake.toFixed(2)} staked
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Prediction Side Selection */}
            <div>
              <label className="block text-sm font-medium text-pr-text-1 mb-3">
                Your Prediction
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPredictionSide('over')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    predictionSide === 'over'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-pr-surface-3 bg-pr-surface-card text-pr-text-1 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-semibold">OVER</p>
                    <p className="text-xs mt-1">Will exceed {formatNumber(targetValue)}</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPredictionSide('under')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    predictionSide === 'under'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-pr-surface-3 bg-pr-surface-card text-pr-text-1 hover:border-red-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-semibold">UNDER</p>
                    <p className="text-xs mt-1">Will not reach {formatNumber(targetValue)}</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-pr-text-1 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Prediction Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={predictionAmount}
                onChange={(e) => setPredictionAmount(e.target.value)}
                className="w-full px-3 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
                max={userWallet.balance}
              />
              <div className="flex justify-between text-sm text-pr-text-2 mt-1">
                <span>Available: ${userWallet.balance.toFixed(2)}</span>
                <span>Min: $1.00</span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 25, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setPredictionAmount(amount.toString())}
                  disabled={amount > userWallet.balance}
                  className="py-2 px-3 text-sm border border-pr-surface-3 rounded-lg hover:bg-pr-surface-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Payout Preview */}
            {predictionAmount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-pr-text-1 mb-2">Prediction Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-pr-text-2">Your prediction:</span>
                    <span className="font-medium text-blue-600">
                      {predictionSide.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pr-text-2">Amount staked:</span>
                    <span className="font-medium">${predictionAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pr-text-2">Potential payout:</span>
                    <span className="font-medium text-green-600">${potentialPayout}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pr-text-2">Potential profit:</span>
                    <span className="font-medium text-green-600">
                      ${(parseFloat(potentialPayout) - parseFloat(predictionAmount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-pr-surface-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-pr-text-1 bg-pr-surface-2 rounded-lg hover:bg-pr-surface-3 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !predictionAmount || parseFloat(predictionAmount) > userWallet.balance}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  predictionSide === 'over'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Placing...' : `Predict ${predictionSide.toUpperCase()} $${predictionAmount || '0'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalBase>
  );
}
