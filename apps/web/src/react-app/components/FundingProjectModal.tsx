import { useState } from 'react';
import { X, Rocket, Plus, Minus } from 'lucide-react';
import type { UserType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface RewardTier {
  amount: number;
  title: string;
  description: string;
  estimatedDelivery: string;
  maxBackers?: number;
}

interface FundingProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onSuccess: () => void;
}

export default function FundingProjectModal({ isOpen, onClose, onSuccess }: FundingProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    funding_goal: '',
    min_pledge: '',
    duration_days: '30'
  });
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([
    {
      amount: 25,
      title: 'Early Supporter',
      description: 'Get early access and exclusive updates',
      estimatedDelivery: 'March 2025'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = [
    'Technology', 'Film', 'Music', 'Art', 'Games', 'Fashion', 
    'Food', 'Publishing', 'Design', 'Education', 'Health', 'Other'
  ];

  const addRewardTier = () => {
    setRewardTiers([...rewardTiers, {
      amount: 100,
      title: '',
      description: '',
      estimatedDelivery: 'April 2025'
    }]);
  };

  const removeRewardTier = (index: number) => {
    if (rewardTiers.length > 1) {
      setRewardTiers(rewardTiers.filter((_, i) => i !== index));
    }
  };

  const updateRewardTier = (index: number, field: keyof RewardTier, value: string | number) => {
    const updated = [...rewardTiers];
    updated[index] = { ...updated[index], [field]: value };
    setRewardTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.funding_goal) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.funding_goal) < 1000) {
      setError('Minimum funding goal is 1,000 gems');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/growth/funding/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          funding_goal: parseFloat(formData.funding_goal),
          min_pledge: parseFloat(formData.min_pledge) || 25,
          duration_days: parseInt(formData.duration_days),
          reward_tiers: rewardTiers
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          title: '',
          description: '',
          category: 'Technology',
          funding_goal: '',
          min_pledge: '',
          duration_days: '30'
        });
        setRewardTiers([{
          amount: 25,
          title: 'Early Supporter',
          description: 'Get early access and exclusive updates',
          estimatedDelivery: 'March 2025'
        }]);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to create project');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-pr-surface-card">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 pt-6 pb-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pr-surface-2">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create Funding Project</h2>
                <p className="text-blue-100">Launch your creative project</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white/80 transition-colors hover:text-white"
              aria-label="Close funding project modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Basic Information */}
          <div className=
"space-y-4">
            <h3 className="text-lg font-semibold text-pr-text-1">Project Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-pr-text-1 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter your project title"
                className="w-full px-4 py-3 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pr-text-1 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project, goals, and what makes it special"
                rows={4}
                className="w-full px-4 py-3 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Duration (Days)
                </label>
                <select
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  className="w-full px-4 py-3 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="30">30 days</option>
                  <option value="45">45 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Funding Goal (Gems) *
                </label>
                <input
                  type="number"
                  value={formData.funding_goal}
                  onChange={(e) => setFormData({ ...formData, funding_goal: e.target.value })}
                  placeholder="10000"
                  min="1000"
                  className="w-full px-4 py-3 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                  Minimum Pledge (Gems)
                </label>
                <input
                  type="number"
                  value={formData.min_pledge}
                  onChange={(e) => setFormData({ ...formData, min_pledge: e.target.value })}
                  placeholder="25"
                  min="1"
                  className="w-full px-4 py-3 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Reward Tiers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-pr-text-1">Reward Tiers</h3>
              <button
                type="button"
                onClick={addRewardTier}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tier</span>
              </button>
            </div>

            {rewardTiers.map((tier, index) => (
              <div key={index} className="border border-pr-surface-3 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-pr-text-1">Tier {index + 1}</h4>
                  {rewardTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRewardTier(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-pr-text-2 mb-1">
                      Pledge Amount (Gems)
                    </label>
                    <input
                      type="number"
                      value={tier.amount}
                      onChange={(e) => updateRewardTier(index, 'amount', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-pr-surface-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-pr-text-2 mb-1">
                      Estimated Delivery
                    </label>
                    <input
                      type="text"
                      value={tier.estimatedDelivery}
                      onChange={(e) => updateRewardTier(index, 'estimatedDelivery', e.target.value)}
                      placeholder="March 2025"
                      className="w-full px-3 py-2 text-sm border border-pr-surface-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-pr-text-2 mb-1">
                    Reward Title
                  </label>
                  <input
                    type="text"
                    value={tier.title}
                    onChange={(e) => updateRewardTier(index, 'title', e.target.value)}
                    placeholder="Early Access"
                    className="w-full px-3 py-2 text-sm border border-pr-surface-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-pr-text-2 mb-1">
                    Reward Description
                  </label>
                  <textarea
                    value={tier.description}
                    onChange={(e) => updateRewardTier(index, 'description', e.target.value)}
                    placeholder="Describe what backers will receive"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-pr-surface-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-pr-surface-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-pr-surface-3 text-pr-text-1 rounded-lg hover:bg-pr-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Launch Project'}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}
