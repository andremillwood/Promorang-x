import React, { useEffect, useState, useRef } from 'react';
import {
    Trophy,
    Sparkles,
    Star,
    X,
    Share2,
    Download,
    Flame
} from 'lucide-react';
import { useCelebration } from '@/react-app/components/ui/Celebrate';

interface DrawWinnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    prize: {
        type: 'keys' | 'boost' | 'badge' | 'gems';
        amount: number;
        label?: string;
    };
    userName?: string;
    drawDate?: string;
}

export function DrawWinnerModal({
    isOpen,
    onClose,
    prize,
    userName = 'Winner',
    drawDate
}: DrawWinnerModalProps) {
    const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const { celebrate } = useCelebration();

    // Trigger canvas-confetti fireworks on open
    useEffect(() => {
        if (isOpen && !hasTriggeredConfetti) {
            celebrate('fireworks', 4000);
            setHasTriggeredConfetti(true);
        }
        if (!isOpen) {
            setHasTriggeredConfetti(false);
        }
    }, [isOpen, hasTriggeredConfetti, celebrate]);


    const getPrizeIcon = () => {
        switch (prize.type) {
            case 'keys': return <Trophy className="w-10 h-10 text-yellow-500" />;
            case 'boost': return <Flame className="w-10 h-10 text-orange-500" />;
            case 'badge': return <Star className="w-10 h-10 text-purple-500" />;
            case 'gems': return <Sparkles className="w-10 h-10 text-blue-500" />;
            default: return <Trophy className="w-10 h-10 text-yellow-500" />;
        }
    };

    const getPrizeLabel = () => {
        if (prize.label) return prize.label;
        switch (prize.type) {
            case 'keys': return `${prize.amount} PromoKeys`;
            case 'boost': return `${prize.amount}× Point Boost`;
            case 'badge': return 'Winner Badge';
            case 'gems': return `${prize.amount} Gems`;
            default: return 'Prize';
        }
    };

    const handleShare = async () => {
        const text = `🎉 I just won ${getPrizeLabel()} in the Promorang Daily Draw! 🏆\n\nJoin and start earning: promorang.co`;

        if (navigator.share) {
            try {
                await navigator.share({ text, title: 'Promorang Win!' });
            } catch (err) {
                // User cancelled
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />


            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-sm mx-4 animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                {/* Winner Card */}
                <div
                    ref={cardRef}
                    className="bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 rounded-3xl p-8 text-center shadow-2xl border border-white/10"
                >
                    {/* Trophy Glow */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full shadow-lg">
                            {getPrizeIcon()}
                        </div>
                    </div>

                    {/* Text */}
                    <div className="text-yellow-300 text-sm font-bold tracking-wider mb-2 uppercase">
                        🎉 You Won! 🎉
                    </div>
                    <h2 className="text-white text-3xl font-black mb-2">
                        {getPrizeLabel()}
                    </h2>
                    <p className="text-purple-200 text-sm mb-6">
                        Congratulations, {userName}!
                    </p>

                    {/* Date Badge */}
                    {drawDate && (
                        <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-white/70 text-xs mb-6">
                            Daily Draw · {drawDate}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-purple-700 py-3 px-5 rounded-xl font-bold hover:bg-purple-100 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            Share Win
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/20 text-white py-3 px-5 rounded-xl font-bold hover:bg-white/30 transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                </div>

                {/* Promorang Branding */}
                <div className="text-center mt-4 text-white/50 text-xs">
                    promorang.co
                </div>
            </div>

            {/* CSS Keyframes for modal animation */}
            <style>{`
                @keyframes scale-in {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default DrawWinnerModal;
