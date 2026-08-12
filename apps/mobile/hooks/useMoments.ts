import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Moment {
    id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    status: string;
    organizer_id: string;
    image_url?: string;
    created_at: string;
}

export const DEMO_MOMENTS: Moment[] = [
    {
        id: 'demo-1',
        title: 'Austin Rooftop Sunset Listening Party',
        description: 'Exclusive unreleased track preview, live vinyl set, and complimentary craft refreshments on the downtown rooftop.',
        location: 'Downtown Austin, TX',
        type: 'event',
        status: 'active',
        organizer_id: 'org-demo-1',
        image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=85',
        created_at: new Date().toISOString()
    },
    {
        id: 'demo-2',
        title: 'Speakeasy Secret Cocktail Drop',
        description: 'Show up at Midnight Lounge before 10 PM. Show your Promorang badge for exclusive access and signature menu items.',
        location: 'East Side, Austin, TX',
        type: 'drop',
        status: 'active',
        organizer_id: 'org-demo-2',
        image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=85',
        created_at: new Date().toISOString()
    },
    {
        id: 'demo-3',
        title: 'Indie Film Screening & Director Q&A',
        description: 'Private screening of "Echoes of Tomorrow" followed by an intimate Q&A session with the creative team.',
        location: 'South Lamar, Austin, TX',
        type: 'cultural',
        status: 'active',
        organizer_id: 'org-demo-3',
        image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85',
        created_at: new Date().toISOString()
    }
];

export function useMoments(category: string = 'all') {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchMoments = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('moments')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (category !== 'all') {
                    query = query.or(`type.eq.${category},category.eq.${category}`);
                }

                const { data, error } = await query;

                if (error) {
                    console.warn('Supabase query failed, falling back to demo moments:', error.message);
                    setMoments(DEMO_MOMENTS);
                    setError(error);
                } else if (data && data.length > 0) {
                    setMoments(data);
                    setError(null);
                } else {
                    // Fallback to demo moments if database currently has no records
                    setMoments(DEMO_MOMENTS);
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching moments:', err);
                setMoments(DEMO_MOMENTS);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchMoments();
    }, [category]);

    return { moments, loading, error };
}
