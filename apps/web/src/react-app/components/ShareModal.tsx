import { useState } from 'react';
import { X, Share2, Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: number;
  contentTitle: string;
  contentUrl?: string;
}

export default function ShareModal({ isOpen, onClose, contentId, contentTitle, contentUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = contentUrl || `${window.location.origin}/content/${contentId}`;
  const shareText = `Check out this amazing content: "${contentTitle}" on Promorang!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${shareText} ${shareUrl}`);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareText} ${shareUrl}`);
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out this content on Promorang');
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: contentTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-pr-surface-3 pb-4">
          <div className="flex items-center space-x-2">
            <Share2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-pr-text-1">Share Content</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close share modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-pr-surface-2 rounded-lg p-4">
          <h3 className="font-medium text-pr-text-1 mb-2">{contentTitle}</h3>
          <p className="text-sm text-pr-text-2 break-all">{shareUrl}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-between rounded-lg border border-pr-surface-3 p-3 transition-colors hover:bg-pr-surface-2"
          >
            <div className="flex items-center space-x-3">
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-pr-text-2" />
              )}
              <span className="font-medium text-pr-text-1">
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareToFacebook}
              className="flex items-center justify-center space-x-2 rounded-lg bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700"
            >
              <Facebook className="h-4 w-4" />
              <span>Facebook</span>
            </button>

            <button
              onClick={shareToTwitter}
              className="flex items-center justify-center space-x-2 rounded-lg bg-sky-500 p-3 text-white transition-colors hover:bg-sky-600"
            >
              <Twitter className="h-4 w-4" />
              <span>Twitter</span>
            </button>

            <button
              onClick={shareToWhatsApp}
              className="flex items-center justify-center space-x-2 rounded-lg bg-green-500 p-3 text-white transition-colors hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareViaEmail}
              className="flex items-center justify-center space-x-2 rounded-lg bg-gray-600 p-3 text-white transition-colors hover:bg-gray-700"
            >
              <span className="text-sm">📧</span>
              <span>Email</span>
            </button>
          </div>

          {typeof window !== 'undefined' && 'share' in navigator && (
            <button
              onClick={shareNative}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white transition-colors hover:from-purple-600 hover:to-pink-600"
            >
              <Share2 className="h-4 w-4" />
              <span>Share via...</span>
            </button>
          )}
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Share this content to earn points and help creators grow their audience!
          </p>
        </div>
      </div>
    </ModalBase>
  );
}
