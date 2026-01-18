import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Search, TrendingUp, DollarSign, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const BountyHuntHub: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [myFindings, setMyFindings] = useState<any[]>([]);

    const handleScout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/content/scout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                setUrl('');
                // Refresh findings
                fetchFindings();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to connect to the scouting engine.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchFindings = async () => {
        try {
            const response = await fetch('/api/content/my-findings');
            const data = await response.json();
            if (data.success) {
                setMyFindings(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch findings:', error);
        }
    };

    useEffect(() => {
        fetchFindings();
    }, []);

    const totalYield = myFindings.reduce((acc, f) => acc + (parseFloat(f.yield) || 0), 0);
    const topDiscovery = myFindings.length > 0 ? Math.max(...myFindings.map(f => Number(f.views || 0))) : 0;
    const scoutRank = myFindings.length > 10 ? 'Elite' : myFindings.length > 5 ? 'Vanguard' : 'Seeker';

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <header className="flex items-center gap-4">
                <div className="p-3 bg-pr-surface-primary rounded-xl">
                    <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bounty Hunt Hub</h1>
                    <p className="text-gray-500 text-sm">Spot trends. Own the future.</p>
                </div>
            </header>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Spot a New Hit</h2>
                <form onSubmit={handleScout} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste YouTube, TikTok, X, or IG URL..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pr-surface-primary/20"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-pr-surface-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Tag it'}
                    </button>
                </form>
                {message && (
                    <div className={`mt-4 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<TrendingUp className="text-blue-500" />}
                    label="Top Discovery"
                    value={topDiscovery > 1000 ? `${(topDiscovery / 1000).toFixed(1)}K Views` : `${topDiscovery} Views`}
                />
                <StatCard
                    icon={<DollarSign className="text-green-500" />}
                    label="Total Yield"
                    value={`${totalYield.toFixed(2)} Gems`}
                />
                <StatCard
                    icon={<ShieldCheck className="text-purple-500" />}
                    label="Spotter Rank"
                    value={scoutRank}
                />
            </div>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">My Discoveries</h2>
                    <button className="text-pr-surface-primary font-medium hover:underline">View All</button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    {myFindings.map((finding) => (
                        <div
                            key={finding.id}
                            className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b last:border-0 cursor-pointer"
                            onClick={() => navigate(`/contents/${finding.content_id}`)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <ExternalLink className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{finding.title}</p>
                                    <p className="text-xs text-gray-400">{finding.source} • {finding.status}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-pr-surface-primary">{finding.yield}</p>
                                <p className="text-xs text-gray-400">Total Yield</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

export default BountyHuntHub;
