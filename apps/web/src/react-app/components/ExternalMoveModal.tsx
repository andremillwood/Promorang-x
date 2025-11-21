import { useState } from 'react';
import { X, ExternalLink, Upload, Camera, CheckCircle, AlertCircle, Key } from 'lucide-react';
import type { UserType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface ExternalMoveModalProps {
  user: UserType | null;
  contentId?: number;
  contentTitle?: string;
  contentPlatform?: string;
  contentUrl?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExternalMoveModal({ 
  user, 
  contentId, 
  contentTitle, 
  contentPlatform,
  contentUrl,
  isOpen, 
  onClose, 
  onSuccess 
}: ExternalMoveModalProps) {
  const [moveType, setMoveType] = useState<'like' | 'comment' | 'share' | 'save' | 'repost'>('like');
  const [proofUrl, setProofUrl] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const moveTypes = [
    { id: 'like', name: 'Like', description: 'Like the post on the original platform', icon: '❤️' },
    { id: 'comment', name: 'Comment', description: 'Leave a meaningful comment', icon: '💬' },
    { id: 'share', name: 'Share/Repost', description: 'Share or repost the content', icon: '🔄' },
    { id: 'save', name: 'Save/Bookmark', description: 'Save or bookmark the content', icon: '🔖' },
    { id: 'repost', name: 'Story/Repost', description: 'Share to your story or timeline', icon: '📢' }
  ];

  const getTierMultiplier = (tier: string) => {
    switch (tier) {
      case 'super': return 2.0;
      case 'premium': return 1.5;
      case 'free':
      default: return 1.0;
    }
  };

  const calculateExternalMoveReward = () => {
    // Base points for external moves (10x the internal move points)
    const basePoints = {
      'like': 10,      // vs 1 for internal
      'comment': 30,   // vs 3 for internal  
      'save': 50,      // vs 5 for internal
      'share': 100,    // vs 10 for internal
      'repost': 120    // vs 12 for internal
    };

    const base = basePoints[moveType] || 10;
    const multiplier = getTierMultiplier(user.user_tier);
    const finalPoints = Math.floor(base * multiplier);
    
    // Also award some keys for external moves
    const keysEarned = Math.ceil(finalPoints / 20); // 1 key per 20 points
    
    return { points: finalPoints, keys: keysEarned, multiplier };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
    }
  };

  const handleSubmit = async () => {
    if (!proofUrl.trim() && !proofImage) {
      setError('Please provide proof URL or upload a screenshot');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (proofImage) {
        const formData = new FormData();
        formData.append('image', proofImage);
        
        // In a real implementation, you'd upload to your storage service
        // For now, we'll create a temporary URL
        imageUrl = URL.createObjectURL(proofImage);
      }

      const response = await fetch('/api/users/external-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          move_type: moveType,
          content_id: contentId,
          content_platform: contentPlatform,
          content_url: contentUrl,
          proof_url: proofUrl || imageUrl,
          proof_type: proofImage ? 'image' : 'url'
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess();
        onClose();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <span class="text-lg">🎉</span>
            <div>
              <div class="font-semibold">+${result.points_earned} points!</div>
              <div class="text-xs opacity-90">+${result.keys_earned} keys • External move verified</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 4000);
        
        // Reset form
        setProofUrl('');
        setProofImage(null);
        setMoveType('like');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to record external move');
      }
    } catch (error) {
      console.error('External move failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const reward = calculateExternalMoveReward();

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-pr-surface-3 px-6 pt-6 pb-4">
          <div className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-bold text-pr-text-1">External Move</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close external move modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6">
          {/* Content Info */}
          {contentTitle && (
            <div className="bg-pr-surface-2 border border-pr-surface-3 rounded-lg p-4">
              <h3 className="font-medium text-pr-text-1 mb-1">{contentTitle}</h3>
              <div className="flex items-center space-x-2 text-sm text-pr-text-2">
                <span className="capitalize">{contentPlatform}</span>
                {contentUrl && (
                  <>
                    <span>•</span>
                    <a 
                      href={contentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      View Original
                    </a>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Reward Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Reward for External Move</span>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-purple-600">{reward.points}</span>
                <span className="text-sm text-purple-700">points</span>
                <div className="flex items-center space-x-1">
                  <Key className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600">{reward.keys}</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-purple-700">
              10x more than in-app actions • {reward.multiplier}x {user.user_tier} tier multiplier
            </div>
          </div>

          {/* Move Type Selection */}
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-3">
              What did you do on {contentPlatform}?
            </label>
            <div className="grid grid-cols-1 gap-2">
              {moveTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMoveType(type.id as any)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    moveType === type.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-pr-surface-3 hover:border-pr-surface-3'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-pr-text-2">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Proof Submission */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-pr-text-1">
              Proof of Action *
            </label>
            
            {/* URL Input */}
            <div>
              <label className="block text-xs text-pr-text-2 mb-1">Link to your action (optional if uploading image)</label>
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://instagram.com/p/your-post/..."
                className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs text-pr-text-2 mb-1">Or upload a screenshot</label>
              <div className="border-2 border-dashed border-pr-surface-3 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="proof-upload"
                />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  {proofImage ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-green-700">{proofImage.name}</p>
                      <p className="text-xs text-pr-text-2">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-pr-text-2">Click to upload screenshot</p>
                      <p className="text-xs text-pr-text-2">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">How it works</span>
            </div>
            <ol className="text-sm text-blue-700 space-y-1 pl-4">
              <li>1. Go to the original content on {contentPlatform}</li>
              <li>2. Perform the selected action ({moveTypes.find(t => t.id === moveType)?.name})</li>
              <li>3. Copy the URL or take a screenshot as proof</li>
              <li>4. Submit here to earn {reward.points} points + {reward.keys} keys!</li>
            </ol>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-pr-surface-3 rounded-lg text-pr-text-1 font-medium hover:bg-pr-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={(!proofUrl.trim() && !proofImage) || loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit Proof</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
