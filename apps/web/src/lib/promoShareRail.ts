/**
 * PromoShare Universal Distribution and Attribution Rail
 *
 * Connects all shareable Promorang entities (Discoveries, Perks, Moments, Missions, Pieces)
 * with single-level persistent referral attribution.
 */

export type ShareableObjectType =
  | 'perk'
  | 'discovery'
  | 'moment'
  | 'mission'
  | 'piece'
  | 'campaign'
  | 'creator';

export interface PromoShareConfig {
  objectType: ShareableObjectType;
  objectId: string;
  title: string;
  description?: string;
  customShareUrl?: string;
  potentialReward?: {
    promoPoints?: number;
    gems?: number;
    tickets?: number;
    condition?: string;
  };
}

const ACTIVE_REFERRER_KEY = 'promorang_active_referrer';

export function captureReferralFromUrl(): string | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref') || urlParams.get('r');
    if (ref) {
      localStorage.setItem(ACTIVE_REFERRER_KEY, ref);
      return ref;
    }
    return localStorage.getItem(ACTIVE_REFERRER_KEY);
  } catch {
    return null;
  }
}

export function buildPromoShareUrl(
  objectType: ShareableObjectType,
  objectId: string,
  slugOrPath?: string,
  userRefCode?: string
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://promorang.co';
  const refCode = String(userRefCode || '').trim();

  let basePath = '';
  switch (objectType) {
    case 'perk':
      basePath = `/discover?tab=perks&perk=${objectId}`;
      break;
    case 'discovery':
      basePath = slugOrPath ? `/discoveries/${slugOrPath}` : `/d/${objectId}`;
      break;
    case 'moment':
      basePath = slugOrPath ? `/moments/${slugOrPath}` : `/moments/${objectId}`;
      break;
    case 'mission':
      basePath = `/missions/${objectId}`;
      break;
    case 'piece':
      basePath = `/portfolio`;
      break;
    case 'creator':
      basePath = slugOrPath ? `/creators/${slugOrPath}` : `/creators`;
      break;
    default:
      basePath = `/discover`;
  }

  const params = new URLSearchParams();
  if (refCode) params.set('ref', refCode);
  params.set('ps_src', objectType);
  params.set('ps_id', objectId);
  const separator = basePath.includes('?') ? '&' : '?';
  return `${origin}${basePath}${separator}${params.toString()}`;
}

export function shareViaWhatsApp(title: string, url: string): void {
  const text = `${title}\n\nCheck this out on Promorang: ${url}`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

export function shareViaTwitter(title: string, url: string): void {
  const text = `${title} on @Promorang`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}
