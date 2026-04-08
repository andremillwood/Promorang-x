import { ReactNode } from 'react';
import { DollarSign, Calendar, Video, ShoppingBag, Gift, TrendingUp, Activity } from 'lucide-react';

export type FeedItemType = 'drop' | 'event' | 'content' | 'product' | 'coupon' | 'prediction' | 'movement';

interface FeedItemWrapperProps {
    type: FeedItemType;
    children: ReactNode;
    className?: string;
}

const config = {
    drop: {
        label: 'Drop',
        icon: DollarSign,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-500',
        borderColor: 'border-emerald-500',
        bgColor: 'bg-emerald-50',
    },
    event: {
        label: 'Event',
        icon: Calendar,
        color: 'bg-purple-500',
        textColor: 'text-purple-500',
        borderColor: 'border-purple-500',
        bgColor: 'bg-purple-50',
    },
    content: {
        label: 'Content',
        icon: Video,
        color: 'bg-pink-500',
        textColor: 'text-pink-500',
        borderColor: 'border-pink-500',
        bgColor: 'bg-pink-50',
    },
    product: {
        label: 'Product',
        icon: ShoppingBag,
        color: 'bg-blue-500',
        textColor: 'text-blue-500',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-50',
    },
    coupon: {
        label: 'Reward',
        icon: Gift,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        borderColor: 'border-yellow-500',
        bgColor: 'bg-yellow-50',
    },
    prediction: {
        label: 'Prediction',
        icon: TrendingUp,
        color: 'bg-orange-500',
        textColor: 'text-orange-500',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-50',
    },
    movement: {
        label: 'Share Movement',
        icon: Activity,
        color: 'bg-indigo-500',
        textColor: 'text-indigo-500',
        borderColor: 'border-indigo-500',
        bgColor: 'bg-indigo-50',
    },
};

export default function FeedItemWrapper({ type, children, className = '' }: FeedItemWrapperProps) {
    const { label, icon: Icon, color, textColor, borderColor, bgColor } = config[type];

    return (
        <div className={`w-full rounded-xl overflow-hidden shadow-sm border border-pr-border hover:shadow-md transition-shadow duration-200 ${className}`}>
            {/* Type Indicator Bar */}
            <div className={`${color} px-4 py-1.5 flex items-center justify-between`}>
                <div className="flex items-center space-x-2 text-white">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-pr-surface-card">
                {children}
            </div>
        </div>
    );
}
