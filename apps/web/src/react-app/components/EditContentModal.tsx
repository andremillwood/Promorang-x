import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { ContentPieceType } from '../../shared/types';
import { CreateContentRequestSchema } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedContent: ContentPieceType) => void;
  content: ContentPieceType;
}

export default function EditContentModal({
  isOpen,
  onClose,
  onSuccess,
  content
}: EditContentModalProps) {
  const [formData, setFormData] = useState({
    platform: content.platform,
    title: content.title,
    description: content.description || '',
    platform_url: content.platform_url,
    media_url: content.media_url || '',
    total_shares: content.total_shares,
    share_price: content.share_price,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (content) {
      setFormData({
        platform: content.platform,
        title: content.title,
        description: content.description || '',
        platform_url: content.platform_url,
        media_url: content.media_url || '',
        total_shares: content.total_shares,
        share_price: content.share_price,
      });
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const validationResult = CreateContentRequestSchema.safeParse(formData);
      if (!validationResult.success) {
        setError('Please check all required fields');
        return;
      }

      const response = await fetch(`/api/content/${content.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess(result.content);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      setError('Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-pr-surface-3 pb-4">
          <h2 className="text-xl font-bold text-pr-text-1">Edit Content</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-pr-text-1 mb-2">
                Platform *
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              >
                <option value="">Select platform</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            {/* Total Shares */}
            <div>
              <label className="block text-sm font-medium text-pr-text-1 mb-2">
                Total Shares *
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.total_shares}
                onChange={(e) => setFormData({ ...formData, total_shares: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="Enter content title"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="Describe your content..."
              disabled={loading}
            />
          </div>

          {/* Platform URL */}
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Platform URL *
            </label>
            <input
              type="url"
              value={formData.platform_url}
              onChange={(e) => setFormData({ ...formData, platform_url: e.target.value })}
              className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="https://instagram.com/p/..."
              required
              disabled={loading}
            />
          </div>

          {/* Media URL */}
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Media URL
            </label>
            <input
              type="url"
              value={formData.media_url}
              onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
              className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>

          {/* Share Price */}
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Share Price (USD) *
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={formData.share_price}
              onChange={(e) => setFormData({ ...formData, share_price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-pr-surface-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="0.0100"
              required
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-pr-surface-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-pr-surface-3 text-pr-text-1 rounded-xl font-medium hover:bg-pr-surface-2 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Content</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}
