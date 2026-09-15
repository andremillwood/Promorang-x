import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useGlobalSearchParams, usePathname, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { StripeProvider } from '@/lib/stripe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { buildMobileInternalDestination } from '@promorang/shared/mobile-navigation-intent';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TourProvider } from '@/context/TourContext';
import { commerceApi } from '@/lib/api';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import { NotificationNavigationObserver } from '@/components/NotificationNavigationObserver';
import { rememberPendingNavigation, resumePendingNavigation } from '@/lib/pendingNavigation';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [stripePublishableKey, setStripePublishableKey] = useState(
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  );

  useEffect(() => {
    if (stripePublishableKey) return;
    commerceApi.getStripeConfig()
      .then(({ publishableKey }) => setStripePublishableKey(publishableKey || ''))
      .catch(() => {
        // Card checkout retains its hosted fallback when Stripe is unavailable.
      });
  }, [stripePublishableKey]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={stripePublishableKey} urlScheme="promorang">
        <AuthProvider>
          <OnboardingProvider>
            <TourProvider>
              <InitialLayout />
            </TourProvider>
          </OnboardingProvider>
        </AuthProvider>
      </StripeProvider>
    </QueryClientProvider>
  );
}

function InitialLayout() {
  const { session, activeRole, isLoading } = useAuth();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboarding();
  const segments = useSegments();
  const pathname = usePathname();
  const globalSearchParams = useGlobalSearchParams();
  const serializedSearchParams = JSON.stringify(globalSearchParams);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading || onboardingLoading || !isMounted) return;

    let cancelled = false;
    const enforceGate = async () => {
      const inAuthGroup = segments[0] === 'auth';
      const inOnboarding = segments[0] === 'onboarding';
      const roleLanding = activeRole && activeRole !== 'participant' ? '/(tabs)/dashboard' : '/(tabs)';

      let params: Record<string, string | string[] | undefined> = {};
      try {
        params = JSON.parse(serializedSearchParams || '{}');
      } catch {
        params = {};
      }
      const currentDestination = buildMobileInternalDestination(pathname, params);

      if (!session && !inAuthGroup) {
        if (currentDestination) await rememberPendingNavigation(currentDestination);
        if (!cancelled) router.replace('/auth/login');
        return;
      }

      if (session && !onboardingCompleted && !inOnboarding) {
        if (currentDestination) await rememberPendingNavigation(currentDestination);
        if (!cancelled) router.replace('/onboarding');
        return;
      }

      if (session && onboardingCompleted && (inAuthGroup || inOnboarding)) {
        const resumed = await resumePendingNavigation((destination) => {
          if (!cancelled) router.replace(destination as any);
        });
        if (!resumed && !cancelled) router.replace(roleLanding as any);
      }
    };

    void enforceGate();
    return () => {
      cancelled = true;
    };
  }, [
    session,
    activeRole,
    isLoading,
    onboardingCompleted,
    onboardingLoading,
    segments,
    pathname,
    serializedSearchParams,
    isMounted,
    router,
  ]);

  return <><NotificationNavigationObserver /><RootLayoutNav /></>;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const PromorangLightTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#ff6600',
      background: '#fbfaf6',
      card: '#fcfcf9',
      text: '#141414',
      border: '#e2e8f0',
      notification: '#ffcc1a',
    },
  };

  const PromorangDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#ff751a',
      background: '#0f0f0f',
      card: '#1a1a1a',
      text: '#f4f3f0',
      border: '#333333',
      notification: '#ffcc1a',
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? PromorangDarkTheme : PromorangLightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="moment/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="scenes" options={{ headerShown: false }} />
        <Stack.Screen name="scene/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="merchant/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="pieces/[type]/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="proposal/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerTitle: 'Switch Context' }} />
        <Stack.Screen name="create-proposal" options={{ presentation: 'modal', headerTitle: 'Activation Plan' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="give" options={{ headerShown: false }} />
        <Stack.Screen name="stock" options={{ headerShown: false }} />
        <Stack.Screen name="start" options={{ headerShown: false }} />
        <Stack.Screen name="crews" options={{ headerShown: false }} />
        <Stack.Screen name="guilds" options={{ headerShown: false }} />
        <Stack.Screen name="progress" options={{ headerShown: false }} />
        <Stack.Screen name="drop/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="report" options={{ headerShown: false }} />
        <Stack.Screen name="commerce-issue" options={{ headerShown: false }} />
        <Stack.Screen name="guest-rsvp" options={{ headerShown: false }} />
        <Stack.Screen name="guest-check-in" options={{ headerShown: false }} />
        <Stack.Screen name="guest-pass/[token]" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
