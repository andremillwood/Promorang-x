import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/react-app/lib/supabaseClient';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('OAuth callback error:', error);
        navigate('/auth', { replace: true });
        return;
      }

      if (data?.session) {
        console.log('✅ Session loaded:', data.session);
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    };

    void handleSession();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-gray-600">Finishing sign-in…</p>
    </div>
  );
}
