import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from '@/react-app/components/ui/use-toast';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIMEOUT = 5 * 60 * 1000; // Show warning 5 minutes before logout

export function useSessionTimeout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showWarningRef = useRef(showWarning);

  // Keep the ref in sync with state
  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  const resetTimers = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    setShowWarning(false);

    // Set new timeout for showing warning
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      
      // Show warning toast
      toast({
        title: 'Session Expiring Soon',
        description: 'You will be logged out due to inactivity in 5 minutes.',
        type: 'warning',
        duration: 10000, // Show for 10 seconds
      });
      
      // Set timeout for actual logout
      timeoutRef.current = setTimeout(async () => {
        try {
          await auth.signOut();
          navigate('/auth', { state: { sessionExpired: true } });
          toast({
            title: 'Session Expired',
            description: 'You have been logged out due to inactivity.',
            type: 'info',
          });
        } catch (error) {
          console.error('Error during sign out:', error);
          toast({
            title: 'Error',
            description: 'Failed to sign out. Please try again.',
            type: 'destructive',
          });
        }
      }, WARNING_TIMEOUT);
    }, INACTIVITY_TIMEOUT - WARNING_TIMEOUT);
  }, [auth, navigate, toast]);

  // Set up event listeners for user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const onActivity = () => {
      if (showWarningRef.current) {
        toast({
          title: 'Session Extended',
          description: 'Your session has been extended due to activity.',
          type: 'success',
        });
      }
      resetTimers();
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, onActivity, { passive: true });
    });

    // Initial setup
    resetTimers();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, onActivity);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [resetTimers, toast]);

  return { showWarning };
}
