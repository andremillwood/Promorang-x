/**
 * ClipMissionSubmitModal
 * 
 * Submission and Asset Hub Modal for Content Clipping Missions.
 * Allows clippers to access long-form media clips/timestamps, sponsor offer codes,
 * and submit published TikTok, Instagram Reels, or YouTube Shorts links for view tracking.
 */

import { useState } from 'react';
import { X, Video, ExternalLink, Download, Check, AlertCircle, Loader2, Sparkles, Copy } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/react-app/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface ClipMissionSubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    missionId: string;
    missionTitle: string;
    creatorName: string;
    sponsorName?: string;
    sourceVideoUrl: string;
    timestamps?: Array<{ start: number; end: number; label: string }>;
    brandPromoCode?: string;
    cpmRate: number; // Gems per 1k views
    onSuccess?: () => void;
}

export default function ClipMissionSubmitModal({
    isOpen,
    onClose,
    missionId,
    missionTitle,
    creatorName,
    sponsorName,
    sourceVideoUrl,
    timestamps = [],
    brandPromoCode,
    cpmRate,
    onSuccess,
}: ClipMissionSubmitModalProps) {
    const { toast } = useToast();

    const [platform, setPlatform] = useState<'tiktok' | 'reels' | 'youtube_shorts'>('tiktok');
    const [publishedUrl, setPublishedUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopyCode = () => {
        if (!brandPromoCode) return;
        navigator.clipboard.writeText(brandPromoCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast({
            title: 'Promo Code Copied!',
            description: `Include "${brandPromoCode}" in your clip caption to earn conversion bonuses.`,
        });
    };

    const detectPlatform = (url: string) => {
        const lower = url.toLowerCase();
        if (lower.includes('tiktok.com')) setPlatform('tiktok');
        else if (lower.includes('instagram.com/reel') || lower.includes('instagram.com/reels')) setPlatform('reels');
        else if (lower.includes('youtube.com/shorts') || lower.includes('youtu.be')) setPlatform('youtube_shorts');
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPublishedUrl(val);
        detectPlatform(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!publishedUrl.trim()) {
            toast({
                title: 'URL Required',
                description: 'Please enter the URL of your published clip.',
                type: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const res = await apiFetch('/api/clip-submissions', {
                method: 'POST',
                body: JSON.stringify({
                    clip_mission_id: missionId,
                    platform,
                    published_url: publishedUrl.trim(),
                }),
            });

            if (res.ok) {
                toast({
                    title: 'Clip Submitted Successfully! 🎉',
                    description: `Your clip is queued for view tracking. You'll earn ${cpmRate} Gems per 1k verified views.`,
                });
                onSuccess?.();
                onClose();
            } else {
                throw new Error(res.statusText || 'Failed to submit clip.');
            }
        } catch (err: any) {
            toast({
                title: 'Submission Failed',
                description: err.message || 'Error submitting clip. Please try again.',
                type: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatSeconds = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const remainder = sec % 60;
        return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <div className="bg-pr-dark-card border border-pr-border-subtle rounded-2xl p-6 max-w-lg w-full text-white shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-pr-text-muted hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Clip Mission Hub</h2>
                        <p className="text-xs text-pr-text-muted">
                            By {creatorName} {sponsorName ? `• Sponsored by ${sponsorName}` : ''}
                        </p>
                    </div>
                </div>

                <div className="bg-pr-dark-bg/60 border border-pr-border-subtle/50 rounded-xl p-4 mb-5 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-pr-text-secondary">Mission Title:</span>
                        <span className="font-semibold text-white">{missionTitle}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-pr-text-secondary">CPM Reward Rate:</span>
                        <span className="font-bold text-emerald-400">💎 {cpmRate} Gems / 1k views</span>
                    </div>

                    {/* Brand Promo Code Section */}
                    {brandPromoCode && (
                        <div className="mt-2 pt-2 border-t border-pr-border-subtle/40 flex items-center justify-between">
                            <div>
                                <span className="text-xs text-pr-text-muted block">Sponsor Offer Code:</span>
                                <span className="font-mono text-sm font-bold text-amber-400">{brandPromoCode}</span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopyCode}
                                className="h-8 text-xs gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                            >
                                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedCode ? 'Copied' : 'Copy Code'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Source Media & Recommended Timestamps */}
                <div className="mb-5">
                    <label className="text-xs font-semibold text-pr-text-secondary uppercase tracking-wider block mb-2">
                        1. Source Media & Highlight Hooks
                    </label>
                    <a
                        href={sourceVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-medium mb-3 underline"
                    >
                        <ExternalLink className="w-4 h-4" /> Open Source Video File / Stream
                    </a>

                    {timestamps.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                            <span className="text-xs text-pr-text-muted block">Suggested Clip Moments:</span>
                            {timestamps.map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs bg-pr-dark-bg/80 px-3 py-1.5 rounded-lg border border-pr-border-subtle/30">
                                    <span className="text-pr-text-secondary">{t.label}</span>
                                    <span className="font-mono text-purple-300">{formatSeconds(t.start)} - {formatSeconds(t.end)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submission Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-pr-text-secondary uppercase tracking-wider block mb-2">
                            2. Select Target Platform
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['tiktok', 'reels', 'youtube_shorts'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPlatform(p)}
                                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                                        platform === p
                                            ? 'bg-purple-600/20 border-purple-500 text-white font-semibold'
                                            : 'bg-pr-dark-bg border-pr-border-subtle text-pr-text-muted hover:text-white'
                                    }`}
                                >
                                    {p === 'tiktok' ? 'TikTok' : p === 'reels' ? 'IG Reels' : 'YT Shorts'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-pr-text-secondary uppercase tracking-wider block mb-2">
                            3. Paste Published Clip URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://www.tiktok.com/@user/video/..."
                            value={publishedUrl}
                            onChange={handleUrlChange}
                            required
                            className="w-full bg-pr-dark-bg border border-pr-border-subtle focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-pr-text-muted focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading || !publishedUrl.trim()}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Clip...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" /> Submit Clip & Track Views
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </ModalBase>
    );
}
