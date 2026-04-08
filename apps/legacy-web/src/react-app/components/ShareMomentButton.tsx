import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareMomentButtonProps {
    title: string;
    url?: string;
    className?: string; // Allow passing external styles
}

export default function ShareMomentButton({ title, url, className }: ShareMomentButtonProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || window.location.href;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Join me for ${title} on Promorang.`,
                    url: shareUrl,
                });
            } catch (err) {
                // User cancelled or share failed, fallback to copy if needed or just ignore
                console.log('Share cancelled or failed', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }
    };

    // If className is provided, render just the button logic but using the class, 
    // OR we can default to the circular style if no class provided?
    // Let's stick to the previous circular style default but allow override.

    const defaultClasses = "w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all";
    const activeClasses = className || defaultClasses;

    return (
        <button
            onClick={handleShare}
            className={activeClasses}
            title={copied ? "Link Copied" : "Share Moment"}
        >
            {copied ? (
                <Check className="w-6 h-6 text-emerald-500" />
            ) : (
                <Share2 className="w-6 h-6 text-white/40" />
            )}
        </button>
    );
}
