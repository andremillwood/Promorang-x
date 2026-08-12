import { useCallback, useEffect, useState } from 'react';
import { feedApi } from '@/lib/api';
import { feedObjectHref, type FeedItem, type FeedObjectType } from '@promorang/shared';

export type LivingFeedItem = {
  id: string;
  type: 'moment' | 'content' | 'product' | 'offer' | 'piece' | 'promoshare_draw' | 'promoshare_receipt';
  title: string;
  description?: string | null;
  image?: string | null;
  eyebrow: string;
  meta?: string;
  href: string;
  price?: number | null;
  change?: number | null;
  returnLabel?: string;
  reasonLabels?: string[];
  score?: number;
  authorId?: string | null;
};

const mobileType = (item: FeedItem | any): LivingFeedItem['type'] => {
  const type = item.object_type || item.type;
  if (type === 'event' || type === 'moment') return 'moment';
  if (type === 'coupon' || type === 'offer') return 'offer';
  if (type === 'product') return 'product';
  if (type === 'piece') return 'piece';
  if (type === 'promoshare_draw') return 'promoshare_draw';
  if (type === 'promoshare_receipt') return 'promoshare_receipt';
  return 'content';
};

const mobileHref = (item: any, type: LivingFeedItem['type']) => {
  const id = String(item.entity_id || item.id);
  return feedObjectHref(type as FeedObjectType, id, 'mobile');
};

const normalize = (item: any): LivingFeedItem => {
  const type = mobileType(item);
  const context = item.context || {};
  const reasons = Array.isArray(item.reason_labels) ? item.reason_labels : [];
  const eyebrow = reasons[0]
    || ({ moment: 'LIVE MOMENT', offer: 'OFFER FOR YOU', product: 'FROM THE SCENE', piece: 'OWN THE MOMENTUM', content: 'FROM A MOMENT', promoshare_draw: 'PROMOSHARE DRAW', promoshare_receipt: 'TICKET RECEIPT' } as const)[type];

  return {
    id: String(item.entity_id || item.id),
    type,
    title: item.title || 'Recommended for you',
    description: item.description,
    image: item.image_url || item.media_url || item.image,
    eyebrow: eyebrow.toUpperCase(),
    meta: context.location_name || context.venue_name || context.brand_name || item.merchant_name || item.subtitle,
    href: mobileHref(item, type),
    price: item.price ?? item.current_price ?? null,
    change: item.change_24h ?? null,
    returnLabel: context.reward_label || reasons.slice(1).join(' · ') || (type === 'piece' ? 'Track performance' : 'Open what is moving'),
    reasonLabels: reasons,
    score: item.score,
    authorId: item.creator_id || item.owner_user_id || item.user_id || item.host_id || item.relayer_user_id || item.content_items?.creator_id || null,
  };
};

const DEMO_FEED_ITEMS: LivingFeedItem[] = [
  {
    id: 'demo-1',
    type: 'moment',
    title: 'Austin Rooftop Sunset Listening Party',
    description: 'Exclusive unreleased track preview, live vinyl set, and complimentary craft refreshments on the downtown rooftop.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=85',
    eyebrow: 'LIVE MOMENT',
    meta: 'Downtown Austin, TX · Hosted by Velvet Sound',
    href: '/moment/demo-1',
    returnLabel: 'Join moment',
    reasonLabels: ['TRENDING NEAR YOU', '250 GEMS POOL'],
    score: 98,
  },
  {
    id: 'demo-coupon-1',
    type: 'offer',
    title: '20% Off Artisanal Coffee & Pastry Pass',
    description: 'Valid for in-person redemption at Black Star Roasters. Scan your QR pass at the counter.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=85',
    eyebrow: 'MERCHANT COUPON',
    meta: 'Black Star Roasters · East Austin',
    href: '/merchant/scan',
    price: 15,
    returnLabel: 'Claim QR Coupon',
    reasonLabels: ['EXCLUSIVE OFFER', 'LIMITED QUANTITY'],
    score: 96,
  },
  {
    id: 'demo-creator-1',
    type: 'content',
    title: 'Behind the Scenes: Austin Vinyl Culture',
    description: 'Watch the full video drop by @alex_vlog linked directly to the Rooftop Vinyl Moment.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=85',
    eyebrow: 'CREATOR DROP',
    meta: 'By @alex_vlog · Creator Link',
    href: '/pieces/content/demo-c1',
    returnLabel: 'Watch content & claim bounty',
    reasonLabels: ['FEATURED CREATOR', 'BOUNTY ACTIVE'],
    score: 94,
  },
  {
    id: 'demo-product-1',
    type: 'product',
    title: 'Handcrafted Vintage Leather Camera Strap',
    description: 'Limited edition hand-stitched camera strap made locally for Scene photographers.',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=85',
    eyebrow: 'MERCHANT PRODUCT',
    meta: 'CraftWorks Studio · Local Merchant',
    href: '/catalog',
    price: 45,
    returnLabel: 'Shop Product',
    reasonLabels: ['LOCAL CRAFT', 'IN STOCK'],
    score: 91,
  },
  {
    id: 'demo-brand-1',
    type: 'promoshare_draw',
    title: 'Red Bull High Energy Culture Challenge',
    description: 'Brands & Creators: Share your high-energy moment to earn from a 5,000 Gem brand pool.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=85',
    eyebrow: 'BRAND CAMPAIGN',
    meta: 'Sponsored by Red Bull · 5,000 Gems Reserve',
    href: '/create-proposal',
    price: 100,
    returnLabel: 'Participate in Brief',
    reasonLabels: ['BRAND ACTIVATION', 'HIGH PAYOUT'],
    score: 95,
  },
  {
    id: 'demo-piece-1',
    type: 'piece',
    title: 'Rooftop Vinyl Moment Piece',
    description: 'Polymarket/Robinhood-style momentum piece tracking live event turnout and sentiment volume.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85',
    eyebrow: 'PIECE LIQUIDITY',
    meta: '+18% 24h Yield · 1.8x Multiplier',
    href: '/pieces/moment/demo-p1',
    change: 18.4,
    returnLabel: 'Trade Piece Momentum',
    reasonLabels: ['HIGH VOLUME', '1.8X MULTIPLIER'],
    score: 90,
  },
];

export function useLivingFeed(intent: 'nearby' | 'tonight' | 'earn' | null = null) {
  const [items, setItems] = useState<LivingFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await feedApi.getForYou(intent, 24);
      const feedItems = (response.data?.feed || []).map(normalize);
      if (feedItems.length > 0) {
        setItems(feedItems);
      } else {
        setItems(DEMO_FEED_ITEMS);
      }
    } catch (requestError: any) {
      console.warn('Living feed API unavailable, displaying default feed items:', requestError?.message);
      setError(null);
      setItems(DEMO_FEED_ITEMS);
    } finally {
      setLoading(false);
    }
  }, [intent]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { items, loading, error, refresh };
}
