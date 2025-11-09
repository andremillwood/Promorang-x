import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LineChart, Users } from 'lucide-react';
import type { PredictionDetail } from '../../shared/types';
import { getPredictionDetail } from '@/react-app/services/portfolioService';

export default function PredictionDetailPage() {
  const { predictionId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<PredictionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!predictionId) return;
    const load = async () => {
      setLoading(true);
      const data = await getPredictionDetail(predictionId);
      setDetail(data);
      setLoading(false);
    };
    load();
  }, [predictionId]);

  if (!predictionId) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <p className="mt-6 text-gray-600">Prediction not found.</p>
      </div>
    );
  }

  if (loading || !detail) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to predictions
        </button>
        <div className="mt-10 flex justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const { prediction, forecast, trajectory, participants } = detail;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{prediction.content_title}</h1>
            <p className="text-sm text-gray-500">
              {prediction.platform.toUpperCase()} • Placed {new Date(prediction.created_at).toLocaleDateString()}
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Side</p>
                <p className="text-base font-semibold text-gray-900 capitalize">{prediction.prediction_side}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Stake</p>
                <p className="text-base font-semibold text-gray-900">${prediction.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Potential payout</p>
                <p className="text-base font-semibold text-gray-900">${prediction.potential_payout.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <p className="text-base font-semibold text-orange-600 capitalize">{prediction.status}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
            <p className="text-xs uppercase tracking-wide text-orange-600">Forecast target</p>
            <p className="text-2xl font-semibold text-orange-900">{forecast.metric} • {forecast.target}</p>
            <p className="text-sm text-orange-700 mt-2">Odds {forecast.odds.toFixed(2)}x</p>
            <p className="text-xs text-orange-700 mt-1">
              Expires {new Date(forecast.expires_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trajectory</h2>
            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              <LineChart className="w-3 h-3 mr-1" /> Trend overview
            </span>
          </div>
          <div className="space-y-2">
            {trajectory.map((entry) => (
              <div key={entry.date} className="flex items-center justify-between text-sm text-gray-600">
                <span>{entry.date}</span>
                <span>
                  Actual {entry.actual.toLocaleString()} • Expected {entry.expected.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Projection notes</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{forecast.creator_projection}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            {participants.length} active
          </span>
        </div>
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <div key={`${participant.username}-${index}`} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{participant.username}</p>
                <p className="text-xs text-gray-500 capitalize">{participant.side}</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>${participant.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 capitalize">{participant.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
