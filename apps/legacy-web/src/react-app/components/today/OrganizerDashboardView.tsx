import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart3, 
    Users, 
    QrCode, 
    Plus, 
    ArrowUpRight, 
    TrendingUp, 
    Coins, 
    CheckCircle2, 
    Clock, 
    Eye, 
    ShoppingBag, 
    Radio, 
    Sparkles, 
    ShieldCheck, 
    ArrowRight,
    Megaphone,
    FileText
} from 'lucide-react';

interface OrganizerDashboardViewProps {
    data: any;
    user: any;
}

export const OrganizerDashboardView: React.FC<OrganizerDashboardViewProps> = ({
    data,
    user
}) => {
    const navigate = useNavigate();

    // Mock/telemetry campaign metrics
    const campaignStats = {
        totalReach: '24,850',
        claims: 342,
        redemptions: 218,
        conversionRate: '63.7%',
        budgetCommitted: 850,
        budgetRemaining: 320,
        activePromoters: 48
    };

    // Active live campaigns / drops
    const activeCampaigns = [
        {
            id: 'camp-1',
            name: 'Soundclash VIP Experience',
            type: 'Event RSVP / Ticket',
            status: 'Live & Active',
            claimed: 180,
            capacity: 250,
            redemptions: 114,
            budgetGems: 500,
            spentGems: 360,
            accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
        },
        {
            id: 'camp-2',
            name: 'Signature Cocktail Tasting Perk',
            type: 'Merchant Coupon',
            status: 'Live & Active',
            claimed: 162,
            capacity: 200,
            redemptions: 104,
            budgetGems: 350,
            spentGems: 170,
            accent: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
        }
    ];

    // Live redemption log
    const recentRedemptions = [
        {
            id: 'red-1',
            customer: 'Marcus V. (@marcusv)',
            campaign: 'Soundclash VIP Experience',
            time: '8 minutes ago',
            status: 'Verified & Logged',
            gemValue: 15
        },
        {
            id: 'red-2',
            customer: 'Elena R. (@elenacreates)',
            campaign: 'Signature Cocktail Tasting Perk',
            time: '24 minutes ago',
            status: 'Verified & Logged',
            gemValue: 10
        },
        {
            id: 'red-3',
            customer: 'David K. (@davidk_vibes)',
            campaign: 'Soundclash VIP Experience',
            time: '1 hour ago',
            status: 'Verified & Logged',
            gemValue: 15
        }
    ];

    // Top promoters delivering traffic
    const topPromoters = [
        {
            name: 'Aaliyah (@aaliyah_kingston)',
            clicks: 430,
            redemptions: 42,
            payoutGems: 84
        },
        {
            name: 'Jordan Cruz (@jcruz_vibes)',
            clicks: 310,
            redemptions: 28,
            payoutGems: 56
        }
    ];

    return (
        <div className="space-y-10">
            {/* Section 1: Executive Telemetry Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#121016] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-white/50 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-sky-400" />
                            Total Audience Reach
                        </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                        {campaignStats.totalReach}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +18.4% vs last week
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121016] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-white/50 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <ShoppingBag className="w-4 h-4 text-emerald-400" />
                            Realized Redemptions
                        </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                        {campaignStats.redemptions} <span className="text-xs text-white/40 font-normal">/ {campaignStats.claims} claims</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium font-mono">
                        {campaignStats.conversionRate} Show-up Rate
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121016] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-white/50 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-amber-400" />
                            Committed Gem Reserve
                        </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                        {campaignStats.budgetRemaining} <span className="text-xs text-white/40 font-normal">Gems Left</span>
                    </div>
                    <div className="text-[11px] text-white/40">
                        {campaignStats.budgetCommitted} Total Allocated
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121016] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-white/50 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#FF5500]" />
                            Active Promoters
                        </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                        {campaignStats.activePromoters}
                    </div>
                    <div className="text-[11px] text-[#FF5500] font-medium">
                        Live Social Distribution
                    </div>
                </div>
            </div>

            {/* Section 2: Active Campaigns & Capacity Status */}
            <div className="rounded-3xl bg-[#121016] border border-white/10 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-[#FF5500] animate-pulse" />
                            <h2 className="text-xl font-black text-white tracking-tight">Active Drops & Moments</h2>
                        </div>
                        <p className="text-xs text-white/50">Real-time capacity, foot traffic conversion, and reward disbursements.</p>
                    </div>
                    <button
                        onClick={() => navigate('/drops/create')}
                        className="px-4 py-2 rounded-xl bg-[#FF5500] hover:bg-[#E04400] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF5500]/20 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Campaign Drop
                    </button>
                </div>

                <div className="space-y-4">
                    {activeCampaigns.map((camp) => {
                        const claimPercent = Math.round((camp.claimed / camp.capacity) * 100);
                        const redeemPercent = Math.round((camp.redemptions / camp.claimed) * 100);

                        return (
                            <div key={camp.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-white">{camp.name}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${camp.accent}`}>
                                                {camp.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/40">{camp.type}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => navigate('/advertiser/campaigns')}
                                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
                                        >
                                            View Analytics
                                        </button>
                                        <button
                                            onClick={() => navigate('/scan')}
                                            className="px-3.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                                        >
                                            <QrCode className="w-3.5 h-3.5" />
                                            Scan Customer Pass
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs text-white/50">
                                            <span>Claimed Capacity</span>
                                            <span className="font-mono font-bold text-white/80">{camp.claimed} / {camp.capacity} ({claimPercent}%)</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-500 to-[#FF5500] rounded-full" style={{ width: `${claimPercent}%` }} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs text-white/50">
                                            <span>Redemption Foot Traffic</span>
                                            <span className="font-mono font-bold text-emerald-400">{camp.redemptions} ({redeemPercent}%)</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${redeemPercent}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section 3: Real-Time Customer Scanner & Live Validation Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scanner Launch Card */}
                <div className="rounded-3xl bg-gradient-to-b from-indigo-950/40 to-[#121016] border border-indigo-500/20 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <QrCode className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight">On-Site QR Verification</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Scan attendee QR codes at your door or point-of-sale to instantly redeem passes, record verified attendance, and unlock creator payouts.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/scan')}
                        className="w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <QrCode className="w-4 h-4" />
                        Launch High-Speed Scanner
                    </button>
                </div>

                {/* Live Redemption Feed */}
                <div className="lg:col-span-2 rounded-3xl bg-[#121016] border border-white/10 p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-white">Recent Customer Redemptions</h3>
                        </div>
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Live Audit Trail</span>
                    </div>

                    <div className="space-y-3">
                        {recentRedemptions.map((red) => (
                            <div key={red.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <span>{red.customer}</span>
                                        <span className="text-[10px] text-white/40 font-normal">· {red.time}</span>
                                    </div>
                                    <p className="text-[11px] text-white/50">{red.campaign}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-emerald-400 font-mono block">Validated</span>
                                    <span className="text-[10px] text-white/40 font-mono">{red.gemValue} Gems Settled</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Section 4: Top Promoters & Quick Ops Action Suite */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Promoters */}
                <div className="rounded-3xl bg-[#121016] border border-white/10 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-bold text-white">Top Converting Promoters</h3>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">Audience Growth</span>
                    </div>

                    <div className="space-y-3">
                        {topPromoters.map((p, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                                    <p className="text-[10px] text-white/40">{p.clicks} Link Clicks · {p.redemptions} Verified Guests</p>
                                </div>
                                <div className="text-right font-mono">
                                    <span className="text-xs font-bold text-amber-400">+{p.payoutGems} Gems</span>
                                    <span className="text-[10px] text-white/40 block">Earned</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operations Quick Actions */}
                <div className="rounded-3xl bg-[#121016] border border-white/10 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#FF5500]" />
                            <h3 className="text-sm font-bold text-white">Operations Actions</h3>
                        </div>
                        <span className="text-[10px] text-white/40 font-mono">Executive Tools</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate('/drops/create')}
                            className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-all space-y-1 group"
                        >
                            <Plus className="w-4 h-4 text-[#FF5500] group-hover:scale-110 transition-transform" />
                            <div className="text-xs font-bold text-white">Post New Drop</div>
                            <p className="text-[10px] text-white/40">Launch event or offer</p>
                        </button>

                        <button
                            onClick={() => navigate('/wallet')}
                            className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-all space-y-1 group"
                        >
                            <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                            <div className="text-xs font-bold text-white">Fund Reserve</div>
                            <p className="text-[10px] text-white/40">Deposit activation Gems</p>
                        </button>

                        <button
                            onClick={() => navigate('/advertiser/campaigns')}
                            className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-all space-y-1 group"
                        >
                            <BarChart3 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <div className="text-xs font-bold text-white">Full Analytics</div>
                            <p className="text-[10px] text-white/40">Campaign ROI audit</p>
                        </button>

                        <button
                            onClick={() => navigate('/advertiser/team')}
                            className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-all space-y-1 group"
                        >
                            <FileText className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                            <div className="text-xs font-bold text-white">Team & Venues</div>
                            <p className="text-[10px] text-white/40">Manage staff access</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboardView;
