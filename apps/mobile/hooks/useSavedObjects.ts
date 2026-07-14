import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export type SavedObjectType = 'moment' | 'mission' | 'creator' | 'scene' | 'product' | 'offer' | 'piece' | 'merchant' | 'content' | 'campaign';
export interface SavedObject {
  id: string;
  user_id: string;
  object_type: SavedObjectType;
  object_id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useSavedObjects() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    const { data, error: queryError } = await supabase.from('saved_objects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (queryError) setError(queryError);
    else { setItems((data || []) as SavedObject[]); setError(null); }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const isSaved = (type: SavedObjectType, objectId: string) => items.some((item) => item.object_type === type && item.object_id === objectId);
  const toggle = async (object: Omit<SavedObject, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('Sign in to save objects.');
    const existing = items.find((item) => item.object_type === object.object_type && item.object_id === object.object_id);
    if (existing) {
      setItems((current) => current.filter((item) => item.id !== existing.id));
      const { error: removeError } = await supabase.from('saved_objects').delete().eq('id', existing.id).eq('user_id', user.id);
      if (removeError) { await refresh(); throw removeError; }
      return false;
    }
    const optimistic = { ...object, id: `pending-${Date.now()}`, user_id: user.id, created_at: new Date().toISOString() };
    setItems((current) => [optimistic, ...current]);
    const { data, error: insertError } = await supabase.from('saved_objects').insert({ ...object, user_id: user.id }).select('*').single();
    if (insertError) { await refresh(); throw insertError; }
    setItems((current) => [data as SavedObject, ...current.filter((item) => item.id !== optimistic.id)]);
    return true;
  };

  const remove = async (id: string) => {
    if (!user) return;
    setItems((current) => current.filter((item) => item.id !== id));
    const { error: removeError } = await supabase.from('saved_objects').delete().eq('id', id).eq('user_id', user.id);
    if (removeError) { setError(removeError); await refresh(); throw removeError; }
  };

  return { items, loading, error, refresh, isSaved, toggle, remove };
}
