import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TourProvider } from '@/context/TourContext';
import { useRouter, useSegments } from 'expo-router';

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

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans: require('../assets/fonts/DMSans-Regular.ttf'),
    Fraunces: require('../assets/fonts/Fraunces-Regular.ttf'),
    ...FontAwesome.font,
  });

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
    <AuthProvider>
      <TourProvider>
        <InitialLayout />
      </TourProvider>
    </AuthProvider>
  );
}

function InitialLayout() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading || !isMounted) return;

    const inAuthGroup = segments[0] === 'auth';

    if (session && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    }
  }, [session, isLoading, segments, isMounted]);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const PromorangLightTheme: Theme = {
    dark: false,
    colors: {
      primary: '#ff6600',
      background: '#fbfaf6',
      card: '#fcfcf9',
      text: '#141414',
      border: '#e2e8f0',
      notification: '#ffcc1a',
    },
  };

  const PromorangDarkTheme: Theme = {
    dark: true,
    colors: {
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
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerTitle: 'Switch Context' }} />
        <Stack.Screen name="create-proposal" options={{ presentation: 'modal', headerTitle: 'Create Proposal' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
