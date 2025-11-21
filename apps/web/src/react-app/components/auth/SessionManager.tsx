import { useEffect } from 'react';
import { useSessionTimeout } from '@/react-app/hooks/useSessionTimeout';

export function SessionManager() {
  const { showWarning } = useSessionTimeout();

  // Reserved for future session-related side effects (e.g., showing timeout warnings)
  useEffect(() => {
    // Currently no-op to avoid disrupting active sessions
  }, []);

  // This component doesn't render anything
  return null;
}

export default SessionManager;
