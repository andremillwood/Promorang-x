import { useState } from 'react';
import { Instagram, TrendingUp, Gift, ArrowRight } from 'lucide-react';

interface EarningsCalculatorProps {
    onGetStarted?: () => void;
}

export default function EarningsCalculator({ onGetStarted }: EarningsCalculatorProps) {
    const [followers, setFollowers] = useState(5000);

    // Earnings calculation based on followers
    // Base: ~1 Promo Point per 100 followers for active engagement
    const weeklyPromoPoints = Math.floor(followers * 0.02); // 2% conversion rate
    const monthlyPromoPoints = weeklyPromoPoints * 4;
    const potentialEarnings = (monthlyPromoPoints * 0.01).toFixed(2); // $0.01 per Promo Point

    const formatFollowers = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toString();
    };

    return (
        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-pr-surface-2 px-4 py-2 rounded-full mb-4">
                    <Instagram className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-medium text-pr-text-1">Earnings Calculator</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-pr-text-1 mb-2">
                    See What You Could Earn
                </h3>
                <p className="text-pr-text-2">
                    Estimate your Promo Points earnings based on your Instagram following
                </p>
            </div>

            {/* Slider */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-pr-text-2">Instagram Followers</span>
                    <span className="text-2xl font-bold text-pr-text-1">{formatFollowers(followers)}</span>
                </div>
                <input
                    type="range"
                    min="1000"
                    max="1000000"
                    step="1000"
                    value={followers}
                    onChange={(e) => setFollowers(Number(e.target.value))}
                    className="w-full h-3 bg-pr-surface-2 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-pr-text-muted mt-2">
                    <span>1K</span>
                    <span>100K</span>
                    <span>500K</span>
                    <span>1M</span>
                </div>
            </div>

            {/* Earnings Display */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-pr-surface-2 rounded-xl p-4 text-center">
                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                        {weeklyPromoPoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-pr-text-2 mt-1">Weekly Promo Points</div>
                </div>
                <div className="bg-pr-surface-2 rounded-xl p-4 text-center">
                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">
                        {monthlyPromoPoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-pr-text-2 mt-1">Monthly Promo Points</div>
                </div>
                <div className="bg-pr-surface-2 rounded-xl p-4 text-center">
                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                        ${potentialEarnings}
                    </div>
                    <div className="text-xs text-pr-text-2 mt-1">Potential Monthly $</div>
                </div>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-3 bg-pr-surface-2 rounded-lg">
                    <Gift className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-sm font-bold text-pr-text-1">Content Shares</div>
                        <div className="text-xs text-pr-text-2">Earn equity in content you engage with</div>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-pr-surface-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-sm font-bold text-pr-text-1">Forecasts</div>
                        <div className="text-xs text-pr-text-2">Predict content performance for bonus points</div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <button
                onClick={onGetStarted}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
            >
                Connect Instagram & Start Earning
                <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-center text-xs text-pr-text-muted mt-4">
                Free to join. No credit card required. Instant activation.
            </p>
        </div>
    );
}
