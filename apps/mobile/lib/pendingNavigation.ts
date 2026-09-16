import {
  createMobilePendingNavigation,
  parseMobilePendingNavigation,
  type MobilePendingNavigation,
} from '@promorang/shared/mobile-navigation-intent';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/lib/secureStore';

const PENDING_NAVIGATION_KEY = 'promorang_pending_mobile_navigation';

export async function rememberPendingNavigation(destination: string): Promise<MobilePendingNavigation | null> {
  const pending = createMobilePendingNavigation(destination);
  if (!pending) return null;
  await setSecureItem(PENDING_NAVIGATION_KEY, JSON.stringify(pending));
  return pending;
}

export async function readPendingNavigation(): Promise<MobilePendingNavigation | null> {
  const raw = await getSecureItem(PENDING_NAVIGATION_KEY);
  if (!raw) return null;
  const pending = parseMobilePendingNavigation(raw);
  if (!pending) {
    await deleteSecureItem(PENDING_NAVIGATION_KEY);
    return null;
  }
  return pending;
}

export async function clearPendingNavigation(): Promise<void> {
  await deleteSecureItem(PENDING_NAVIGATION_KEY);
}

export async function resumePendingNavigation(
  navigate: (destination: string) => void,
): Promise<string | null> {
  const pending = await readPendingNavigation();
  if (!pending) return null;

  navigate(pending.destination);
  await clearPendingNavigation();
  return pending.destination;
}
