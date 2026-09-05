import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { StripeProvider } from '@/lib/stripe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TourProvider } from '@/context/TourContext';
import { useRouter, useSegments } from 'expo-router';
import { commerceApi } from '@/lib/api';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import { NotificationNavigationObserver } from '@/components/NotificationNavigationObserver';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
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

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
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
  const { session, isLoading } = useAuth();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading || onboardingLoading || !isMounted) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (session && !onboardingCompleted && !inOnboarding) {
      router.replace('/onboarding');
    } else if (session && onboardingCompleted && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    }
  }, [session, isLoading, onboardingCompleted, onboardingLoading, segments, isMounted]);

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
