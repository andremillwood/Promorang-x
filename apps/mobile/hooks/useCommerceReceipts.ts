import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export type CommerceReceipt = {
  id: string;
  receipt_type: 'claim' | 'reservation' | 'purchase' | 'redemption' | 'refund' | string;
  status: 'issued' | 'pending' | 'fulfilled' | 'cancelled' | 'refunded' | string;
  amount: number | string;
  currency: string;
  redemption_code?: string | null;
  occurred_at: string;
  attribution?: {
    source?: string;
    coupon_code?: string;
    coupon_status?: string;
    discount_type?: string;
    discount_value?: number;
    payment_method?: string;
    quantity?: number;
    [key: string]: unknown;
  } | null;
  merchant_products?: {
    name?: string | null;
    image_url?: string | null;
  } | null;
};

export function useCommerceReceipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<CommerceReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadReceipts() {
      if (!user) {
        setReceipts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('commerce_receipts')
        .select('*,merchant_products:listing_id(name,image_url)')
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false })
        .limit(30);

      if (!cancelled) {
        setReceipts((data || []) as CommerceReceipt[]);
        setLoading(false);
      }
    }

    loadReceipts();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { receipts, loading };
}
