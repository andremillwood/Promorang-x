import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Share2, 
    TrendingUp, 
    Sparkles, 
    Gift, 
    CheckCircle2, 
    ArrowRight, 
    Clock, 
    Ticket, 
    Tag, 
    Coins, 
    ExternalLink,
    Zap,
    MapPin,
    Copy,
    Check
} from 'lucide-react';
import { useState } from 'react';

interface CreatorDashboardViewProps {
    data: any;
    user: any;
}

export const CreatorDashboardView: React.FC<CreatorDashboardViewProps> = ({
    data,
    user
}) => {
    const navigate = useNavigate();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Daily missions with Gem payouts
    const dailyMissions = [
        {
            id: 'm1',
            title: 'Share Today’s Featured Scene Drop',
            reward: '15 Gems',
            progress: '1/1',
            completed: true,
            claimable: true,
            actionText: 'Claim 15 Gems',
            icon: Share2,
            accent: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20'
        },
        {
            id: 'm2',
            title: 'Real-World Check-In at Partner Venue',
            reward: '25 Gems',
            progress: '0/1',
            completed: false,
            claimable: false,
            actionText: 'Scan In Now',
            actionUrl: '/scan',
            icon: MapPin,
            accent: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
        },
        {
            id: 'm3',
            title: 'Publish a Content Drop or Review',
            reward: '50 Gems',
            progress: '0/1',
            completed: false,
            claimable: false,
            actionText: 'Create Post',
            actionUrl: '/moments/create',
            icon: Zap,
            accent: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'
        }
    ];

    // PromoShare active links
    const promoShareItems = [
        {
            id: 'p1',
            name: 'Kingston Soundclash Live Pass',
            url: 'https://promorang.co/d/soundclash-2026?ref=' + (user?.username || 'me'),
            clicks: 142,
            conversions: 8,
            earnedGems: 40,
            commissionRate: '15%'
        },
        {
            id: 'p2',
            name: 'Common Ground Coffee Perk (20% Off)',
            url: 'https://promorang.co/d/cg-coffee?ref=' + (user?.username || 'me'),
            clicks: 68,
            conversions: 12,
            earnedGems: 24,
            commissionRate: '10%'
        }
    ];

    // Neighborhood drops / opportunities
    const featuredDrops = data?.featured_content || [
        {
            id: 'drop-1',
            title: 'Skyline Sunset Mixer & Rooftop Lounge',
            host_name: 'Skyline Beats',
            preview: 'Exclusive access, live DJ set, plus 2-for-1 signature drinks for verified members.',
            image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=60',
            reward: 'Special Access Pass',
            spotsLeft: 14,
            points: 20
        },
        {
            id: 'drop-2',
            title: 'Downtown Art Crawl & Creator Showcase',
            host_name: 'District Arts Collective',
            preview: 'Show up, capture the gallery walkthrough, and earn instant creator bonuses.',
            image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=60',
            reward: 'Free Entry + 30 Gems',
            spotsLeft: 6,
            points: 30
        }
    ];

    return (
        <div className="space-y-10">
            {/* Section 1: PromoShare Growth Engine */}
            <div className="rounded-3xl bg-[#121016] border border-white/10 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-[#FF5500]" />
                            <h2 className="text-xl font-black text-white tracking-tight">PromoShare Engine</h2>
                        </div>
                        <p className="text-xs text-white/50">Your active distribution links and realtime attribution earnings.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +64 Gems Earned This Week
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promoShareItems.map((item) => (
                        <div key={item.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-white leading-snug">{item.name}</h3>
                                    <span className="text-[10px] text-amber-400 font-mono font-medium">{item.commissionRate} Reward Rate</span>
                                </div>
                                <div className="text-right font-mono">
                                    <span className="text-sm font-black text-emerald-400">+{item.earnedGems}</span>
                                    <span className="text-[10px] text-white/40 block">Gems ($)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-black/40 border border-white/5">
                                <div>
                                    <span className="text-[10px] text-white/40 block">Total Clicks</span>
                                    <span className="font-bold text-white font-mono">{item.clicks}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-white/40 block">Conversions</span>
                                    <span className="font-bold text-white font-mono">{item.conversions}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="text"
                                    readOnly
                                    value={item.url}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] font-mono text-white/60 select-all outline-none"
                                />
                                <button
                                    onClick={() => handleCopy(item.url, item.id)}
                                    className="px-3 py-1.5 rounded-xl bg-[#FF5500]/15 hover:bg-[#FF5500]/25 text-[#FF5500] border border-[#FF5500]/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                                >
                                    {copiedId === item.id ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-emerald-400">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 2: Daily High-Yield Missions */}
            <div className="rounded-3xl bg-[#121016] border border-white/10 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h2 className="text-xl font-black text-white tracking-tight">Today's Daily Quests</h2>
                        </div>
                        <p className="text-xs text-white/50">Complete verified actions before 00:00 midnight to claim instant Gems.</p>
                    </div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 font-bold">
                        90 Gems Available
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dailyMissions.map((m) => {
                        const Icon = m.icon;
                        return (
                            <div 
                                key={m.id}
                                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                                    m.completed && m.claimable
                                        ? 'bg-gradient-to-b from-[#FF5500]/10 to-transparent border-[#FF5500]/30 shadow-lg shadow-[#FF5500]/5'
                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className={`p-2.5 rounded-xl border ${m.accent}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                            +{m.reward}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white leading-snug">{m.title}</h3>
                                        <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
                                            <span>Progress</span>
                                            <span className="font-mono font-bold text-white/80">{m.progress}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    {m.claimable ? (
                                        <button
                                            onClick={() => alert(`🎉 Claimed ${m.reward} successfully!`)}
                                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#E04400] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#FF5500]/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            {m.actionText}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => m.actionUrl && navigate(m.actionUrl)}
                                            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                        >
                                            <span>{m.actionText}</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-white/40" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section 3: Trending Opportunities & Drops Feed */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Today’s Top Opportunities</h2>
                        <p className="text-xs text-white/50">Exclusive perks, live drops, and partner venue experiences.</p>
                    </div>
                    <button
                        onClick={() => navigate('/moments')}
                        className="text-xs font-bold text-[#FF5500] hover:underline flex items-center gap-1"
                    >
                        View All Opportunities <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredDrops.map((drop: any, idx: number) => (
                        <div
                            key={drop.id || idx}
                            className="group overflow-hidden rounded-3xl bg-[#121016] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={drop.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=60'}
                                    alt={drop.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#121016] via-black/40 to-transparent" />
                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-400 border border-white/10">
                                        {drop.reward || 'Exclusive Pass'}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <span className="text-xs font-semibold text-[#FF5500] block">{drop.host_name || 'Verified Venue'}</span>
                                    <h3 className="text-lg font-black text-white tracking-tight leading-snug">{drop.title}</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                                    {drop.preview || drop.subtitle || 'Discover immersive perks and real-world activation rewards.'}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                                        <Coins className="w-3.5 h-3.5" />
                                        +{drop.points || 20} Gem Value
                                    </div>

                                    <button
                                        onClick={() => navigate(drop.drop_id ? `/moments/${drop.drop_id}` : '/moments')}
                                        className="px-5 py-2 rounded-xl bg-white/10 hover:bg-[#FF5500] text-white text-xs font-bold transition-all flex items-center gap-1.5 group-hover:shadow-lg group-hover:shadow-[#FF5500]/20"
                                    >
                                        <span>Unlock Pass</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 4: My Active Passes & Vault Snapshot */}
            <div className="rounded-3xl bg-[#121016] border border-white/10 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-xl font-black text-white tracking-tight">Active Passes & Perks Vault</h2>
                        </div>
                        <p className="text-xs text-white/50">Your active coupons, reservations, and event entries ready to redeem.</p>
                    </div>
                    <button
                        onClick={() => navigate('/coupons')}
                        className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-1"
                    >
                        View All Passes <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                <Ticket className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Roots Culture VIP Access</h4>
                                <p className="text-[11px] text-white/40">Valid through tonight 11:59 PM</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/tickets')}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
                        >
                            Show QR
                        </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                <Tag className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">20% Off Brunch at Common Grounds</h4>
                                <p className="text-[11px] text-white/40">1 Redemption Remaining</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/coupons')}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
                        >
                            Redeem
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatorDashboardView;
