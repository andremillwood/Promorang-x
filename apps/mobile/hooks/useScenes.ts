import { useEffect, useState } from 'react';
import type { Scene, SceneMembership } from '@promorang/shared';
import { supabase } from '@/lib/supabase';

const db = supabase as any;

export function useScenes() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => { db.from('scenes').select('*').eq('visibility','public').eq('status','active').order('updated_at',{ascending:false}).then(({data,error}:any) => { if (error) setError(error); else setScenes(data || []); setLoading(false); }); }, []);
  return { scenes, loading, error };
}

export function useScene(slug?: string) {
  const [scene, setScene] = useState<Scene | null>(null);
  const [membership, setMembership] = useState<SceneMembership | null>(null);
  const [moments, setMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refresh = async () => {
    if (!slug) return;
    setLoading(true);
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
    const { data, error: sceneError } = await db.from('scenes').select('*').eq(isId ? 'id' : 'slug', slug).maybeSingle();
    if (sceneError || !data) { setError(sceneError || new Error('Scene unavailable')); setLoading(false); return; }
    setScene(data);
    const user = (await db.auth.getUser()).data.user;
    const [membershipResult, linksResult] = await Promise.all([
      user ? db.from('scene_memberships').select('*').eq('scene_id',data.id).eq('user_id',user.id).maybeSingle() : Promise.resolve({data:null}),
      db.from('moment_scene_links').select('relationship,moments(*)').eq('scene_id',data.id).limit(10),
    ]);
    setMembership(membershipResult.data || null);
    setMoments((linksResult.data || []).map((link:any) => link.moments).filter(Boolean));
    setLoading(false);
  };
  useEffect(() => { void refresh(); }, [slug]);
  const join = async () => {
    if (!scene) return;
    const user = (await db.auth.getUser()).data.user;
    if (!user) throw new Error('Sign in to join this Scene');
    const { error } = await db.from('scene_memberships').upsert({ scene_id: scene.id, user_id: user.id, relationship: 'participant', membership_state: 'active' }, { onConflict: 'scene_id,user_id,relationship' });
    if (error) throw error;
    await refresh();
  };
  return { scene, membership, moments, loading, error, join, refresh };
}
