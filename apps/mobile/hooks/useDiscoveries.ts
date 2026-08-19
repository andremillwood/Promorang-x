import { useEffect, useState } from 'react';
import type { Discovery } from '@promorang/shared';
import { supabase } from '@/lib/supabase';

const db = supabase as any;

export function useDiscoveries(category?: string) {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDiscoveries = async () => {
    setLoading(true);
    let query = db
      .from('discoveries')
      .select('*')
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error: err } = await query;
    if (err) {
      setError(err);
    } else {
      setDiscoveries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchDiscoveries();
  }, [category]);

  return { discoveries, loading, error, refresh: fetchDiscoveries };
}

export function useDiscovery(slug?: string) {
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [scene, setScene] = useState<any>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDiscovery = async () => {
    if (!slug) return;
    setLoading(true);
    const { data, error: err } = await db.from('discoveries').select('*').eq('slug', slug).maybeSingle();
    if (err || !data) {
      setError(err || new Error('Discovery unavailable'));
      setLoading(false);
      return;
    }

    setDiscovery(data);

    // Fetch Scene link if available
    if (data.scene_id) {
      const { data: s } = await db.from('scenes').select('id, slug, title, city').eq('id', data.scene_id).maybeSingle();
      if (s) setScene(s);
    }

    // Fetch Creator Profile if available
    if (data.creator_id) {
      const { data: p } = await db.from('profiles').select('id, display_name, username, avatar_url').eq('id', data.creator_id).maybeSingle();
      if (p) setCreatorProfile(p);
    }

    setLoading(false);
  };

  useEffect(() => {
    void fetchDiscovery();
  }, [slug]);

  const save = async () => {
    if (!discovery) return;
    const user = (await db.auth.getUser()).data.user;
    if (!user) throw new Error('Sign in required');
    await db.from('discoveries').update({ save_count: (discovery.save_count || 0) + 1 }).eq('id', discovery.id);
    setDiscovery((prev) => (prev ? { ...prev, save_count: (prev.save_count || 0) + 1 } : null));
  };

  const checkIn = async () => {
    if (!discovery) return;
    const user = (await db.auth.getUser()).data.user;
    if (!user) throw new Error('Sign in required');
    await db.from('discoveries').update({ checkin_count: (discovery.checkin_count || 0) + 1 }).eq('id', discovery.id);
    setDiscovery((prev) => (prev ? { ...prev, checkin_count: (prev.checkin_count || 0) + 1 } : null));
  };

  return { discovery, scene, creatorProfile, loading, error, save, checkIn, refresh: fetchDiscovery };
}
