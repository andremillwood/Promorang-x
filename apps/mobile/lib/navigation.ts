import { useRouter } from 'expo-router';

/**
 * Safely navigates back if possible, otherwise falls back to a default route.
 * This prevents the "action 'GO_BACK' was not handled by any navigator" error.
 * 
 * @param router The router instance from useRouter()
 * @param fallback The fallback route if back is not possible (defaults to '/(tabs)')
 */
export const safeBack = (router: ReturnType<typeof useRouter>, fallback: any = '/(tabs)') => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
};
