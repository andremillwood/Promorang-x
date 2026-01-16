import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';
import superjson from 'superjson';
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/authStore';
import { useFeedStore } from '@/store/feedStore';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { usePathname } from 'expo-router';
import { analytics } from '@/lib/analytics';
import { ToastProvider } from '@/components/ui/ActivityToasts';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <View style={errorStyles.container}>
      <Text style={errorStyles.title}>Something went wrong</Text>
      <Text style={errorStyles.message}>
        {error.message || 'An unexpected error occurred'}
      </Text>
      <Button
        title="Try Again"
        onPress={resetErrorBoundary}
        variant="primary"
        style={errorStyles.button}
      />
    </View>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const { initializeUser, isAuthenticated, isGuest, hasSeenWelcome } = useAuthStore();
  const { fetchPosts } = useFeedStore();
  const { fetchTasks } = useTaskStore();
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();

  usePushNotifications();

  // Auth gate: redirect based on auth state
  useEffect(() => {
    // Wait for the navigation tree to be ready
    if (!rootNavigationState?.key) return;

    // Use a small timeout to ensure the navigator is fully committed
    const timeout = setTimeout(() => {
      // Ensure segments is populated before analyzing path
      if (!segments || segments.length === 0) return;

      const inAuthGroup = segments[0] === '(auth)';

      if (isAuthenticated || isGuest) {
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
        return;
      }

      // User is not authenticated and not a guest
      if (!inAuthGroup) {
        if (!hasSeenWelcome) {
          router.replace('/(auth)/welcome');
        } else {
          router.replace('/(auth)/login');
        }
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isGuest, hasSeenWelcome, segments, rootNavigationState?.key]);

  useEffect(() => {
    analytics.screen(pathname);
  }, [pathname]);

  useEffect(() => {
    // Initialize app data
    try {
      initializeUser();
      fetchPosts();
      fetchTasks();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }, [initializeUser, fetchPosts, fetchTasks]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/index" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="profile/[id]" options={{ title: 'Profile' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="post/[id]" options={{ title: 'Post Details' }} />
      <Stack.Screen name="task/[id]" options={{ title: 'Task Details' }} />
      <Stack.Screen name="campaign/[id]" options={{ title: 'Campaign Details' }} />
      <Stack.Screen name="forecast/[id]" options={{ title: 'Forecast Details' }} />
      <Stack.Screen name="withdraw" options={{ title: 'Withdraw Funds' }} />
      <Stack.Screen name="content-share/[id]" options={{ title: 'Content Share' }} />
      <Stack.Screen name="search/index" options={{ headerShown: false }} />
      <Stack.Screen name="matrix/index" options={{ title: 'Matrix Dashboard', headerStyle: { backgroundColor: '#7c3aed' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="matrix/training" options={{ title: 'Training', headerStyle: { backgroundColor: '#7c3aed' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="matrix/join" options={{ headerShown: false }} />
      <Stack.Screen name="deals/index" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
    </Stack>
  );
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Use production API
  const API_BASE_URL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://promorang-api.vercel.app';

  const [trpcClient] = useState(() => trpc.createClient({
    links: [
      httpLink({
        url: `${API_BASE_URL}/api/trpc`,
        transformer: superjson,
      }),
    ],
  }));

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error: Error, errorInfo: any) => {
        console.error('App Error:', error, errorInfo);
        // In production, you would send this to a crash reporting service
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <RootLayoutNav />
            </ToastProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    minWidth: 120,
  },
});