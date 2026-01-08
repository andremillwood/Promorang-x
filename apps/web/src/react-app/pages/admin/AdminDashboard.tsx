import { useEffect, useState } from 'react';
import { Users, ShieldAlert, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminStats {
    total_users: number;
    pending_kyc: number;
    total_withdrawals: number;
    active_campaigns: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-white">Loading stats...</div>;
    }

    const statCards = [
        {
            label: 'Pending KYC',
            value: stats?.pending_kyc || 0,
            icon: ShieldAlert,
            color: 'text-orange-400',
            bgColor: 'bg-orange-400/10',
            link: '/admin/kyc'
        },
        {
            label: 'Total Users',
            value: (stats?.total_users || 0).toLocaleString(),
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
            link: '/admin/users'
        },
        {
            label: 'Withdrawals (Est)',
            value: `$${(stats?.total_withdrawals || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10',
            link: null
        },
        {
            label: 'Active Campaigns',
            value: stats?.active_campaigns || 0,
            icon: Activity,
            color: 'text-purple-400',
            bgColor: 'bg-purple-400/10',
            link: null
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-2">Platform overview and pending actions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        {stat.link && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <Link
                                    to={stat.link}
                                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    View Details <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                    <div className="text-gray-400 text-sm text-center py-8">
                        Chart integration coming soon...
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">System Health</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <span className="text-gray-300">Database Connection</span>
                            <span className="text-green-400 text-sm font-medium px-2 py-1 bg-green-400/10 rounded">Healthy</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <span className="text-gray-300">API Latency</span>
                            <span className="text-green-400 text-sm font-medium px-2 py-1 bg-green-400/10 rounded">45ms</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <span className="text-gray-300">Storage Usage</span>
                            <span className="text-blue-400 text-sm font-medium px-2 py-1 bg-blue-400/10 rounded">42%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
