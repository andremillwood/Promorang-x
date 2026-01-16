import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Camera,
  FileText,
  Zap,
  Heart,
  Share2,
  MessageCircle,
  Users,
  Star,
  Clock,
  Diamond,
  Key,
  AlertCircle,
  Info,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'https://promorang-api.vercel.app';

// Drop type definitions with full configuration
const DROP_TYPES = [
  {
    id: 'content_creation',
    name: 'Content Creation',
    description: 'Request UGC, reviews, or original content from creators',
    icon: Camera,
    color: '#3B82F6',
    requiresProof: true,
    examples: ['Product review video', 'Unboxing content', 'Tutorial/How-to'],
    gemPoolRequired: false,
  },
  {
    id: 'content_clipping',
    name: 'Content Clipping',
    description: 'Have creators share existing content to new platforms',
    icon: Share2,
    color: '#10B981',
    requiresProof: true,
    examples: ['Repost to TikTok', 'Share to Instagram', 'Cross-platform sharing'],
    gemPoolRequired: false,
  },
  {
    id: 'engagement',
    name: 'Engagement',
    description: 'Get likes, comments, and shares on your content',
    icon: Heart,
    color: '#EC4899',
    requiresProof: false,
    examples: ['Like campaign post', 'Comment on video', 'Share to stories'],
    gemPoolRequired: true,
    isMove: true,
  },
  {
    id: 'reviews',
    name: 'Reviews & Testimonials',
    description: 'Collect written or video reviews of products/services',
    icon: Star,
    color: '#F59E0B',
    requiresProof: true,
    examples: ['App store review', 'Google review', 'Video testimonial'],
    gemPoolRequired: false,
  },
  {
    id: 'affiliate_referral',
    name: 'Affiliate & Referral',
    description: 'Have creators promote affiliate links or referral codes',
    icon: Users,
    color: '#8B5CF6',
    requiresProof: true,
    examples: ['Share referral link', 'Promote discount code', 'Affiliate promotion'],
    gemPoolRequired: false,
  },
  {
    id: 'surveys',
    name: 'Surveys & Feedback',
    description: 'Collect user feedback and market research',
    icon: FileText,
    color: '#06B6D4',
    requiresProof: false,
    examples: ['Product feedback', 'Market research', 'User survey'],
    gemPoolRequired: true,
  },
];

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'twitter', name: 'X (Twitter)', color: '#1DA1F2' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'any', name: 'Any Platform', color: '#6B7280' },
];

const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', description: '< 30 mins', color: '#10B981', gemMultiplier: 1 },
  { id: 'medium', name: 'Medium', description: '30-60 mins', color: '#F59E0B', gemMultiplier: 1.5 },
  { id: 'hard', name: 'Hard', description: '1+ hours', color: '#EF4444', gemMultiplier: 2 },
];

interface DropFormData {
  title: string;
  description: string;
  drop_type: string;
  platform: string;
  difficulty: string;
  content_url: string;
  preview_image: string | null;
  requirements: string;
  deliverables: string;
  time_commitment: string;
  deadline_days: number;
  max_participants: number;
  follower_threshold: number;
  gem_reward_base: number;
  gem_pool_total: number;
  key_cost: number;
  is_proof_drop: boolean;
  is_paid_drop: boolean;
}

const STEPS = [
  { title: 'Drop Type', subtitle: 'What kind of drop?' },
  { title: 'Details', subtitle: 'Describe your drop' },
  { title: 'Requirements', subtitle: 'Set expectations' },
  { title: 'Rewards', subtitle: 'Configure economics' },
  { title: 'Review', subtitle: 'Confirm & publish' },
];

export default function CreateDrop() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<DropFormData>({
    title: '',
    description: '',
    drop_type: '',
    platform: '',
    difficulty: 'easy',
    content_url: '',
    preview_image: null,
    requirements: '',
    deliverables: '',
    time_commitment: '30 minutes',
    deadline_days: 7,
    max_participants: 50,
    follower_threshold: 0,
    gem_reward_base: 25,
    gem_pool_total: 500,
    key_cost: 1,
    is_proof_drop: true,
    is_paid_drop: false,
  });

  const selectedDropType = DROP_TYPES.find(t => t.id === formData.drop_type);

  const validateCurrentStep = (): boolean => {
    setError(null);
    switch (currentStep) {
      case 0:
        if (!formData.drop_type) {
          setError('Please select a drop type');
          return false;
        }
        return true;
      case 1:
        if (!formData.title.trim()) {
          setError('Please enter a title');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Please enter a description');
          return false;
        }
        if (!formData.platform) {
          setError('Please select a platform');
          return false;
        }
        return true;
      case 2:
        if (!formData.requirements.trim()) {
          setError('Please specify requirements');
          return false;
        }
        return true;
      case 3:
        if (selectedDropType?.gemPoolRequired && formData.gem_pool_total < 100) {
          setError('Gem pool must be at least 100 gems');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + formData.deadline_days);

      const payload = {
        title: formData.title,
        description: formData.description,
        drop_type: formData.drop_type,
        platform: formData.platform,
        difficulty: formData.difficulty,
        content_url: formData.content_url || undefined,
        requirements: formData.requirements,
        deliverables: formData.deliverables,
        time_commitment: formData.time_commitment,
        deadline_at: deadline.toISOString(),
        max_participants: formData.max_participants,
        follower_threshold: formData.follower_threshold,
        gem_reward_base: formData.gem_reward_base,
        gem_pool_total: formData.gem_pool_total,
        key_cost: formData.is_paid_drop ? formData.key_cost : 0,
        is_proof_drop: formData.is_proof_drop,
        is_paid_drop: formData.is_paid_drop,
      };

      const response = await fetch(`${API_URL}/api/drops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        navigate('/drops/manage', { state: { success: true, message: 'Drop created successfully!' } });
      } else {
        throw new Error(result.error || 'Failed to create drop');
      }
    } catch (err: any) {
      console.error('Error creating drop:', err);
      setError(err.message || 'Failed to create drop');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Drop Type Selection
  const renderDropTypeStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-pr-text-1">What type of drop do you want to create?</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DROP_TYPES.map((type) => {
          const isSelected = formData.drop_type === type.id;
          const IconComponent = type.icon;

          return (
            <button
              key={type.id}
              className={`relative p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                isSelected
                  ? 'border-current shadow-md'
                  : 'border-pr-surface-3 hover:border-pr-text-2'
              }`}
              style={{ borderColor: isSelected ? type.color : undefined }}
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  drop_type: type.id,
                  is_proof_drop: type.requiresProof,
                  is_paid_drop: !type.requiresProof,
                }));
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${type.color}15` }}
              >
                <IconComponent size={24} style={{ color: type.color }} />
              </div>
              <h3 className="font-bold text-pr-text-1 mb-1">{type.name}</h3>
              <p className="text-sm text-pr-text-2 line-clamp-2">{type.description}</p>
              
              {type.isMove && (
                <div className="inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-xs font-medium">
                  <Zap size={12} />
                  Uses Move
                </div>
              )}
              
              {isSelected && (
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: type.color }}
                >
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDropType && (
        <div
          className="flex gap-4 p-4 rounded-xl border"
          style={{
            backgroundColor: `${selectedDropType.color}08`,
            borderColor: `${selectedDropType.color}30`,
          }}
        >
          <Info size={20} style={{ color: selectedDropType.color, flexShrink: 0 }} />
          <div className="flex-1">
            <h4 className="font-bold mb-1" style={{ color: selectedDropType.color }}>
              {selectedDropType.requiresProof ? 'Proof Required' : 'Auto-Verified'}
            </h4>
            <p className="text-sm text-pr-text-2 mb-3">
              {selectedDropType.requiresProof
                ? 'Participants must submit proof of completion for your review'
                : 'Rewards are distributed automatically when action is verified'}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDropType.examples.map((ex, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-pr-surface-1 text-sm text-pr-text-1">
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Step 2: Details
  const renderDetailsStep = () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-semibold text-pr-text-1 mb-2">Drop Title *</label>
        <input
          type="text"
          className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="e.g., Share our new product launch"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-pr-text-1 mb-2">Description *</label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none"
          placeholder="Describe what participants need to do..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-pr-text-1 mb-2">Platform *</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              className={`px-4 py-2.5 rounded-full border transition-all ${
                formData.platform === platform.id
                  ? 'text-white border-transparent'
                  : 'border-pr-surface-3 text-pr-text-1 hover:border-pr-text-2'
              }`}
              style={{
                backgroundColor: formData.platform === platform.id ? platform.color : undefined,
              }}
              onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
            >
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-pr-text-1 mb-2">Content URL (Optional)</label>
        <input
          type="url"
          className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="https://..."
          value={formData.content_url}
          onChange={(e) => setFormData(prev => ({ ...prev, content_url: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-pr-text-1 mb-2">Difficulty</label>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.id}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                formData.difficulty === diff.id
                  ? 'border-current text-white'
                  : 'border-pr-surface-3 hover:border-pr-text-2'
              }`}
              style={{
                backgroundColor: formData.difficulty === diff.id ? diff.color : undefined,
                borderColor: formData.difficulty === diff.id ? diff.color : undefined,
              }}
              onClick={() => setFormData(prev => ({ ...prev, difficulty: diff.id }))}
            >
              <div className={`font-bold ${formData.difficulty === diff.id ? 'text-white' : 'text-pr-text-1'}`}>
                {diff.name}
              </div>
              <div className={`text-sm ${formData.difficulty === diff.id ? 'text-white/80' : 'text-pr-text-2'}`}>
                {diff.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 3: Requirements
  const renderRequirementsStep = () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-semibold text-pr-text-1 mb-1">Requirements *</label>
        <p className="text-sm text-pr-text-2 mb-2">What must participants do to complete this drop?</p>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[140px] resize-none"
          placeholder="• Post to your Instagram feed&#10;• Tag @yourbrand&#10;• Use hashtag #YourCampaign"
          value={formData.requirements}
          onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-pr-text-1 mb-1">Deliverables</label>
        <p className="text-sm text-pr-text-2 mb-2">What proof should participants submit?</p>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none"
          placeholder="Screenshot of post, link to content, etc."
          value={formData.deliverables}
          onChange={(e) => setFormData(prev => ({ ...prev, deliverables: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-pr-text-1 mb-2">Time Commitment</label>
        <input
          type="text"
          className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="e.g., 30 minutes"
          value={formData.time_commitment}
          onChange={(e) => setFormData(prev => ({ ...prev, time_commitment: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-pr-text-1 mb-2">Deadline (days)</label>
          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="7"
            value={formData.deadline_days}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline_days: parseInt(e.target.value) || 7 }))}
            min={1}
            max={90}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-pr-text-1 mb-2">Max Participants</label>
          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="50"
            value={formData.max_participants}
            onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 50 }))}
            min={1}
            max={1000}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-pr-text-1 mb-2">Minimum Followers (Optional)</label>
        <input
          type="number"
          className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="0 (no minimum)"
          value={formData.follower_threshold || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, follower_threshold: parseInt(e.target.value) || 0 }))}
          min={0}
        />
      </div>
    </div>
  );

  // Step 4: Rewards
  const renderRewardsStep = () => {
    const perParticipant = Math.floor(formData.gem_pool_total / formData.max_participants);

    return (
      <div className="space-y-6 max-w-2xl">
        {/* Gem Pool Section */}
        <div className="p-6 rounded-2xl border border-pr-surface-3 bg-pr-surface-1">
          <div className="flex items-center gap-3 mb-2">
            <Diamond size={22} className="text-violet-500" />
            <h3 className="text-lg font-bold text-pr-text-1">Gem Pool</h3>
          </div>
          <p className="text-sm text-pr-text-2 mb-4">
            Total gems to distribute to participants. This amount will be held in escrow.
          </p>

          <div className="flex items-center gap-4 mb-4">
            <input
              type="number"
              className="flex-1 px-4 py-4 rounded-xl border border-pr-surface-3 bg-pr-surface-2 text-pr-text-1 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              value={formData.gem_pool_total}
              onChange={(e) => setFormData(prev => ({ ...prev, gem_pool_total: parseInt(e.target.value) || 0 }))}
              min={100}
            />
            <span className="text-lg font-semibold text-pr-text-2">💎 Gems</span>
          </div>

          <div className="p-4 rounded-xl bg-pr-surface-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-pr-text-2">Per participant:</span>
              <span className="font-semibold text-pr-text-1">~{perParticipant} 💎</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-pr-text-2">Max participants:</span>
              <span className="font-semibold text-pr-text-1">{formData.max_participants}</span>
            </div>
          </div>
        </div>

        {/* Key Cost Section */}
        <div className="p-6 rounded-2xl border border-pr-surface-3 bg-pr-surface-1">
          <div className="flex items-center gap-3 mb-2">
            <Key size={22} className="text-amber-500" />
            <h3 className="text-lg font-bold text-pr-text-1">Entry Cost</h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-pr-text-1">Require Keys to Enter</p>
              <p className="text-sm text-pr-text-2">Participants spend keys to join this drop</p>
            </div>
            <button
              className={`relative w-14 h-8 rounded-full transition-colors ${
                formData.is_paid_drop ? 'bg-primary' : 'bg-pr-surface-3'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, is_paid_drop: !prev.is_paid_drop }))}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  formData.is_paid_drop ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.is_paid_drop && (
            <div>
              <label className="block text-sm font-semibold text-pr-text-1 mb-2">Key Cost</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-2 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                value={formData.key_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, key_cost: parseInt(e.target.value) || 1 }))}
                min={1}
              />
            </div>
          )}
        </div>

        {/* Cost Summary */}
        <div className="flex gap-4 p-4 rounded-xl border border-violet-500/30 bg-violet-500/5">
          <AlertCircle size={20} className="text-violet-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-violet-600 mb-1">Total Cost: {formData.gem_pool_total} 💎</h4>
            <p className="text-sm text-pr-text-2">
              This amount will be deducted from your wallet and held in escrow until distributed to participants.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Step 5: Review
  const renderReviewStep = () => (
    <div className="space-y-6 max-w-2xl">
      <div className="p-6 rounded-2xl border border-pr-surface-3 bg-pr-surface-1">
        <h3 className="text-xl font-bold text-pr-text-1 mb-2">{formData.title || 'Untitled Drop'}</h3>
        <p className="text-pr-text-2 mb-6">{formData.description}</p>

        <div className="border-t border-pr-surface-3 pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-pr-text-2">Type</span>
            <span className="font-medium text-pr-text-1">{selectedDropType?.name || formData.drop_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-pr-text-2">Platform</span>
            <span className="font-medium text-pr-text-1">
              {PLATFORMS.find(p => p.id === formData.platform)?.name || formData.platform}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-pr-text-2">Difficulty</span>
            <span className="font-medium text-pr-text-1">
              {DIFFICULTIES.find(d => d.id === formData.difficulty)?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-pr-text-2">Duration</span>
            <span className="font-medium text-pr-text-1">{formData.deadline_days} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-pr-text-2">Max Participants</span>
            <span className="font-medium text-pr-text-1">{formData.max_participants}</span>
          </div>
        </div>

        <div className="border-t border-pr-surface-3 pt-4 mt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-pr-text-2">Gem Pool</span>
            <span className="font-medium text-violet-500">{formData.gem_pool_total} 💎</span>
          </div>
          {formData.is_paid_drop && (
            <div className="flex justify-between">
              <span className="text-pr-text-2">Entry Cost</span>
              <span className="font-medium text-amber-500">{formData.key_cost} 🔑</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-pr-text-2">Proof Required</span>
            <span className="font-medium text-pr-text-1">
              {formData.is_proof_drop ? 'Yes' : 'No (Auto-verified)'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-pr-surface-3 bg-pr-surface-1">
        <p className="text-sm text-pr-text-2 text-center">
          By creating this drop, you agree to our Terms of Service and confirm you have the rights to distribute the rewards specified.
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderDropTypeStep();
      case 1: return renderDetailsStep();
      case 2: return renderRequirementsStep();
      case 3: return renderRewardsStep();
      case 4: return renderReviewStep();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-pr-surface-2">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-pr-surface-1 border-b border-pr-surface-3">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-pr-text-2 hover:text-pr-text-1 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="text-center">
              <h1 className="font-bold text-pr-text-1">{STEPS[currentStep].title}</h1>
              <p className="text-sm text-pr-text-2">{STEPS[currentStep].subtitle}</p>
            </div>
            <span className="text-sm font-medium text-pr-text-2">
              {currentStep + 1}/{STEPS.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-1 bg-pr-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={18} className="text-red-500" />
            </button>
          </div>
        )}

        {renderCurrentStep()}
      </div>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 bg-pr-surface-1 border-t border-pr-surface-3">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between gap-4">
          {currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-pr-surface-3 text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Drop'}
              {!isSubmitting && <Check size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
