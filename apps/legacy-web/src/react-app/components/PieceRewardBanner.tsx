/**
 * PieceRewardBanner Component
 * 
 * Contextual notification banner displayed upon mission completion
 * or on task detail pages to inform users of Piece rewards and prompt the onboarding modal.
 */

import { useState } from 'react';
import { Coins, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import PieceOnboardingModal from '@/react-app/components/PieceOnboardingModal';

interface PieceRewardBannerProps {
    assetTitle?: string;
    pieceCount?: number;
    gemReward?: number;
}

export default function PieceRewardBanner({
    assetTitle = 'Viral Podcast Clip',
    pieceCount = 1,
    gemReward = 100,
}: PieceRewardBannerProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border border-amber-500/30 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300">
                        <Coins className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">
                                You Earned +{gemReward} Gems & +{pieceCount} Starter Piece!
                            </span>
                            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                                Co-Owner
                            </span>
                        </div>
                        <p className="text-xs text-pr-text-muted mt-0.5">
                            You now hold an equity share in <span className="text-amber-200 font-medium">{assetTitle}</span>. Earn passive dividends when others engage!
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 rounded-xl border border-amber-500/30 transition-all shrink-0"
                >
                    <HelpCircle className="w-4 h-4" /> How Pieces Work <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Render Onboarding Modal */}
            <PieceOnboardingModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                assetTitle={assetTitle}
            />
        </>
    );
}
