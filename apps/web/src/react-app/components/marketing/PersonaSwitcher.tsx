import {
    TrendingUp,
    Store,
    ShoppingBag,
    Sparkles
} from 'lucide-react';

export type PersonaType = 'creator' | 'investor' | 'merchant' | 'shopper';

interface PersonaSwitcherProps {
    activePersona: PersonaType;
    onPersonaChange: (persona: PersonaType) => void;
}

export const personas = [
    {
        id: 'creator' as PersonaType,
        label: 'Creators',
        icon: Sparkles,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        description: 'Monetize your audience on Instagram & beyond.',
        features: ['Drops', 'Content Shares', 'Direct Brand Deals']
    },
    {
        id: 'investor' as PersonaType,
        label: 'Investors',
        icon: TrendingUp,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        description: 'Trade social capital and predict viral performance.',
        features: ['Portfolio Management', 'Live Forecasts', 'Marketplace']
    },
    {
        id: 'merchant' as PersonaType,
        label: 'Merchants',
        icon: Store,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        description: 'Grow your brand through word-of-mouth marketing.',
        features: ['Campaign Management', 'Drop Insights', 'Coupon Performance']
    },
    {
        id: 'shopper' as PersonaType,
        label: 'Shoppers',
        icon: ShoppingBag,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        description: 'Redeem rewards and find exclusive partner deals.',
        features: ['Marketplace', 'Coupons', 'Exclusive Pricing']
    }
];

export default function PersonaSwitcher({ activePersona, onPersonaChange }: PersonaSwitcherProps) {
    return (
        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-12">
            {personas.map((persona) => {
                const isActive = activePersona === persona.id;
                const Icon = persona.icon;

                return (
                    <button
                        key={persona.id}
                        onClick={() => onPersonaChange(persona.id)}
                        className={`flex flex-col items-center gap-2 p-4 min-w-[120px] rounded-2xl border transition-all duration-300 ${isActive
                            ? `${persona.bgColor} ${persona.borderColor} shadow-lg scale-105 z-10`
                            : 'bg-pr-surface-card border-pr-border hover:bg-pr-surface-2 hover:scale-105'
                            }`}
                    >
                        <div className={`p-3 rounded-xl ${isActive ? 'bg-white shadow-inner' : 'bg-pr-surface-1'}`}>
                            <Icon className={`w-6 h-6 ${isActive ? persona.color : 'text-pr-text-muted'}`} />
                        </div>
                        <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-pr-text-1' : 'text-pr-text-muted'}`}>
                            {persona.label}
                        </span>
                        {isActive && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-pr-text-1 rounded-full animate-ping" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
