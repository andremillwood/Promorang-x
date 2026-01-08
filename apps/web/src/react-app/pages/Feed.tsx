import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { apiFetch } from '@/react-app/utils/api';
import { Link } from 'react-router-dom';

interface FeedItem {
    id: string;
    type: 'event' | 'drop' | 'content';
    title?: string;
    name?: string; // Events/content might use name or title
    description?: string;
    image_url?: string;
    cover_image?: string;
    created_at: string;
    score: number;
    [key: string]: any;
}

const Feed = () => {
    const { user, token } = useAuth();
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        fetchFeed();
    }, [user]);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            setLoading(true);

            const response = await apiFetch('/api/feed/for-you?limit=50');

            if (!response.ok) throw new Error('Failed to load feed');

            const data = await response.json();
            if (data.status === 'success') {
                setItems(data.data.feed);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInteraction = async (item: FeedItem, type: string) => {
        try {
            await apiFetch('/api/feed/interaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_type: item.type,
                    item_id: item.id,
                    interaction_type: type
                })
            });
        } catch (e) {
            console.error('Failed to log interaction', e);
        }
    };

    // Setup Intersection Observer for view tracking
    useEffect(() => {
        if (loading) return;

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = entry.target.getAttribute('data-index');
                    if (index && items[Number(index)]) {
                        handleInteraction(items[Number(index)], 'view');
                        observerRef.current?.unobserve(entry.target); // Only count view once
                    }
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% visible

        const elements = document.querySelectorAll('.feed-card');
        elements.forEach(el => observerRef.current?.observe(el));

        return () => {
            observerRef.current?.disconnect();
        };
    }, [loading, items]);

    if (loading) return <div className="p-8 text-center">Loading your personalized feed...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
            <h1 className="text-2xl font-bold mb-6">For You</h1>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No recommendations yet. Try exploring categories!</p>
                </div>
            ) : (
                items.map((item, index) => (
                    <div
                        key={`${item.type}-${item.id}`}
                        data-index={index}
                        className="feed-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        onClick={() => handleInteraction(item, 'click')}
                    >
                        {/* Image Header */}
                        {(item.image_url || item.cover_image) && (
                            <div className="h-48 w-full bg-gray-200 relative">
                                <img
                                    src={item.image_url || item.cover_image}
                                    alt={item.title || item.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full uppercase font-medium">
                                    {item.type}
                                </div>
                            </div>
                        )}

                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{item.title || item.name}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.description}</p>

                            <div className="flex justify-between items-center mt-4">
                                <Link
                                    to={`/${item.type}s/${item.id}`}
                                    className="text-primary-600 font-medium text-sm hover:underline"
                                >
                                    View Details →
                                </Link>

                                {/* Debug Score */}
                                <span className="text-xs text-gray-300" title="Recommendation Score">
                                    {Math.round(item.score)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Feed;
