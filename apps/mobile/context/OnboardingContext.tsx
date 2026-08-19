import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type OnboardingContextValue = {
  completed: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  markCompleted: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

const storageKey = (userId: string) => `@promorang_onboarding_complete:${userId}`;

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setCompleted(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const localComplete = await AsyncStorage.getItem(storageKey(user.id));
      if (localComplete === 'true') setCompleted(true);

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferred_categories')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error) {
        const serverComplete = Boolean(data?.preferred_categories?.length);
        setCompleted(serverComplete);
        if (serverComplete) await AsyncStorage.setItem(storageKey(user.id), 'true');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markCompleted = useCallback(async () => {
    if (user) await AsyncStorage.setItem(storageKey(user.id), 'true');
    setCompleted(true);
    setLoading(false);
  }, [user]);

  return (
    <OnboardingContext.Provider value={{ completed, loading, refresh, markCompleted }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}
