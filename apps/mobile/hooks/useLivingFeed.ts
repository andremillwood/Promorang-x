import { useCallback, useEffect, useState } from 'react';
import { feedApi } from '@/lib/api';

export type LivingFeedItem = {
  id: string;
  type: 'moment' | 'content' | 'product' | 'offer' | 'piece';
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

const mobileType = (item: any): LivingFeedItem['type'] => {
  const type = item.object_type || item.type;
  if (type === 'event' || type === 'moment') return 'moment';
  if (type === 'coupon' || type === 'offer') return 'offer';
  if (type === 'product') return 'product';
  if (type === 'piece') return 'piece';
  return 'content';
};

const mobileHref = (item: any, type: LivingFeedItem['type']) => {
  const id = String(item.entity_id || item.id);
  if (type === 'moment') return `/moment/${id}`;
  if (type === 'offer') return item.type === 'coupon' ? '/rewards' : `/product/${id}`;
  if (type === 'product') return `/product/${id}`;
  if (type === 'piece') return `/pieces/content/${id}`;
  return `/search?type=content&id=${id}`;
};

const normalize = (item: any): LivingFeedItem => {
  const type = mobileType(item);
  const context = item.context || {};
  const reasons = Array.isArray(item.reason_labels) ? item.reason_labels : [];
  const eyebrow = reasons[0]
    || ({ moment: 'LIVE MOMENT', offer: 'OFFER FOR YOU', product: 'FROM THE SCENE', piece: 'OWN THE MOMENTUM', content: 'FROM A MOMENT' } as const)[type];

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

export function useLivingFeed(intent: 'nearby' | 'tonight' | 'earn' | null = null) {
  const [items, setItems] = useState<LivingFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await feedApi.getForYou(intent, 24);
      setItems((response.data?.feed || []).map(normalize));
    } catch (requestError: any) {
      setError(requestError?.message || 'Could not refresh your feed');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [intent]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { items, loading, error, refresh };
}
