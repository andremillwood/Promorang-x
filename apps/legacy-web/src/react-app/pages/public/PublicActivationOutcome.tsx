import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import {
    Users,
    Diamond,
    MapPin,
    ShieldCheck,
    ArrowRight,
    ExternalLink,
    Sparkles,
    Zap,
    Globe
} from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface Proof {
    url: string;
    type: 'image' | 'video';
    user: {
        display_name: string;
        avatar_url?: string;
    };
}

interface OutcomeData {
    success: boolean;
    drop: {
        id: string;
        title: string;
        description: string;
        creator_name: string;
        preview_image?: string;
        status: string;
    };
    stats: {
        participants: number;
        creditsAwarded: number;
        gpsVerifiedRate: number;
    };
    proofs: Proof[];
}

export default function PublicActivationOutcome() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<OutcomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOutcome() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/drops/${id}/outcome`);
                if (!response.ok) throw new Error('Outcome not found');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load outcome');
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchOutcome();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen-dynamic bg-pr-surface-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen-dynamic bg-pr-surface-background flex flex-col">
            <MarketingNav />
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-pr-text-1">Activation Not Found</h1>
                <p className="text-pr-text-2 mt-2">This activation record may be private or hasn't started yet.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 text-primary font-bold hover:underline"
                >
                    Return Home
                </button>
            </div>
            <MarketingFooter />
        </div>
    );

    const { drop, stats, proofs } = data;

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title={`${drop.title} | Brand Impact Outcome`}
                description={`See how ${drop.creator_name} activated their community on Promorang.`}
                ogImage={drop.preview_image}
            />
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent -z-10" />
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Activation Outcome
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-pr-text-1 tracking-tight mb-4 text-balance">
                        {drop.creator_name} has activated <span className="text-primary">{stats.participants}</span> innovators.
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-3xl mx-auto leading-relaxed">
                        Through the {drop.title} activation, real-world impact was captured, verified, and rewarded.
                    </p>
                </div>
            </section>

            {/* Impact Grid */}
            <section className="py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-pr-surface-card p-8 rounded-3xl border border-pr-surface-3 shadow-sm text-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black text-pr-text-1">{stats.participants}</div>
                            <div className="text-sm font-bold text-pr-text-3 uppercase tracking-tighter">Verified Participants</div>
                        </div>
                        <div className="bg-pr-surface-card p-8 rounded-3xl border border-pr-surface-3 shadow-sm text-center">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Diamond className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black text-pr-text-1">{stats.creditsAwarded}</div>
                            <div className="text-sm font-bold text-pr-text-3 uppercase tracking-tighter">Credits Distributed</div>
                        </div>
                        <div className="bg-pr-surface-card p-8 rounded-3xl border border-pr-surface-3 shadow-sm text-center">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black text-pr-text-1">{Math.round(stats.gpsVerifiedRate * 100)}%</div>
                            <div className="text-sm font-bold text-pr-text-3 uppercase tracking-tighter">GPS Proof Accuracy</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Proof Gallery */}
            {proofs.length > 0 && (
                <section className="py-20 px-4 bg-pr-surface-1 border-y border-pr-surface-3">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-pr-text-1 tracking-tight">Execution Transparency</h2>
                                <p className="text-lg text-pr-text-2 mt-2">Browse a selection of verified community proof-of-work.</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-pr-text-3">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                                    <ShieldCheck className="w-4 h-4" />
                                    AI & GPS Audited
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {proofs.map((proof, idx) => (
                                <div key={idx} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-pr-surface-2 border border-pr-surface-3 shadow-sm">
                                    <img
                                        src={proof.url}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        alt="Proof"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <div className="flex items-center gap-2">
                                            {proof.user.avatar_url && (
                                                <img src={proof.user.avatar_url} className="w-6 h-6 rounded-full border border-white/20" alt="" />
                                            )}
                                            <span className="text-white text-xs font-bold">{proof.user.display_name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* PLG Context / CTA Section */}
            <section className="py-24 px-4 text-center md:text-left">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-primary to-violet-600 rounded-[2.5rem] p-8 md:p-16 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Sparkles className="w-64 h-64" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black mb-6">This impact was powered by <span className="opacity-80">Promorang.</span></h2>
                            <p className="text-xl text-white/90 mb-10 leading-relaxed">
                                We provide brands with high-integrity activation infrastructure that yields verifiable, real-world outcomes instead of speculative attention.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/brands')}
                                    className="px-8 py-4 bg-white text-primary font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-xl active:scale-95"
                                >
                                    Scale Your Brand <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-8 py-4 bg-black/20 text-white font-black rounded-2xl border border-white/20 flex items-center justify-center gap-2 hover:bg-black/30 transition-all active:scale-95"
                                >
                                    Join as a Creator
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
                        <div>
                            <h3 className="text-xl font-black text-pr-text-1 mb-4 flex items-center gap-2 justify-center md:justify-start">
                                <Zap className="w-5 h-5 text-primary" /> Verifiable ROI
                            </h3>
                            <p className="text-pr-text-2 leading-relaxed">
                                Every participant in this activation provided hard proof of execution, from GPS-stamped check-ins to deep-link verification. Brands only pay for actual outcomes.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-pr-text-1 mb-4 flex items-center gap-2 justify-center md:justify-start">
                                <Globe className="w-5 h-5 text-primary" /> Global Scale
                            </h3>
                            <p className="text-pr-text-2 leading-relaxed">
                                Promorang's infrastructure allows brands to activate thousands of creators simultaneously across various platforms and physical locations with zero manual overhead.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
