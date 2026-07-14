import { useCallback, useEffect, useState } from 'react';
import { couponApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export type CouponWalletItem = {
  id: string;
  claim_code?: string | null;
  status: 'claimed' | 'redeemed' | 'expired' | string;
  created_at?: string;
  redeemed_at?: string | null;
  expires_at?: string | null;
  coupons?: {
    id: string;
    name?: string | null;
    description?: string | null;
    discount_type?: string | null;
    discount_value?: number | null;
    merchant_stores?: {
      store_name?: string | null;
      logo_url?: string | null;
    } | null;
  } | null;
};

export function useCouponWallet() {
  const { session } = useAuth();
  const [coupons, setCoupons] = useState<CouponWalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session?.access_token) {
      setCoupons([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await couponApi.getMyRedemptions();
      setCoupons(result.data?.redemptions || []);
    } catch (err: any) {
      setError(err.message || 'Could not load offers');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { coupons, loading, error, refresh };
}
