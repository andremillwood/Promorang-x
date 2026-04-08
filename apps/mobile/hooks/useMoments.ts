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

export function useMoments(category: string = 'all') {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMoments = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('moments')
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });

                if (category !== 'all') {
                    query = query.eq('type', category);
                }

                const { data, error } = await query;

                if (error) throw error;
                setMoments(data || []);
            } catch (error) {
                console.error('Error fetching moments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMoments();
    }, [category]);

    return { moments, loading };
}
