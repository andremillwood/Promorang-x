import { Perk, PerkClaimResult, PerkType } from '@/types/perk';
import { supabase } from '@/integrations/supabase/client';

export const CURATED_PERKS: Perk[] = [
  {
    id: 'perk-kingston-wings-20',
    title: '20% Off Legendary Jerk Wings Basket',
    description: 'Valid for dine-in or takeout during weekday lunch or evening sessions.',
    perkType: 'discount',
    merchantId: 'merchant-sweetwood',
    merchantName: 'Sweetwood Jerk Joint',
    merchantAvatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
    merchantLocation: 'Drumblair, Kingston 8',
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 100,
    remainingQuantity: 42,
    discountType: 'percentage',
    discountValue: 20,
    rewardPoints: 50,
    rewardGems: 1,
    promoShareTickets: 1,
    category: 'Food & Drinks',
    claimRequirement: 'Vote in the Kingston Wings Discovery or Claim directly',
    terms: 'One redemption per customer. Cannot be combined with other offers. Valid until 30 days from claim.',
    redemptionMethod: 'qr_scan',
    redemptionCode: 'WINGS-SW20',
    objective: 'bring_new_customers',
    targetAudience: 'everyone',
    isFeatured: true,
  },
  {
    id: 'perk-fiction-vip-shots',
    title: 'Complimentary Welcome Tequila Shots for Two',
    description: 'Unlock complimentary signature shots before midnight on Friday or Saturday.',
    perkType: 'complimentary_item',
    merchantId: 'merchant-fiction',
    merchantName: 'Fiction Nightclub',
    merchantAvatar: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=120&auto=format&fit=crop&q=80',
    merchantLocation: 'Marketplace, Constant Spring Rd',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 50,
    remainingQuantity: 14,
    discountType: 'free_item',
    discountValue: 15,
    rewardPoints: 75,
    rewardGems: 2,
    promoShareTickets: 2,
    category: 'Nightlife',
    claimRequirement: 'RSVP to any Fiction Weekend Moment',
    terms: 'Must be 18+. Valid before 12:00 AM on scheduled event nights.',
    redemptionMethod: 'qr_scan',
    redemptionCode: 'FICTION-VIP2',
    objective: 'drive_attendance',
    targetAudience: 'new_customers',
    isFeatured: true,
  },
  {
    id: 'perk-tacbar-taco-upgrade',
    title: 'Buy 2 Tacos, Get 3rd Taco + Drink Free',
    description: 'Devon House gourmet Mexican fusion taco upgrade pass.',
    perkType: 'bundle',
    merchantId: 'merchant-tacbar',
    merchantName: 'Tacbar Devon House',
    merchantAvatar: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&auto=format&fit=crop&q=80',
    merchantLocation: 'Devon House Courtyard, Kingston',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 80,
    remainingQuantity: 28,
    discountType: 'free_item',
    discountValue: 12,
    rewardPoints: 40,
    rewardGems: 1,
    promoShareTickets: 1,
    category: 'Food & Drinks',
    claimRequirement: 'Free for all verified community members',
    terms: 'Valid Tuesday through Thursday. Show barcode at the register.',
    redemptionMethod: 'code_entry',
    redemptionCode: 'TACBAR-TACO3',
    objective: 'fill_slow_hours',
    targetAudience: 'repeat_regulars',
  },
  {
    id: 'perk-dub-club-express',
    title: 'Express Gate Entry & Free Herbal Punch',
    description: 'Skip the line at Sunday Kingston Dub Club skyline gathering.',
    perkType: 'access',
    merchantId: 'merchant-dubclub',
    merchantName: 'Kingston Dub Club',
    merchantAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80',
    merchantLocation: 'Skyline Drive, Jacks Hill',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 40,
    remainingQuantity: 9,
    discountType: 'free_item',
    discountValue: 20,
    rewardPoints: 100,
    rewardGems: 3,
    promoShareTickets: 2,
    category: 'Music & Culture',
    claimRequirement: 'PromoShare link sharing or 200 PromoPoints',
    terms: 'Valid on Sundays only from 8:00 PM to 2:00 AM.',
    redemptionMethod: 'merchant_validation',
    redemptionCode: 'DUB-EXPRESS',
    objective: 'build_awareness',
    targetAudience: 'vip_members',
    isFeatured: true,
  },
  {
    id: 'perk-chilitos-margarita',
    title: '2-for-1 Frozen Margaritas on Sunset Hours',
    description: 'Chill garden vibes and half-price drinks between 5:00 PM and 7:00 PM.',
    perkType: 'discount',
    merchantId: 'merchant-chilitos',
    merchantName: 'Chilitos JaMexican',
    merchantAvatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=80',
    merchantLocation: '88 Hope Rd, Kingston 6',
    imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 75,
    remainingQuantity: 33,
    discountType: 'percentage',
    discountValue: 50,
    rewardPoints: 60,
    rewardGems: 1,
    promoShareTickets: 1,
    category: 'Food & Drinks',
    claimRequirement: 'Instant claim for all participants',
    terms: 'Valid Monday through Friday 5-7pm. Limit one pass per visit.',
    redemptionMethod: 'qr_scan',
    redemptionCode: 'CHILI-MARG241',
    objective: 'fill_slow_hours',
    targetAudience: 'everyone',
  },
  {
    id: 'perk-midas-vip-pass',
    title: 'Exclusive VIP Fast-Track & Backstage Access Pass',
    description: 'Midas Weekend premier festival drop with priority entry & collector piece.',
    perkType: 'experience',
    merchantId: 'merchant-midas',
    merchantName: 'Midas Entertainment',
    merchantAvatar: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=120&auto=format&fit=crop&q=80',
    merchantLocation: 'Plantation Cove, St. Ann',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 25,
    remainingQuantity: 6,
    discountType: 'free_item',
    discountValue: 100,
    rewardPoints: 250,
    rewardGems: 10,
    promoShareTickets: 5,
    category: 'Festival & VIP',
    claimRequirement: 'Complete the Midas Content Mission or earn 500 PromoPoints',
    terms: 'Valid on festival weekend. Non-transferable once activated.',
    redemptionMethod: 'merchant_validation',
    redemptionCode: 'MIDAS-VIP-PASS',
    objective: 'reward_loyal',
    targetAudience: 'vip_members',
    isFeatured: true,
  }
];

const CLAIMED_PERKS_KEY = 'promorang_claimed_perks';
const SAVED_PERKS_KEY = 'promorang_saved_perks';
const REDEEMED_PERKS_KEY = 'promorang_redeemed_perks';
const CREATED_PERKS_KEY = 'promorang_merchant_created_perks';

export function getLocalClaimedPerkIds(): string[] {
  try {
    const raw = localStorage.getItem(CLAIMED_PERKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalSavedPerkIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_PERKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalRedeemedPerkIds(): string[] {
  try {
    const raw = localStorage.getItem(REDEEMED_PERKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalMerchantPerks(): Perk[] {
  try {
    const raw = localStorage.getItem(CREATED_PERKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMerchantPerk(perk: Perk): void {
  try {
    const existing = getLocalMerchantPerks();
    const updated = [perk, ...existing.filter((p) => p.id !== perk.id)];
    localStorage.setItem(CREATED_PERKS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save merchant perk locally', err);
  }
}

export function toggleSavePerk(perkId: string): boolean {
  const saved = getLocalSavedPerkIds();
  const index = saved.indexOf(perkId);
  let isSaved = false;
  if (index > -1) {
    saved.splice(index, 1);
    isSaved = false;
  } else {
    saved.push(perkId);
    isSaved = true;
  }
  localStorage.setItem(SAVED_PERKS_KEY, JSON.stringify(saved));
  return isSaved;
}

export function claimPerk(perk: Perk, userId?: string): PerkClaimResult {
  const claimed = getLocalClaimedPerkIds();
  if (!claimed.includes(perk.id)) {
    claimed.push(perk.id);
    localStorage.setItem(CLAIMED_PERKS_KEY, JSON.stringify(claimed));
  }

  const promoPointsAwarded = perk.rewardPoints || 25;
  const promoShareTicketsAwarded = perk.promoShareTickets || 1;

  // Track event in unified model
  recordLocalActivityEvent({
    eventType: 'perk.claimed',
    userId: userId || 'anonymous',
    targetId: perk.id,
    targetTitle: perk.title,
    rewardPoints: promoPointsAwarded,
    promoShareTickets: promoShareTicketsAwarded,
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    redemptionCode: perk.redemptionCode || `PRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    expiresAt: perk.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
    promoPointsAwarded,
    promoShareTicketsAwarded,
    message: `Perk Claimed! +${promoPointsAwarded} PromoPoints & +${promoShareTicketsAwarded} PromoShare Ticket added to your Vault.`,
  };
}

export function redeemPerk(perkId: string, code?: string): boolean {
  const redeemed = getLocalRedeemedPerkIds();
  if (!redeemed.includes(perkId)) {
    redeemed.push(perkId);
    localStorage.setItem(REDEEMED_PERKS_KEY, JSON.stringify(redeemed));

    recordLocalActivityEvent({
      eventType: 'perk.redeemed',
      userId: 'active_user',
      targetId: perkId,
      rewardPoints: 100,
      promoShareTickets: 3,
      timestamp: new Date().toISOString(),
    });
  }
  return true;
}

export interface ActivityEventRecord {
  eventType: string;
  userId: string;
  targetId: string;
  targetTitle?: string;
  rewardPoints?: number;
  rewardGems?: number;
  promoShareTickets?: number;
  timestamp: string;
}

const ACTIVITY_EVENTS_KEY = 'promorang_activity_events';

export function recordLocalActivityEvent(event: ActivityEventRecord): void {
  try {
    const raw = localStorage.getItem(ACTIVITY_EVENTS_KEY);
    const events: ActivityEventRecord[] = raw ? JSON.parse(raw) : [];
    events.unshift(event);
    localStorage.setItem(ACTIVITY_EVENTS_KEY, JSON.stringify(events.slice(0, 100)));
  } catch (err) {
    console.error('Error saving activity event', err);
  }
}

export function getLocalActivityEvents(): ActivityEventRecord[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Adapts raw database coupon rows into normalized Perk objects
 */
export function adaptCouponToPerk(row: any): Perk {
  return {
    id: row.id,
    title: row.title || row.code || 'Exclusive Merchant Perk',
    description: row.description || 'Special offer from our verified partner.',
    perkType: (row.discount_type === 'free_item' ? 'complimentary_item' : 'discount') as PerkType,
    merchantId: row.advertiser_account_id || row.store_id || row.merchant_id,
    merchantName: row.advertiser_name || row.store_name || 'Verified Merchant',
    merchantAvatar: row.advertiser_logo || undefined,
    merchantLocation: row.location || undefined,
    imageUrl: row.image_url || undefined,
    availableQuantity: row.max_uses || 100,
    remainingQuantity: Math.max(0, (row.max_uses || 100) - (row.uses_count || 0)),
    startsAt: row.starts_at || row.created_at,
    expiresAt: row.expires_at || undefined,
    claimRequirement: row.min_order_amount ? `Min spend $${row.min_order_amount}` : 'Open to all',
    redemptionMethod: 'qr_scan',
    redemptionCode: row.code || row.redemption_code,
    rewardPoints: 25,
    rewardGems: 1,
    promoShareTickets: 1,
    sourceType: 'coupon',
    sourceId: row.id,
    terms: row.terms_and_conditions || undefined,
    discountType: row.discount_type || 'percentage',
    discountValue: row.discount_value || row.discount_amount || 10,
    category: row.category || 'General',
  };
}

/**
 * Fetch all available perks (combining database coupons, user-created merchant perks, and curated drops)
 */
export async function fetchAllPerks(): Promise<Perk[]> {
  const claimedIds = new Set(getLocalClaimedPerkIds());
  const savedIds = new Set(getLocalSavedPerkIds());
  const redeemedIds = new Set(getLocalRedeemedPerkIds());
  const merchantCreated = getLocalMerchantPerks();

  let dbPerks: Perk[] = [];

  try {
    const { data, error } = await supabase
      .from('coupons' as any)
      .select('*')
      .eq('is_active', true)
      .limit(50);

    if (!error && data) {
      dbPerks = (data as any[]).map(adaptCouponToPerk);
    }
  } catch (err) {
    // If coupons table isn't accessible via client RLS or during demo, fallback gracefully
    console.debug('Using fallback perk inventory', err);
  }

  const allCombined = [...merchantCreated, ...CURATED_PERKS, ...dbPerks];
  const uniquePerksMap = new Map<string, Perk>();

  for (const perk of allCombined) {
    if (!uniquePerksMap.has(perk.id)) {
      uniquePerksMap.set(perk.id, {
        ...perk,
        userState: {
          isClaimed: claimedIds.has(perk.id),
          isSaved: savedIds.has(perk.id),
          isRedeemed: redeemedIds.has(perk.id),
        },
      });
    }
  }

  return Array.from(uniquePerksMap.values());
}
