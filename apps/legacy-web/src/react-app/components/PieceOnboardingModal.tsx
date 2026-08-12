/**
 * PieceOnboardingModal Component
 * 
 * Interactive 3-slide educational modal introducing users to Pieces & Dividends
 * in accessible, plain English without financial clutter.
 */

import { useState } from 'react';
import { X, Sparkles, TrendingUp, DollarSign, Check, ArrowRight, ArrowLeft, ShieldCheck, Coins } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';
import { Button } from '@/components/ui/button';

interface PieceOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    assetTitle?: string;
}

export default function PieceOnboardingModal({
    isOpen,
    onClose,
    assetTitle = 'Viral Podcast Clip',
}: PieceOnboardingModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            icon: Coins,
            iconColor: 'text-amber-400',
            iconBg: 'bg-amber-500/10 border-amber-500/20',
            badge: 'STEP 1 OF 3: WHAT IS A PIECE?',
            title: 'You Are Now a Co-Owner!',
            description: `A Piece is a fractional ownership stake in content, moments, or local campaigns (like "${assetTitle}"). Instead of just giving free likes, owning a Piece gives you real skin in the game.`,
            highlightBox: '🎯 You hold 1 Piece of this asset in your Vault.',
        },
        {
            icon: DollarSign,
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10 border-emerald-500/20',
            badge: 'STEP 2 OF 3: PASSIVE DIVIDENDS',
            title: 'Earn Dividends As It Grows',
            description: 'Whenever other users clip, view, buy, or check into this content, a percentage of platform revenue is automatically paid out to Piece holders as passive Dividends.',
            highlightBox: '💰 Dividends deposit automatically into your Gems wallet.',
        },
        {
            icon: TrendingUp,
            iconColor: 'text-purple-400',
            iconBg: 'bg-purple-500/10 border-purple-500/20',
            badge: 'STEP 3 OF 3: TRADE & BUILD PORTFOLIO',
            title: 'Hold for Yield or Trade for Profit',
            description: 'As the popularity of the content grows, the trading value of your Piece increases on the marketplace. Hold for continuous payouts or sell back to liquidity pools.',
            highlightBox: '📈 Track your entire portfolio inside your Vault dashboard.',
        },
    ];

    const slide = slides[currentSlide];
    const IconComponent = slide.icon;

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <div className="bg-pr-dark-card border border-pr-border-subtle rounded-2xl p-6 max-w-md w-full text-white shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-pr-text-muted hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Icon & Step Badge */}
                <div className="flex items-center gap-3 mb-5">
                    <div className={`p-3 rounded-xl border ${slide.iconBg} ${slide.iconColor}`}>
                        <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block">
                            {slide.badge}
                        </span>
                        <h2 className="text-xl font-bold text-white leading-tight">{slide.title}</h2>
                    </div>
                </div>

                {/* Content Description */}
                <p className="text-sm text-pr-text-secondary leading-relaxed mb-4">
                    {slide.description}
                </p>

                {/* Highlight Callout Box */}
                <div className="bg-pr-dark-bg/80 border border-pr-border-subtle/60 rounded-xl p-3 mb-6 text-xs font-semibold text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{slide.highlightBox}</span>
                </div>

                {/* Slide Indicators */}
                <div className="flex items-center justify-between pt-2 border-t border-pr-border-subtle/40">
                    <div className="flex items-center gap-1.5">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-2 rounded-full transition-all ${
                                    currentSlide === idx ? 'w-6 bg-amber-400' : 'w-2 bg-gray-700 hover:bg-gray-600'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {currentSlide > 0 && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handlePrev}
                                className="h-9 px-3 text-xs border-pr-border-subtle text-pr-text-secondary hover:text-white"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={handleNext}
                            className="h-9 px-4 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg flex items-center gap-1.5"
                        >
                            {currentSlide === slides.length - 1 ? (
                                <>
                                    Got It! <Check className="w-3.5 h-3.5" />
                                </>
                            ) : (
                                <>
                                    Next <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </ModalBase>
    );
}
