
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, ExternalLink, Clock, Store, Ticket } from 'lucide-react';
import advertiserService from '@/react-app/services/advertiser';
import { EntryLayout } from '@/react-app/components/entry';
import SEO from '@/react-app/components/SEO';

export default function ExploreCoupons() {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await advertiserService.listPublicCoupons();
            setCoupons(data.coupons || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.merchant_stores?.store_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <EntryLayout>
            <div className="min-h-screen-dynamic bg-pr-surface-background">
                <SEO
                    title="Trading Post Deals | Promorang"
                    description="Discover exclusive coupons and rewards from local Trading Posts on the platform."
                />

                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden bg-pr-surface-1 border-b border-pr-border">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-amber-600/5 rounded-full blur-[140px]" />
                        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-purple-600/5 rounded-full blur-[140px]" />
                    </div>
                    <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
                            <Ticket className="w-3 h-3" />
                            Trading Post Rewards
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Legendary Deals</span>
                        </h1>
                        <p className="text-xl text-pr-text-2 max-w-2xl mx-auto leading-relaxed mb-10">
                            Exclusive coupons and rewards from local Trading Posts across the network. Claim them before they vanish.
                        </p>

                        {/* Search */}
                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pr-text-muted" />
                            <input
                                type="text"
                                placeholder="Search coupons, brands..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-pr-surface-card border border-pr-border text-pr-text-1 placeholder-pr-text-muted focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-16">
                    <div className="max-w-6xl mx-auto px-4">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                            </div>
                        ) : filteredCoupons.length === 0 ? (
                            <div className="text-center py-20 bg-pr-surface-card rounded-3xl border border-pr-border">
                                <Tag className="w-16 h-16 text-pr-text-muted mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-pr-text-1">No coupons found</h3>
                                <p className="text-pr-text-2 mt-2">Try adjusting your search or check back later for new deals.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCoupons.map((coupon) => (
                                    <div
                                        key={coupon.id}
                                        onClick={() => navigate(`/coupons/${coupon.id}`)}
                                        className="group bg-pr-surface-card rounded-2xl border border-pr-border p-6 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    {coupon.merchant_stores?.logo_url ? (
                                                        <img src={coupon.merchant_stores.logo_url} className="w-10 h-10 rounded-full object-cover border border-pr-border" alt="" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-pr-surface-2 flex items-center justify-center border border-pr-border">
                                                            <Store className="w-5 h-5 text-pr-text-muted" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="font-bold text-pr-text-1 group-hover:text-amber-500 transition-colors line-clamp-1">{coupon.title || 'Untitled Coupon'}</h3>
                                                        <p className="text-xs text-pr-text-muted">{coupon.merchant_stores?.store_name || 'Trading Post'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20">
                                                    {coupon.value} {coupon.value_unit} OFF
                                                </div>
                                            </div>

                                            <p className="text-pr-text-2 text-sm mb-6 line-clamp-2 h-10">
                                                {coupon.description || 'No description available for this coupon.'}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-pr-border text-xs text-pr-text-muted">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>Expires {new Date(coupon.expires_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-amber-500 font-medium">
                                                    Details <ExternalLink className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </EntryLayout>
    );
}
