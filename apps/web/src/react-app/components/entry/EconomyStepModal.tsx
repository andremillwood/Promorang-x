/**
 * EconomyStepModal
 * 
 * Educational modals for each step in the Promorang economy.
 * Teaches users about the step and CTAs them to take action.
 */

import { X, ArrowRight, Sparkles, TrendingUp, Trophy, DollarSign, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export type EconomyStep = 'monetize' | 'spot_trends' | 'build_rank' | 'withdraw';

interface EconomyStepModalProps {
    step: EconomyStep;
    isOpen: boolean;
    onClose: () => void;
    onOpenInstagramModal?: () => void;
}

const STEP_CONTENT = {
    monetize: {
        icon: Sparkles,
        iconBg: 'from-orange-500 to-amber-500',
        title: 'Monetize Your Routine',
        subtitle: 'Turn everyday social activity into rewards',
        bullets: [
            { icon: '❤️', text: 'Likes, comments, and saves you already do earn points' },
            { icon: '📍', text: 'Check in at places you visit for location bonuses' },
            { icon: '🔗', text: 'Share products you love and earn when friends buy' },
        ],
        incentive: '+50 points for completing your first social proof',
        cta: { label: 'Connect Instagram', action: 'instagram' as const },
        ctaSecondary: { label: 'Browse Deals', path: '/deals' },
    },
    spot_trends: {
        icon: TrendingUp,
        iconBg: 'from-pink-500 to-rose-500',
        title: 'Spot Trends First',
        subtitle: "Find the next viral hit before it blows up",
        bullets: [
            { icon: '🔍', text: 'Scout content you think will go viral' },
            { icon: '💰', text: "Earn a finder's fee when brands sponsor it" },
            { icon: '📈', text: 'Build equity in content you discover early' },
        ],
        incentive: 'Finders earn 5-15% of sponsorship revenue forever',
        cta: { label: 'Start Scouting', path: '/bounty-hunt' },
        ctaSecondary: { label: 'See Trending', path: '/market' },
    },
    build_rank: {
        icon: Trophy,
        iconBg: 'from-purple-500 to-indigo-500',
        title: 'Build Your Access Rank',
        subtitle: 'Consistency unlocks premium opportunities',
        bullets: [
            { icon: '🌱', text: 'Day 0: Entry access to deals and events' },
            { icon: '⭐', text: 'Day 7+: Leaderboard, referrals, PromoShare lottery' },
            { icon: '💎', text: 'Day 14+: Priority access, Growth Hub, premium campaigns' },
        ],
        incentive: 'Higher ranks get first access to limited drops',
        cta: { label: 'View Your Progress', path: '/access-rank' },
        ctaSecondary: { label: 'Go to Today', path: '/today' },
    },
    withdraw: {
        icon: DollarSign,
        iconBg: 'from-emerald-500 to-green-500',
        title: 'Withdraw Real Money',
        subtitle: 'Gems convert to cash you can spend anywhere',
        bullets: [
            { icon: '💎', text: '1 Gem = $1 USD, always' },
            { icon: '🏦', text: 'Withdraw to PayPal, Venmo, or bank account' },
            { icon: '🛍️', text: 'Or use gems for in-app purchases and boosts' },
        ],
        incentive: 'No minimum withdrawal, no hidden fees',
        cta: { label: 'View Wallet', path: '/wallet' },
        ctaSecondary: { label: 'How to Earn Gems', path: '/deals' },
    },
};

export default function EconomyStepModal({ step, isOpen, onClose, onOpenInstagramModal }: EconomyStepModalProps) {
    const navigate = useNavigate();
    const content = STEP_CONTENT[step];
    const Icon = content.icon;

    if (!isOpen) return null;

    const handlePrimaryCta = () => {
        if ('action' in content.cta && content.cta.action === 'instagram') {
            onClose();
            onOpenInstagramModal?.();
        } else if ('path' in content.cta) {
            onClose();
            navigate(content.cta.path);
        }
    };

    const handleSecondaryCta = () => {
        onClose();
        navigate(content.ctaSecondary.path);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-pr-surface-card rounded-2xl shadow-2xl border border-pr-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`bg-gradient-to-r ${content.iconBg} p-6 text-white`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                            <Icon className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{content.title}</h2>
                            <p className="text-white/80 text-sm">{content.subtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Bullets */}
                    <div className="space-y-3">
                        {content.bullets.map((bullet, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="text-xl">{bullet.icon}</span>
                                <p className="text-sm text-pr-text-1">{bullet.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Incentive */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                        <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                            {content.incentive}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 pt-0 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleSecondaryCta}
                        className="flex-1"
                    >
                        {content.ctaSecondary.label}
                    </Button>
                    <Button
                        onClick={handlePrimaryCta}
                        className={`flex-1 bg-gradient-to-r ${content.iconBg} hover:opacity-90 text-white`}
                    >
                        {content.cta.label}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
