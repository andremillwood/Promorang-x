import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ModalBase from '@/react-app/components/ModalBase';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: {
    title: string;
    description?: string;
    platform: string;
    media_url?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function AddContentModal({ isOpen, onClose, onSubmit, isSubmitting }: AddContentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'instagram',
    media_url: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await onSubmit(formData);
    setFormData({ title: '', description: '', platform: 'instagram', media_url: '' });
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-pr-text-1">Add Campaign Content</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-pr-text-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Content title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Platform *
            </label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Content description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Media URL
            </label>
            <Input
              value={formData.media_url}
              onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.platform}
            >
              {isSubmitting ? 'Adding...' : 'Add Content'}
            </Button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
