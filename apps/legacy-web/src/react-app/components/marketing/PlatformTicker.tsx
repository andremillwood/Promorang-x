import { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingCart, Zap, DollarSign, Trophy, Gift, Target } from 'lucide-react';

interface TickerItem {
    id: string;
    text: string;
    icon: React.ReactNode;
    color: string;
}

export default function PlatformTicker() {
    const [items, setItems] = useState<TickerItem[]>([]);

    useEffect(() => {
        // Demo activity for the ticker
        const activities: TickerItem[] = [
            { id: '1', text: "Sarah earned 150 PP from 'Summer Drop'", icon: <Zap className="w-4 h-4" />, color: "text-yellow-500" },
            { id: '2', text: "New Prediction: 'Over' on TechVid Forecast", icon: <TrendingUp className="w-4 h-4" />, color: "text-green-500" },
            { id: '3', text: "Alex redeemed points for 'Wireless Buds'", icon: <ShoppingCart className="w-4 h-4" />, color: "text-purple-500" },
            { id: '4', text: "Growth Hub: Mike reached 'Platinum Elite' Tier", icon: <Trophy className="w-4 h-4" />, color: "text-blue-500" },
            { id: '5', text: "24 members joined 'Festival' Drop", icon: <Users className="w-4 h-4" />, color: "text-orange-500" },
            { id: '6', text: "Content Share: $PRICE up +12% for ViralClip", icon: <DollarSign className="w-4 h-4" />, color: "text-emerald-500" },
            { id: '7', text: "Jenny claimed 20% OFF McDonald's Coupon", icon: <Gift className="w-4 h-4" />, color: "text-red-500" },
            { id: '8', text: "New Forecast: 'Will AI be regulated in 2026?'", icon: <Target className="w-4 h-4" />, color: "text-blue-400" },
        ];
        setItems(activities);
    }, []);

    return (
        <div className="w-full bg-pr-surface-1 border-y border-pr-border overflow-hidden py-3">
            <div className="flex animate-marquee whitespace-nowrap">
                {/* Doubled for seamless loop */}
                {[...items, ...items].map((item, idx) => (
                    <div
                        key={`${item.id}-${idx}`}
                        className="flex items-center gap-3 px-8 border-r border-pr-border last:border-r-0"
                    >
                        <div className={`${item.color}`}>{item.icon}</div>
                        <span className="text-sm font-medium text-pr-text-2 uppercase tracking-wide">
                            {item.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
