import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Users } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface Drop {
    id: string;
    title: string;
    description: string;
    preview_image?: string;
    creator_name?: string;
    promo_points_reward: number;
    current_participants: number;
    status: string;
}

export default function FeaturedDropsSection() {
    const [drops, setDrops] = useState<Drop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDrops() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/drops/public?limit=4`);
                if (response.ok) {
                    const data = await response.json();
                    setDrops(data.slice(0, 4) || []);
                }
            } catch (error) {
                console.error('Failed to fetch drops:', error);
                // Use demo data if fetch fails
                setDrops([
                    { id: '1', title: 'Summer Fashion Drop', description: 'Share this look', preview_image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', creator_name: 'StyleCo', promo_points_reward: 50, current_participants: 127, status: 'active' },
                    { id: '2', title: 'Tech Review Campaign', description: 'Review our product', preview_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', creator_name: 'TechBrand', promo_points_reward: 100, current_participants: 89, status: 'active' },
                    { id: '3', title: 'Local Eats Promo', description: 'Share your meal', preview_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', creator_name: 'FoodieHub', promo_points_reward: 25, current_participants: 234, status: 'active' },
                    { id: '4', title: 'Fitness Challenge', description: 'Join the movement', preview_image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', creator_name: 'FitLife', promo_points_reward: 75, current_participants: 156, status: 'active' }
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchDrops();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (drops.length === 0) return null;

    return (
        <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-bold text-yellow-500 uppercase tracking-wider">Featured Drops</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-pr-text-1">
                            Earn Promo Points Now
                        </h2>
                    </div>
                    <Link
                        to="/earn"
                        className="hidden sm:flex items-center gap-2 text-blue-500 hover:underline font-medium"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Drops Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {drops.map((drop) => (
                        <Link
                            key={drop.id}
                            to={`/d/${drop.id}`}
                            className="group bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-500/50 transition-all"
                        >
                            <div className="aspect-video bg-pr-surface-2 relative overflow-hidden">
                                {drop.preview_image ? (
                                    <img
                                        src={drop.preview_image}
                                        alt={drop.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Sparkles className="w-12 h-12 text-pr-text-muted" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    +{drop.promo_points_reward} PP
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-pr-text-1 line-clamp-1 mb-1 group-hover:text-blue-500 transition-colors">
                                    {drop.title}
                                </h3>
                                <p className="text-xs text-pr-text-muted mb-2">{drop.creator_name}</p>
                                <div className="flex items-center gap-3 text-xs text-pr-text-2">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {drop.current_participants}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 sm:hidden text-center">
                    <Link
                        to="/earn"
                        className="inline-flex items-center gap-2 text-blue-500 hover:underline font-medium"
                    >
                        View All Drops <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
