import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';
import superjson from 'superjson';
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text, StyleSheet } from 'react-native';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/authStore';
import { useFeedStore } from '@/store/feedStore';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';

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

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { usePathname } from 'expo-router';
import { analytics } from '@/lib/analytics';

function RootLayoutNav() {
  const { initializeUser } = useAuthStore();
  const { fetchPosts } = useFeedStore();
  const { fetchTasks } = useTaskStore();
  const pathname = usePathname();

  usePushNotifications();

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
      <Stack.Screen name="profile/[id]" options={{ title: 'Profile' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="post/[id]" options={{ title: 'Post Details' }} />
      <Stack.Screen name="task/[id]" options={{ title: 'Task Details' }} />
      <Stack.Screen name="campaign/[id]" options={{ title: 'Campaign Details' }} />
      <Stack.Screen name="bet/[id]" options={{ title: 'Bet Details' }} />
      <Stack.Screen name="withdraw" options={{ title: 'Withdraw Funds' }} />
      <Stack.Screen name="content-share/[id]" options={{ title: 'Content Share' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
    </Stack>
  );
}

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

  const [trpcClient] = useState(() => trpc.createClient({
    links: [
      httpLink({
        url: process.env.EXPO_PUBLIC_RORK_API_BASE_URL
          ? `${process.env.EXPO_PUBLIC_RORK_API_BASE_URL}/api/trpc`
          : 'http://localhost:3000/api/trpc',
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
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </trpc.Provider>
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