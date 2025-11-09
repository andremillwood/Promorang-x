import { useEffect } from 'react';
import { useSessionTimeout } from '@/react-app/hooks/useSessionTimeout';
import { useAuth } from '@/react-app/hooks/useAuth';

export function SessionManager() {
  const { showWarning } = useSessionTimeout();
  const { signOut } = useAuth();

  // Handle browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Refresh session when user comes back to the tab
        await signOut();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [signOut]);

  // This component doesn't render anything
  return null;
}

export default SessionManager;
