import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface InboxNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function useInboxActivity() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InboxNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setNotifications([]); setLoading(false); return; }
    const { data, error: queryError } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (queryError) setError(queryError);
    else { setNotifications((data || []) as InboxNotification[]); setError(null); }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return;
    const channel = supabase.channel(`mobile-inbox-${user.id}`).on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}`,
    }, ({ new: incoming }) => {
      setNotifications((current) => [incoming as InboxNotification, ...current.filter((item) => item.id !== incoming.id)]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refresh]);

  const markRead = async (id: string) => {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
    const { error: updateError } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user?.id);
    if (updateError) { setError(updateError); await refresh(); throw updateError; }
  };

  const markAllRead = async () => {
    if (!user) return;
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    const { error: updateError } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    if (updateError) { setError(updateError); await refresh(); throw updateError; }
  };

  return { notifications, loading, error, refresh, markRead, markAllRead };
}
