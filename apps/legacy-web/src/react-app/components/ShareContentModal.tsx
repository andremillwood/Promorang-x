import { useEffect, useMemo, useState } from 'react';
import { X, Share2, Copy, Check, RefreshCw, Facebook, Twitter, MessageCircle, Mail } from 'lucide-react';
import type { UserType } from '../../shared/types';
import { createShareLink } from '@/react-app/services/sharesService';
import { logEvent } from '@/react-app/services/telemetry';
import ModalBase from '@/react-app/components/ModalBase';

interface ShareContentModalProps {
  user: UserType | null;
  contentId?: number;
  contentTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ShareContentModal({ user, contentId, contentTitle, isOpen, onClose, onSuccess }: ShareContentModalProps) {
  const [platform, setPlatform] = useState('instagram');
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pointsToEarn = useMemo(() => {
    if (!user) return 0;
    const basePoints = 10;
    const multiplier =
      user.user_tier === 'super' ? 2.0 :
      user.user_tier === 'premium' ? 1.5 : 1.0;
    return Math.floor(basePoints * multiplier);
  }, [user]);

  useEffect(() => {
    if (!isOpen || !user?.id || !contentId) {
      return;
    }

    const targetUrl = `${window.location.origin}/content/${contentId}`;

    const generateLink = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await createShareLink({
          userId: user.id,
          targetUrl,
          contentId,
        });

        setShareLink(data.url);

        logEvent('share_created', { shareId: data.id, contentId: contentId ?? null, platform }, { userId: user.id });
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to generate share link');
      } finally {
        setLoading(false);
      }
    };

    setShareLink('');
    void generateLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id, contentId]);

  if (!isOpen || !user) {
    return null;
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const shareText = contentTitle
    ? `Check out this content: "${contentTitle}" on Promorang!`
    : 'Discover amazing content and earn while you engage on Promorang!';

  const shareMessage = `${shareText} ${shareLink || 'https://promorang.com'}`;

  const shareButtons = [
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      handler: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank', 'width=600,height=400'),
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: <Twitter className="w-4 h-4" />,
      handler: () => {
        const text = encodeURIComponent(shareMessage);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=600,height=400');
      },
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      handler: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank'),
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="w-4 h-4" />,
      handler: () => {
        const subject = encodeURIComponent('Check out this content on Promorang');
        const body = encodeURIComponent(shareMessage);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
    },
  ];

  const regenerateLink = async () => {
    if (!user?.id || !contentId) return;
    const targetUrl = `${window.location.origin}/content/${contentId}`;
    setLoading(true);
    setError(null);
    try {
      const data = await createShareLink({
        userId: user.id,
        targetUrl,
        contentId,
      });
      setShareLink(data.url);
      logEvent('share_created', { shareId: data.id, contentId: contentId ?? null, platform, regenerated: true }, { userId: user.id });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to regenerate share link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-xl">
        <div className="border-b border-pr-surface-3 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-bold text-pr-text-1">Share Content</h2>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2" aria-label="Close share content modal">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-orange-900">Share Rewards</span>
                <p className="text-xs text-orange-700 mt-1">
                  Base 10 pts × tier multiplier ({user.user_tier})
                </p>
              </div>
              <span className="text-2xl font-bold text-orange-600">{pointsToEarn}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-3">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {['instagram', 'tiktok', 'twitter', 'facebook', 'linkedin'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`p-3 rounded-lg border-2 transition ${
                    platform === p ? 'border-orange-500 bg-orange-50' : 'border-pr-surface-3 hover:border-pr-surface-3'
                  }`}
                >
                  <span className="text-sm font-medium capitalize">{p}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">Suggested Share Text</label>
            <div className="bg-pr-surface-2 border border-pr-surface-3 rounded-lg p-3">
              <p className="text-sm text-pr-text-1 mb-2">{shareMessage}</p>
              <button
                onClick={() => copyToClipboard(shareMessage)}
                className="flex items-center space-x-2 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">Your Share Link</label>
            <div className="bg-pr-surface-2 border border-pr-surface-3 rounded-lg p-3">
              {loading ? (
                <div className="flex items-center space-x-2 text-sm text-pr-text-2">
                  <div className="animate-spin w-4 h-4 border-2 border-pr-surface-3 border-t-transparent rounded-full" />
                  <span>Generating secure link…</span>
                </div>
              ) : shareLink ? (
                <>
                  <p className="text-sm text-pr-text-1 break-all mb-2">{shareLink}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => copyToClipboard(shareLink)}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>
                    <button
                      onClick={regenerateLink}
                      className="flex items-center space-x-2 text-sm text-pr-text-2 hover:text-pr-text-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh link</span>
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-red-600">{error || 'Unable to generate link. Try again shortly.'}</p>
              )}
            </div>
            <p className="text-xs text-pr-text-2 mt-1">
              Use this link in your post or bio. Rewards trigger automatically when we detect qualified engagement.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Copy the suggested text or craft your own message.</li>
              <li>2. Share the secure link on your selected platform.</li>
              <li>3. Earn {pointsToEarn} points when your share drives engagement.</li>
            </ol>
          </div>

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {shareButtons.map((button) => (
              <button
                key={button.id}
                onClick={button.handler}
                disabled={!shareLink}
                className="flex items-center justify-center space-x-2 p-3 bg-gray-900 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                {button.icon}
                <span>{button.label}</span>
              </button>
            ))}
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator && shareLink && (
            <button
              onClick={() => navigator.share?.({ title: contentTitle, text: shareText, url: shareLink })}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via…</span>
            </button>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-pr-surface-3 rounded-lg text-pr-text-1 font-medium hover:bg-pr-surface-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
