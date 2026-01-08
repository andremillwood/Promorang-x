
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, ExternalLink, Clock, Store } from 'lucide-react';
import advertiserService from '@/react-app/services/advertiser';

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
        coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.merchant_stores?.store_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                        Explore Rewards
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Discover exclusive deals, discounts, and rewards from top brands and creators.
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search coupons, brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900 rounded-3xl border border-gray-800">
                        <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-300">No coupons found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCoupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                onClick={() => navigate(`/coupons/${coupon.id}`)}
                                className="group bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {coupon.merchant_stores?.logo_url ? (
                                                <img src={coupon.merchant_stores.logo_url} className="w-10 h-10 rounded-full object-cover border border-gray-700" alt="" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                                    <Store className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{coupon.title}</h3>
                                                <p className="text-xs text-gray-400">{coupon.merchant_stores?.store_name || 'Partner Brand'}</p>
                                            </div>
                                        </div>
                                        <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/20">
                                            {coupon.value} {coupon.value_unit} OFF
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                                        {coupon.description || 'No description available for this coupon.'}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Expires {new Date(coupon.expires_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-cyan-500 font-medium">
                                            Details <ExternalLink className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
